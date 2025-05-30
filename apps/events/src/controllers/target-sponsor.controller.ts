import { Request, Response, NextFunction } from 'express';
import targetSponsorService from '../services/target-sponsor.service';
import {
  CreateTargetSponsorDto,
  UpdateTargetSponsorDto,
  TargetSponsorResponseDto,
} from 'rumor-utils/shared/sponsorships/dtos/target-sponsor.dto';

// Wrapper to catch errors in async routeHandlers
const asyncWrapper = (asyncRouteHandler: Function) => (request: Request, response: Response, next: NextFunction) =>
  asyncRouteHandler(request, response, next).catch(next);

const toTargetSponsorResponseDto = (targetSponsor: any): TargetSponsorResponseDto => ({
  id: targetSponsor.id,
  name: targetSponsor.name,
  sponsorshipCategoryId: targetSponsor.sponsorshipCategory.id,
  createdAt: targetSponsor.createdAt,
  updatedAt: targetSponsor.updatedAt,
  deletedAt: targetSponsor.deletedAt,
});

export class TargetSponsorController {
  static async create(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const dto: CreateTargetSponsorDto = req.body;
      const targetSponsor = await targetSponsorService.create(dto);
      const response = toTargetSponsorResponseDto(targetSponsor);
      res.status(201).json(response);
    })(req, res, next);
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const targetSponsors = await targetSponsorService.findAll();
      const response = targetSponsors.map(toTargetSponsorResponseDto);
      res.json(response);
    })(req, res, next);
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const targetSponsor = await targetSponsorService.findOne(id);
      const response = toTargetSponsorResponseDto(targetSponsor);
      res.json(response);
    })(req, res, next);
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const dto: UpdateTargetSponsorDto = req.body;
      const targetSponsor = await targetSponsorService.update(id, dto);
      const response = toTargetSponsorResponseDto(targetSponsor);
      res.json(response);
    })(req, res, next);
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      await targetSponsorService.remove(id);
      res.status(204).send();
    })(req, res, next);
  }
} 