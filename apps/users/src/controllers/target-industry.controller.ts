import { Request, Response, NextFunction } from 'express';
import targetIndustryService from '../services/target-industry.service';
import {
  CreateTargetIndustryDto,
  UpdateTargetIndustryDto,
  TargetIndustryResponseDto,
} from 'rumor-utils/shared/industries/dtos/target-industry.dto';

// Wrapper to catch errors in async routeHandlers
const asyncWrapper = (asyncRouteHandler: Function) => (request: Request, response: Response, next: NextFunction) =>
  asyncRouteHandler(request, response, next).catch(next);

const toTargetIndustryResponseDto = (targetIndustry: any): TargetIndustryResponseDto => ({
  id: targetIndustry.id,
  name: targetIndustry.name,
  industryCategoryId: targetIndustry.industryCategory.id,
  createdAt: targetIndustry.createdAt,
  updatedAt: targetIndustry.updatedAt,
  deletedAt: targetIndustry.deletedAt,
});

export class TargetIndustryController {
  static async create(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const dto: CreateTargetIndustryDto = req.body;
      const targetIndustry = await targetIndustryService.create(dto);
      const response = toTargetIndustryResponseDto(targetIndustry);
      res.status(201).json(response);
    })(req, res, next);
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const targetIndustries = await targetIndustryService.findAll();
      const response = targetIndustries.map(toTargetIndustryResponseDto);
      res.json(response);
    })(req, res, next);
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const targetIndustry = await targetIndustryService.findOne(id);
      const response = toTargetIndustryResponseDto(targetIndustry);
      res.json(response);
    })(req, res, next);
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const dto: UpdateTargetIndustryDto = req.body;
      const targetIndustry = await targetIndustryService.update(id, dto);
      const response = toTargetIndustryResponseDto(targetIndustry);
      res.json(response);
    })(req, res, next);
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      await targetIndustryService.remove(id);
      res.status(204).send();
    })(req, res, next);
  }
} 