import { ConnectionManager } from '../database';
import { TargetSponsor } from 'rumor-utils/shared/sponsorships/entities/target-sponsor.entity';
import {
  CreateTargetSponsorDto,
  UpdateTargetSponsorDto,
} from 'rumor-utils/shared/sponsorships/dtos/target-sponsor.dto';
import { NotFoundError } from 'rumor-utils/errors';
import { SponsorshipCategory } from 'rumor-utils/shared/sponsorships/entities/sponsorship-category.entity';
import { IsNull } from 'typeorm';

export class TargetSponsorService {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
  }

  async create(dto: CreateTargetSponsorDto): Promise<TargetSponsor> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetSponsor);
    const categoryRepository = connection.getRepository(SponsorshipCategory);

    // First fetch the category
    const category = await categoryRepository.findOne({ where: { id: dto.sponsorshipCategoryId } });
    if (!category) {
      throw new NotFoundError('Sponsorship category not found');
    }

    // Then create the target sponsor with the full category object
    const targetSponsor = repository.create({
      name: dto.name,
      sponsorshipCategory: category,
    });

    return repository.save(targetSponsor);
  }

  async findAll(): Promise<TargetSponsor[]> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetSponsor);
    return repository.find({
      where: { deletedAt: IsNull() },
      relations: ['sponsorshipCategory']
    });
  }

  async findOne(id: string): Promise<TargetSponsor> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetSponsor);

    const targetSponsor = await repository.findOne({ 
      where: { 
        id,
        deletedAt: IsNull()
      },
      relations: ['sponsorshipCategory']
    });
    if (!targetSponsor) {
      throw new NotFoundError('Target sponsor not found');
    }

    return targetSponsor;
  }

  async update(id: string, dto: UpdateTargetSponsorDto): Promise<TargetSponsor> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetSponsor);
    const categoryRepository = connection.getRepository(SponsorshipCategory);

    const targetSponsor = await this.findOne(id);

    if (dto.name) {
      targetSponsor.name = dto.name;
    }
    if (dto.sponsorshipCategoryId) {
      const category = await categoryRepository.findOne({ where: { id: dto.sponsorshipCategoryId } });
      if (!category) {
        throw new NotFoundError('Sponsorship category not found');
      }
      targetSponsor.sponsorshipCategory = category;
    }

    return repository.save(targetSponsor);
  }

  async remove(id: string): Promise<void> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetSponsor);

    // Load the relations we need for cascading
    const targetSponsorWithRelations = await repository.findOne({
      where: { id },
      relations: ['sponsorshipOpportunities', 'sponsorshipInquiries']
    });

    await repository.softRemove(targetSponsorWithRelations);
  }
}

export default new TargetSponsorService(); 