import { ConnectionManager } from '../database';
import { CulturalMoment } from 'rumor-utils/shared/sponsorships/entities/cultural-moment.entity';
import {
  CreateCulturalMomentDto,
  UpdateCulturalMomentDto,
} from 'rumor-utils/shared/sponsorships/dtos/cultural-moment.dto';
import { NotFoundError } from 'rumor-utils/errors';
import { SponsorshipOpportunity } from 'rumor-utils/shared/sponsorships/entities/sponsorship-opportunity.entity';

export class CulturalMomentService {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
  }

  async create(dto: CreateCulturalMomentDto): Promise<CulturalMoment> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(CulturalMoment);

    const culturalMoment = repository.create({
      name: dto.name,
    });

    return repository.save(culturalMoment);
  }

  async findAll(): Promise<CulturalMoment[]> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(CulturalMoment);
    return repository.find({
      where: { deletedAt: null }
    });
  }

  async findOne(id: string): Promise<CulturalMoment> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(CulturalMoment);

    const culturalMoment = await repository.findOne({ 
      where: { 
        id,
        deletedAt: null
      } 
    });
    if (!culturalMoment) {
      throw new NotFoundError('Cultural moment not found');
    }

    return culturalMoment;
  }

  async update(id: string, dto: UpdateCulturalMomentDto): Promise<CulturalMoment> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(CulturalMoment);

    const culturalMoment = await this.findOne(id);
    Object.assign(culturalMoment, dto);

    return repository.save(culturalMoment);
  }

  async remove(id: string): Promise<void> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(CulturalMoment);
    const opportunityRepository = connection.getRepository(SponsorshipOpportunity);

    // Load the cultural moment with its relationships
    const culturalMoment = await repository.findOne({
      where: { id },
      relations: ['sponsorshipOpportunities']
    });

    if (!culturalMoment) {
      throw new NotFoundError('Cultural moment not found');
    }

    // Set culturalMoment to null for all related opportunities
    if (culturalMoment.sponsorshipOpportunities?.length > 0) {
      await opportunityRepository
        .createQueryBuilder()
        .update(SponsorshipOpportunity)
        .set({ culturalMoment: null })
        .where('cultural_moment_id = :id', { id })
        .execute();
    }

    // Now soft remove the cultural moment
    await repository.softRemove(culturalMoment);
  }
}

export default new CulturalMomentService(); 