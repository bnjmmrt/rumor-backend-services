import { ConnectionManager } from '../database';
import { SponsorshipInquiry } from 'rumor-utils/shared/sponsorships/entities/sponsorship-inquiry.entity';
import { CreateSponsorshipInquiryDto, UpdateSponsorshipInquiryDto } from 'rumor-utils/shared/sponsorships/dtos/sponsorship-inquiry.dto';
import { NotFoundError } from 'rumor-utils/errors';
import { SponsorshipInquiryTargetSponsor } from 'rumor-utils/shared/sponsorships/entities/sponsorship-inquiry-target-sponsor.entity';
import { IsNull } from 'typeorm';

export class SponsorshipInquiryService {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
  }

  async create(dto: CreateSponsorshipInquiryDto): Promise<SponsorshipInquiry> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipInquiry);
    const targetSponsorRepository = connection.getRepository(SponsorshipInquiryTargetSponsor);
    
    const { inquirerUserId, sponsorshipOpportunityId, targetSponsors, ...rest } = dto;
    const inquiry = repository.create({
      ...rest,
      inquirer: { id: inquirerUserId },
      sponsorshipOpportunity: { id: sponsorshipOpportunityId }
    });
    
    const savedInquiry = await repository.save(inquiry);

    if (targetSponsors && targetSponsors.length > 0) {
      const targetSponsorAssociations = targetSponsors.map(ts => 
        targetSponsorRepository.create({
          sponsorshipInquiry: { id: savedInquiry.id },
          targetSponsor: { id: ts.targetSponsorId }
        })
      );
      await targetSponsorRepository.save(targetSponsorAssociations);
    }

    return this.findOne(savedInquiry.id);
  }

  async findAll(): Promise<SponsorshipInquiry[]> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipInquiry);
    return repository.find({
      where: { deletedAt: IsNull() },
      relations: ['sponsorshipOpportunity', 'inquirer', 'targetSponsors', 'targetSponsors.targetSponsor', 
        'sponsorshipOpportunity.event', 'sponsorshipOpportunity.event.owner', 'sponsorshipOpportunity.event.location'],
    });
  }

  async findOne(id: string): Promise<SponsorshipInquiry> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipInquiry);
    const inquiry = await repository.findOne({
      where: { 
        id,
        deletedAt: IsNull()
      },
      relations: ['sponsorshipOpportunity', 'inquirer', 'targetSponsors', 'targetSponsors.targetSponsor', 
        'sponsorshipOpportunity.event', 'sponsorshipOpportunity.event.owner', 'sponsorshipOpportunity.event.location'],
    });
    if (!inquiry) {
      throw new NotFoundError('Sponsorship inquiry not found');
    }
    return inquiry;
  }

  async update(id: string, dto: UpdateSponsorshipInquiryDto): Promise<SponsorshipInquiry> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipInquiry);
    const targetSponsorRepository = connection.getRepository(SponsorshipInquiryTargetSponsor);
    
    const inquiry = await this.findOne(id);
    
    // Update basic fields
    const { targetSponsors, ...rest } = dto;
    Object.assign(inquiry, rest);
    await repository.save(inquiry);

    // Handle target sponsor associations
    if (targetSponsors) {
      // Remove existing associations
      await targetSponsorRepository.softDelete({ sponsorshipInquiry: { id } });
      
      // Create new associations
      if (targetSponsors.length > 0) {
        const targetSponsorAssociations = targetSponsors.map(ts => 
          targetSponsorRepository.create({
            sponsorshipInquiry: { id },
            targetSponsor: { id: ts.targetSponsorId }
          })
        );
        await targetSponsorRepository.save(targetSponsorAssociations);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipInquiry);

    // Load the relations we need for cascading
    const inquiryWithRelations = await repository.findOne({
      where: { id },
      relations: ['targetSponsors']
    });

    if (!inquiryWithRelations) {
      throw new NotFoundError('Sponsorship inquiry not found');
    }

    await repository.softRemove(inquiryWithRelations);
  }
}

export default new SponsorshipInquiryService(); 