import { ConnectionManager } from '../database';
import { SponsorshipCategory } from 'rumor-utils/shared/sponsorships/entities/sponsorship-category.entity';
import { TargetSponsor } from 'rumor-utils/shared/sponsorships/entities/target-sponsor.entity';
import {
  CreateSponsorshipCategoryDto,
  UpdateSponsorshipCategoryDto,
} from 'rumor-utils/shared/sponsorships/dtos/sponsorship-category.dto';
import { NotFoundError } from 'rumor-utils/errors';

export class SponsorshipCategoryService {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
  }

  async create(dto: CreateSponsorshipCategoryDto): Promise<SponsorshipCategory> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipCategory);
    const category = repository.create(dto);
    return repository.save(category);
  }

  async findAll(): Promise<SponsorshipCategory[]> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipCategory);
    return await repository.find({
      where: { deletedAt: null },
      relations: ['targetSponsors'],
    });
  }

  async findOne(id: string): Promise<SponsorshipCategory> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipCategory);
    const category = await repository.findOne({ 
      where: { 
        id,
        deletedAt: null
      },
      relations: ['targetSponsors'],
    });
    if (!category) {
      throw new NotFoundError('Sponsorship category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateSponsorshipCategoryDto): Promise<SponsorshipCategory> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipCategory);
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return repository.save(category);
  }

  async remove(id: string): Promise<void> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(SponsorshipCategory);
    
    // Load the relations we need for cascading
    const categoryWithRelations = await repository.findOne({
      where: { id },
      relations: ['targetSponsors', 'targetSponsors.sponsorshipOpportunities', 'targetSponsors.sponsorshipInquiries']
    });

    if (!categoryWithRelations) {
      throw new NotFoundError('Sponsorship category not found');
    }

    await repository.softRemove(categoryWithRelations);
  }
}

export default new SponsorshipCategoryService();
