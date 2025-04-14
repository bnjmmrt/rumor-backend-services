import { Request, Response } from 'express';
import { EventAnnouncementService } from '../services/event-announcement.service';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { GetResponse, CreateResponse, UpdateResponse, DeleteResponse } from 'rumor-utils/success';

export class EventAnnouncementController {
  public static getGuestListForAnnoucement = asyncWrapper(async (req: Request, res: Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      ticketType: req.query.ticketType,
      addedBy: req.query.addedBy,
      take: req.query.take,
      skip: req.query.skip,
      findByName: req.query.findByName,
    };
    const announcementGuestList = await EventAnnouncementService.getAnnouncementGuestList(payload);
    const successResponse = new GetResponse(announcementGuestList);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static postAnnouncement = asyncWrapper(async (req: Request, res: Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      ticketType: req.body.ticketType,
      addedBy: req.body.addedBy,
      recipients: req.body.recipients,
      announcement: req.body.announcement,
      attachments: req.body.attachments,
      createdBy: (req as any).user,
    };
    const announcement = await EventAnnouncementService.postAnnouncement(payload);
    const successResponse = new CreateResponse(announcement);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static updateAnnouncement = asyncWrapper(async (req: Request, res: Response) => {
    const payload: any = {
      id: req.params.announcementId,
      eventId: req.params.eventId,
      announcement: req.body.announcement,
      attachments: req.body.attachments,
    };

    const updatedAnnouncement = await EventAnnouncementService.updateAnnouncement(payload);
    const successResponse = new UpdateResponse(updatedAnnouncement);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getAnnouncements = asyncWrapper(async (req: Request, res: Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      userId: (req as any).user || req.query.id,
      role: req.query.role,
    };
    const announcements = await EventAnnouncementService.getAnnouncements(payload);

    const successResponse = new GetResponse(announcements);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getAnnouncement = asyncWrapper(async (req: Request, res: Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      userId: (req as any).user,
      role: req.query.role,
      id: req.params.announcementId,
    };
    const announcement = await EventAnnouncementService.getAnnouncement(payload);

    const successResponse = new GetResponse(announcement);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static deleteAnnouncement = asyncWrapper(async (req: Request, res: Response) => {
    const payload: any = {
      id: req.params.announcementId,
      eventId: req.params.eventId,
    };

    const deletedAnnouncement = await EventAnnouncementService.deleteAnnouncement(payload);
    const successResponse = new DeleteResponse(deletedAnnouncement);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static getRecipientListForAnnoucement = asyncWrapper(
    async (req: Request, res: Response) => {
      const payload: any = {
        eventId: req.params.eventId,
        announcementId: req.params.announcementId,
        take: req.query.take,
        skip: req.query.skip,
        findByName: req.query.findByName,
      };

      const recipientList = await EventAnnouncementService.getRecipientList(payload);
      const successResponse = new GetResponse(recipientList);
      res.status(successResponse.statusCode).json(successResponse);
    },
  );
}
