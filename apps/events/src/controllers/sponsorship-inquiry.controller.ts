import { Request, Response, NextFunction } from 'express';
import sponsorshipInquiryService from '../services/sponsorship-inquiry.service';
import { 
  CreateSponsorshipInquiryDto, 
  UpdateSponsorshipInquiryDto,
  SponsorshipInquiryResponseDto
} from 'rumor-utils/shared/sponsorships/dtos/sponsorship-inquiry.dto';
import asyncWrapper from '../server/helpers/asyncWrapper';

const mapToResponseDto = (inquiry: any): SponsorshipInquiryResponseDto => ({
  ...inquiry,
  sponsorshipOpportunity: inquiry.sponsorshipOpportunity,
  targetSponsors: inquiry.targetSponsors?.map((ts: any) => ({
    targetSponsorId: ts.targetSponsor.id,
    name: ts.targetSponsor.name
  })) || [],
  inquirer: inquiry.inquirer,
});

export class SponsorshipInquiryController {
  static async create(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const dto: CreateSponsorshipInquiryDto = req.body;
      const result = await sponsorshipInquiryService.create(dto);
      res.status(201).json(mapToResponseDto(result));
    })(req, res, next);
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const results = await sponsorshipInquiryService.findAll();
      res.json(results.map(mapToResponseDto));
    })(req, res, next);
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const result = await sponsorshipInquiryService.findOne(id);
      res.json(mapToResponseDto(result));
    })(req, res, next);
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const dto: UpdateSponsorshipInquiryDto = req.body;
      const result = await sponsorshipInquiryService.update(id, dto);
      res.json(mapToResponseDto(result));
    })(req, res, next);
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      await sponsorshipInquiryService.remove(id);
      res.status(204).send();
    })(req, res, next);
  }
} 