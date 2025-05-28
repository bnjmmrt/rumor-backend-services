import { ConnectionManager } from '../database';
import { SponsorshipOpportunity } from 'rumor-utils/shared/sponsorships/entities/sponsorship-opportunity.entity';
import { SponsorshipOpportunityTargetSponsor } from 'rumor-utils/shared/sponsorships/entities/sponsorship-opportunity-target-sponsor.entity';
import { TargetSponsor } from 'rumor-utils/shared/sponsorships/entities/target-sponsor.entity';
import { CulturalMoment } from 'rumor-utils/shared/sponsorships/entities/cultural-moment.entity';
import {
  CreateSponsorshipOpportunityDto,
  UpdateSponsorshipOpportunityDto,
  SimplifiedEventResponseDto,
} from 'rumor-utils/shared/sponsorships/dtos/sponsorship-opportunity.dto';
import { NotFoundError } from 'rumor-utils/errors';
import { Event } from 'rumor-utils/shared/events/entities/event.entity';
import { Not, In, MoreThan, IsNull } from 'typeorm';
import { GuestStatus } from 'rumor-utils/shared/events/interfaces/event.interface';
import { toEvent } from 'rumor-utils/shared/events/mappers/events.mapper';

export class SponsorshipOpportunityService {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
  }

  async create(dto: CreateSponsorshipOpportunityDto): Promise<SponsorshipOpportunity> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipOpportunity);
    const eventRepository = connection.getRepository(Event);
    const targetSponsorRepository = connection.getRepository(TargetSponsor);
    const sotsRepository = connection.getRepository(SponsorshipOpportunityTargetSponsor);
    const culturalMomentRepository = connection.getRepository(CulturalMoment);

    // First fetch the event
    const event = await eventRepository.findOne({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Fetch cultural moment if provided
    let culturalMoment = undefined;
    if (dto.culturalMomentId) {
      culturalMoment = await culturalMomentRepository.findOne({ where: { id: dto.culturalMomentId } });
      if (!culturalMoment) {
        throw new NotFoundError('Cultural moment not found');
      }
    }

    // Create the sponsorship opportunity
    const opportunity = repository.create({
      description: dto.description,
      event: event,
      promoLink: dto.promoLink,
      opportunityType: dto.opportunityType,
      paidSponsorshipMinimum: dto.paidSponsorshipMinimum,
      paidSponsorshipMaximum: dto.paidSponsorshipMaximum,
      isDraft: dto.isDraft,
      culturalMoment: culturalMoment,
      imageUrl: dto.imageUrl,
      deckUrl: dto.deckUrl
    });

    const savedOpportunity = await repository.save(opportunity);

    // Handle target sponsor associations if provided
    if (dto.targetSponsors && dto.targetSponsors.length > 0) {
      for (const association of dto.targetSponsors) {
        const targetSponsor = await targetSponsorRepository.findOne({ where: { id: association.targetSponsorId } });
        if (!targetSponsor) {
          throw new NotFoundError(`Target sponsor with id ${association.targetSponsorId} not found`);
        }

        const sots = sotsRepository.create({
          sponsorshipOpportunity: savedOpportunity,
          targetSponsor: targetSponsor,
          isExcluded: association.isExcluded || false,
        });

        await sotsRepository.save(sots);
      }
    }

    return this.findOne(savedOpportunity.id);
  }

  async findAll(): Promise<SponsorshipOpportunity[]> {
    try {
      const connection = await this.connectionManager.initializeDbConnection();
      const repository = connection.getRepository(SponsorshipOpportunity);
      return repository.find({
        relations: ['event', 'event.location', 'event.eventType', 'targetSponsors', 'targetSponsors.targetSponsor', 'culturalMoment'],
        where: { deletedAt: null }
      });
    } catch (error) {
      console.error('Error in findAll service:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<SponsorshipOpportunity> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipOpportunity);

    const opportunity = await repository.findOne({ 
      where: { 
        id,
        deletedAt: null,
      },
      relations: ['event', 'event.location', 'event.eventType', 'event.owner', 'targetSponsors', 'targetSponsors.targetSponsor', 'culturalMoment', 'inquiries', 'inquiries.inquirer']
    });
    if (!opportunity) {
      throw new NotFoundError('Sponsorship opportunity not found');
    }

    return opportunity;
  }

  async findOneForHost(id: string, hostId: string): Promise<SponsorshipOpportunity> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipOpportunity);

    const opportunity = await repository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.event', 'event')
      .leftJoinAndSelect('event.location', 'location')
      .leftJoinAndSelect('event.eventType', 'eventType')
      .leftJoinAndSelect('event.owner', 'owner')
      .leftJoinAndSelect('opportunity.targetSponsors', 'targetSponsors')
      .leftJoinAndSelect('targetSponsors.targetSponsor', 'targetSponsor')
      .leftJoinAndSelect('opportunity.culturalMoment', 'culturalMoment')
      .leftJoinAndSelect('opportunity.inquiries', 'inquiry')
      .leftJoinAndSelect('inquiry.inquirer', 'inquirer', 'inquirer.id = :hostId', { hostId })
      .where('opportunity.id = :id', { id })
      .andWhere('opportunity.deletedAt IS NULL')
      .getOne();

    if (!opportunity) {
      throw new NotFoundError('Sponsorship opportunity not found');
    }

    return opportunity;
  }

  async update(id: string, dto: UpdateSponsorshipOpportunityDto): Promise<SponsorshipOpportunity> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipOpportunity);
    const sotsRepository = connection.getRepository(SponsorshipOpportunityTargetSponsor);
    const targetSponsorRepository = connection.getRepository(TargetSponsor);
    const culturalMomentRepository = connection.getRepository(CulturalMoment);

    const opportunity = await this.findOne(id);
    if (!opportunity) {
      throw new NotFoundError('Sponsorship opportunity not found');
    }

    // Create a copy of dto without relation fields
    const { eventId, culturalMomentId, targetSponsors, ...basicFields } = dto;
    
    // Update basic fields using Object.assign
    Object.assign(opportunity, basicFields);

    // Handle cultural moment update
    if (culturalMomentId !== undefined) {
      if (culturalMomentId === null) {
        opportunity.culturalMoment = null;
      } else {
        const culturalMoment = await culturalMomentRepository.findOne({ where: { id: culturalMomentId } });
        if (!culturalMoment) {
          throw new NotFoundError('Cultural moment not found');
        }
        opportunity.culturalMoment = culturalMoment;
      }
    }

    // Handle event update
    if (eventId) {
      const eventRepository = connection.getRepository(Event);
      const event = await eventRepository.findOne({ where: { id: eventId } });
      if (!event) {
        throw new NotFoundError('Event not found');
      }
      opportunity.event = event;
    }

    // Save the opportunity first
    const updatedOpportunity = await repository.save(opportunity);

    // Handle target sponsor associations if provided
    if (targetSponsors !== undefined) {
      // Soft delete existing associations
      await sotsRepository.softDelete({ sponsorshipOpportunity: { id: opportunity.id } });

      // Create new associations
      if (targetSponsors.length > 0) {
        for (const association of targetSponsors) {
          const targetSponsor = await targetSponsorRepository.findOne({ where: { id: association.targetSponsorId } });
          if (!targetSponsor) {
            throw new NotFoundError(`Target sponsor with id ${association.targetSponsorId} not found`);
          }

          const sots = sotsRepository.create({
            sponsorshipOpportunity: updatedOpportunity,
            targetSponsor: targetSponsor,
            isExcluded: association.isExcluded || false,
          });

          await sotsRepository.save(sots);
        }
      }
    }

    return this.findOne(updatedOpportunity.id);
  }

  async remove(id: string): Promise<void> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipOpportunity);

    // Load the relations we need for cascading
    const opportunityWithRelations = await repository.findOne({
      where: { id },
      relations: ['targetSponsors', 'inquiries']
    });

    if (!opportunityWithRelations) {
      throw new NotFoundError('Sponsorship opportunity not found');
    }

    await repository.softRemove(opportunityWithRelations);
  }

  async findEventsWithSponsorships(): Promise<SponsorshipOpportunity[]> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipOpportunity);

    const statusBlocklist = ['PENDING_STATUS', 'PAST_STATUS', 'DECLINED_STATUS', 'DRAFT_STATUS', 'CANCELLED_STATUS']

    const opportunities = await repository.find({
      where: { 
        deletedAt: null,        
        event: {
          startDate: MoreThan(new Date()),
          status: Not(In(statusBlocklist))
        }
      },
      relations: ['event', 'event.location', 'event.eventType', 'event.owner', 'targetSponsors', 'targetSponsors.targetSponsor', 'culturalMoment', 'inquiries', 'inquiries.inquirer']
    });

    return opportunities;
  }

  async findAvailableEvents(hostId?: string): Promise<SimplifiedEventResponseDto[]> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipOpportunity);
    const eventRepository = connection.getRepository(Event);

    // Get all events that have active sponsorship opportunities
    const opportunities = await repository.find({
      where: { deletedAt: null },
      relations: ['event'],
      select: {
        event: {
          id: true
        }
      }
    });

    // Get IDs of events that have active sponsorships
    const eventIdsWithSponsorships = opportunities.map(opp => opp.event.id);
    const statusBlocklist = ['PENDING_STATUS', 'PAST_STATUS', 'DECLINED_STATUS', 'DRAFT_STATUS', 'CANCELLED_STATUS']

    // Create the base query with all necessary relations
    const query = eventRepository
      .createQueryBuilder('event')
      .select(['event.id', 'event.name'])
      .where('event.deletedAt IS NULL')
      .andWhere('event.status NOT IN (:...blockedStatuses)', { blockedStatuses: statusBlocklist })
      .andWhere('event.startDate > :currentDate', { currentDate: new Date() });

    // Only add the NOT IN clause if there are events with sponsorships
    if (eventIdsWithSponsorships.length > 0) {
      query.andWhere('event.id NOT IN (:...eventIds)', { eventIds: eventIdsWithSponsorships });
    }

    // Add host ID filter if provided
    if (hostId) {
      query.andWhere('event.owner.id = :hostId', { hostId });
    }

    const events = await query.getMany();
    return events.map(event => ({
      id: event.id,
      name: event.name
    }));
  }
}

export default new SponsorshipOpportunityService();
