import { Request, Response, NextFunction } from 'express';
import sponsorshipOpportunityService from '../services/sponsorship-opportunity.service';
import {
  CreateSponsorshipOpportunityDto,
  UpdateSponsorshipOpportunityDto,
  SponsorshipOpportunityResponseDto,
  SimplifiedEventResponseDto,
} from 'rumor-utils/shared/sponsorships/dtos/sponsorship-opportunity.dto';
import { GetResponse } from 'rumor-utils/success';
import asyncWrapper from '../server/helpers/asyncWrapper';

// Utility function to map sponsorship opportunity to the DTO
const mapToSponsorshipOpportunityResponseDto = (opportunity: any): SponsorshipOpportunityResponseDto => ({
  ...opportunity,
  targetSponsors: opportunity.targetSponsors?.map(sots => ({
    targetSponsorId: sots.targetSponsor.id,
    name: sots.targetSponsor.name,
    isExcluded: sots.isExcluded,
  })) || [],  
  culturalMoment: opportunity.culturalMoment ? {
    id: opportunity.culturalMoment.id,
    name: opportunity.culturalMoment.name
  } : undefined,  
  inquiries: opportunity.inquiries?.map(inq => ({
    id: inq.id,
    inquirerId: inq.inquirer?.id
  })) || [],  
});

export class SponsorshipOpportunityController {
  static async create(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const dto: CreateSponsorshipOpportunityDto = req.body;
      const opportunity = await sponsorshipOpportunityService.create(dto);
      const response = mapToSponsorshipOpportunityResponseDto(opportunity);
      res.status(201).json(response);
    })(req, res, next);
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const opportunities = await sponsorshipOpportunityService.findAll();
      const response = opportunities.map(mapToSponsorshipOpportunityResponseDto);
      res.json(response);
    })(req, res, next);
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const opportunity = await sponsorshipOpportunityService.findOne(id);
      const response = mapToSponsorshipOpportunityResponseDto(opportunity);
      res.json(response);
    })(req, res, next);
  }

  static async findOneForHost(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const userId = (req as any).user;
      const opportunity = await sponsorshipOpportunityService.findOneForHost(id, userId);
      const response = mapToSponsorshipOpportunityResponseDto(opportunity);
      res.json(response);
    })(req, res, next);
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      const dto: UpdateSponsorshipOpportunityDto = req.body;
      const opportunity = await sponsorshipOpportunityService.update(id, dto);
      const response = mapToSponsorshipOpportunityResponseDto(opportunity);
      res.json(response);
    })(req, res, next);
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const { id } = req.params;
      await sponsorshipOpportunityService.remove(id);
      res.status(204).send();
    })(req, res, next);
  }

  static async findEventsWithSponsorships(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const events = await sponsorshipOpportunityService.findEventsWithSponsorships();
      const response = events.map(mapToSponsorshipOpportunityResponseDto);
      res.json(response);
    })(req, res, next);
  }

  static async findAvailableEvents(req: Request, res: Response, next: NextFunction) {
    return asyncWrapper(async () => {
      const hostId = req.query.hostId as string;
      const events: SimplifiedEventResponseDto[] = await sponsorshipOpportunityService.findAvailableEvents(hostId);
      res.json(events);
    })(req, res, next);
  }
}
