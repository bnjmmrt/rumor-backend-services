import { Request, Response, NextFunction } from 'express';
import culturalMomentService from '../services/cultural-moment.service';
import {
  CreateCulturalMomentDto,
  UpdateCulturalMomentDto,
  CulturalMomentResponseDto,
} from 'rumor-utils/shared/sponsorships/dtos/cultural-moment.dto';
import { CulturalMoment } from 'rumor-utils/shared/sponsorships/entities/cultural-moment.entity';
import { GetResponse } from 'rumor-utils/success';

// Wrapper to catch errors in async routeHandlers
const asyncWrapper = (asyncRouteHandler: Function) => (request: Request, response: Response, next: NextFunction) =>
  asyncRouteHandler(request, response, next).catch(next);

const toCulturalMomentDto = (culturalMoment: CulturalMoment): CulturalMomentResponseDto => ({
  ...culturalMoment
});

export class CulturalMomentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const dto: CreateCulturalMomentDto = req.body;
      const culturalMoment = await culturalMomentService.create(dto);
      const response = toCulturalMomentDto(culturalMoment);
      res.status(201).json(response);
    })(req, res, next);
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const culturalMoments = await culturalMomentService.findAll();
      const response = culturalMoments.map(toCulturalMomentDto);
      const successResponse = new GetResponse(response, 'Cultural moments retrieved successfully');
      res.status(successResponse.statusCode).json(successResponse);
    })(req, res, next);
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const culturalMoment = await culturalMomentService.findOne(id);
      const response = toCulturalMomentDto(culturalMoment);
      const successResponse = new GetResponse(response, 'Cultural moment retrieved successfully');
      res.status(successResponse.statusCode).json(successResponse);
    })(req, res, next);
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const dto: UpdateCulturalMomentDto = req.body;
      const culturalMoment = await culturalMomentService.update(id, dto);
      const response = toCulturalMomentDto(culturalMoment);
      res.json(response);
    })(req, res, next);
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      await culturalMomentService.remove(id);
      res.status(204).send();
    })(req, res, next);
  }
} 