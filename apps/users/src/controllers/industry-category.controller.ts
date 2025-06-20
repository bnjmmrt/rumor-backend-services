import { Request, Response, NextFunction } from 'express';
import industryCategoryService from '../services/industry-category.service';
import {
  CreateIndustryCategoryDto,
  UpdateIndustryCategoryDto,
  IndustryCategoryResponseDto,
} from 'rumor-utils/shared/industries/dtos/industry-category.dto';
import {
  TargetIndustryResponseDto
} from 'rumor-utils/shared/industries/dtos/target-industry.dto';

// Wrapper to catch errors in async routeHandlers
const asyncWrapper = (asyncRouteHandler: Function) => (request: Request, response: Response, next: NextFunction) =>
  asyncRouteHandler(request, response, next).catch(next);

const mapToTargetIndustryDto = (industry: any, categoryId: string): TargetIndustryResponseDto => ({
  id: industry.id,
  name: industry.name,
  industryCategoryId: categoryId,
  createdAt: industry.createdAt,
  updatedAt: industry.updatedAt,
  deletedAt: industry.deletedAt,
});

const mapToIndustryCategoryResponseDto = (category: any): IndustryCategoryResponseDto => ({
  id: category.id,
  name: category.name,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  deletedAt: category.deletedAt,
  targetIndustries: category.targetIndustries?.map((industry: any) => mapToTargetIndustryDto(industry, category.id)) || [],
});

export class IndustryCategoryController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const dto: CreateIndustryCategoryDto = req.body;
      const category = await industryCategoryService.create(dto);
      const response = mapToIndustryCategoryResponseDto(category);
      res.status(201).json(response);
    })(req, res, next);
  }

  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const categories = await industryCategoryService.findAll();
      const response = categories.map(mapToIndustryCategoryResponseDto);
      res.status(200).json(response);
    })(req, res, next);
  }

  static async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const category = await industryCategoryService.findOne(id);
      const response = mapToIndustryCategoryResponseDto(category);
      res.status(200).json(response);
    })(req, res, next);
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const dto: UpdateIndustryCategoryDto = req.body;
      const category = await industryCategoryService.update(id, dto);
      const response = mapToIndustryCategoryResponseDto(category);
      res.status(200).json(response);
    })(req, res, next);
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const { id } = req.params;
      await industryCategoryService.remove(id);
      res.status(204).send();
    })(req, res, next);
  }
}
