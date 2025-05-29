import { Request, Response, NextFunction } from 'express';
import sponsorshipCategoryService from '../services/sponsorship-category.service';
import {
  CreateSponsorshipCategoryDto,
  UpdateSponsorshipCategoryDto,
  SponsorshipCategoryResponseDto,
} from 'rumor-utils/shared/sponsorships/dtos/sponsorship-category.dto';
import {
  TargetSponsorResponseDto
} from 'rumor-utils/shared/sponsorships/dtos/target-sponsor.dto';

// Wrapper to catch errors in async routeHandlers
const asyncWrapper = (asyncRouteHandler: Function) => (request: Request, response: Response, next: NextFunction) =>
  asyncRouteHandler(request, response, next).catch(next);

const mapToTargetSponsorDto = (sponsor: any, categoryId: string): TargetSponsorResponseDto => ({
  id: sponsor.id,
  name: sponsor.name,
  sponsorshipCategoryId: categoryId,
  createdAt: sponsor.createdAt,
  updatedAt: sponsor.updatedAt,
  deletedAt: sponsor.deletedAt,
});

const mapToSponsorshipCategoryResponseDto = (category: any): SponsorshipCategoryResponseDto => ({
  id: category.id,
  name: category.name,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  deletedAt: category.deletedAt,
  targetSponsors: category.targetSponsors?.map((sponsor: any) => mapToTargetSponsorDto(sponsor, category.id)) || [],
});

export class SponsorshipCategoryController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const dto: CreateSponsorshipCategoryDto = req.body;
      const category = await sponsorshipCategoryService.create(dto);
      const response = mapToSponsorshipCategoryResponseDto(category);
      res.status(201).json(response);
    })(req, res, next);
  }

  static async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const categories = await sponsorshipCategoryService.findAll();
      const response = categories.map(mapToSponsorshipCategoryResponseDto);
      res.status(200).json(response);
    })(req, res, next);
  }

  static async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const category = await sponsorshipCategoryService.findOne(id);
      const response = mapToSponsorshipCategoryResponseDto(category);
      res.status(200).json(response);
    })(req, res, next);
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const dto: UpdateSponsorshipCategoryDto = req.body;
      const category = await sponsorshipCategoryService.update(id, dto);
      const response = mapToSponsorshipCategoryResponseDto(category);
      res.status(200).json(response);
    })(req, res, next);
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    return asyncWrapper(async () => {
      const { id } = req.params;
      await sponsorshipCategoryService.remove(id);
      res.status(204).send();
    })(req, res, next);
  }
}
