import { ConnectionManager } from '../database';
import { TargetIndustry } from 'rumor-utils/shared/industries/entities/target-industry.entity';
import {
  CreateTargetIndustryDto,
  UpdateTargetIndustryDto,
} from 'rumor-utils/shared/industries/dtos/target-industry.dto';
import { NotFoundError } from 'rumor-utils/errors';
import { IndustryCategory } from 'rumor-utils/shared/industries/entities/industry-category.entity';
import { IsNull } from 'typeorm';

export class TargetIndustryService {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
  }

  async create(dto: CreateTargetIndustryDto): Promise<TargetIndustry> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetIndustry);
    const categoryRepository = connection.getRepository(IndustryCategory);

    // First fetch the category
    const category = await categoryRepository.findOne({ where: { id: dto.industryCategoryId } });
    if (!category) {
      throw new NotFoundError('Industry category not found');
    }

    // Then create the target industry with the full category object
    const targetIndustry = repository.create({
      name: dto.name,
      industryCategory: category,
    });

    return repository.save(targetIndustry);
  }

  async findAll(): Promise<TargetIndustry[]> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetIndustry);
    return repository.find({
      where: { deletedAt: IsNull() },
      relations: ['industryCategory']
    });
  }

  async findOne(id: string): Promise<TargetIndustry> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetIndustry);

    const targetIndustry = await repository.findOne({ 
      where: { 
        id,
        deletedAt: IsNull()
      },
      relations: ['industryCategory']
    });
    if (!targetIndustry) {
      throw new NotFoundError('Target industry not found');
    }

    return targetIndustry;
  }

  async update(id: string, dto: UpdateTargetIndustryDto): Promise<TargetIndustry> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetIndustry);
    const categoryRepository = connection.getRepository(IndustryCategory);

    const targetIndustry = await this.findOne(id);

    if (dto.name) {
      targetIndustry.name = dto.name;
    }
    if (dto.industryCategoryId) {
      const category = await categoryRepository.findOne({ where: { id: dto.industryCategoryId } });
      if (!category) {
        throw new NotFoundError('Industry category not found');
      }
      targetIndustry.industryCategory = category;
    }

    return repository.save(targetIndustry);
  }

  async remove(id: string): Promise<void> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(TargetIndustry);

    await repository.softDelete({ id, deletedAt: IsNull() });
  }
}

export default new TargetIndustryService(); 