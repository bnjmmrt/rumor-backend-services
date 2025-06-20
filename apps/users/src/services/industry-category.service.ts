import { ConnectionManager } from '../database';
import { IndustryCategory } from 'rumor-utils/shared/industries/entities/industry-category.entity';
import {
  CreateIndustryCategoryDto,
  UpdateIndustryCategoryDto,
} from 'rumor-utils/shared/industries/dtos/industry-category.dto';
import { NotFoundError } from 'rumor-utils/errors';

export class IndustryCategoryService {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
  }

  async create(dto: CreateIndustryCategoryDto): Promise<IndustryCategory> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(IndustryCategory);
    const category = repository.create(dto);
    return repository.save(category);
  }

  async findAll(): Promise<IndustryCategory[]> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(IndustryCategory);
    return await repository.find({
      where: { deletedAt: null },
      relations: ['targetIndustries'],
    });
  }

  async findOne(id: string): Promise<IndustryCategory> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(IndustryCategory);
    const category = await repository.findOne({ 
      where: { 
        id,
        deletedAt: null
      },
      relations: ['targetIndustries'],
    });
    if (!category) {
      throw new NotFoundError('Industry category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateIndustryCategoryDto): Promise<IndustryCategory> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(IndustryCategory);
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return repository.save(category);
  }

  async remove(id: string): Promise<void> {
    const connection = await this.connectionManager.initializeDbConnection();
    const repository = connection.getRepository(IndustryCategory);
    
    // Load the relations we need for cascading
    const categoryWithRelations = await repository.findOne({
      where: { id },
      relations: ['targetIndustries']
    });

    if (!categoryWithRelations) {
      throw new NotFoundError('Industry category not found');
    }

    await repository.softRemove(categoryWithRelations);
  }
}

export default new IndustryCategoryService();
