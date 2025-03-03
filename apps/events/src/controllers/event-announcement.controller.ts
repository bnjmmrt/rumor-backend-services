import { Request, Response } from 'express'
import { EventAnnouncementService } from '../services/event-announcement.service';
import asyncWrapper from "../server/helpers/asyncWrapper";
import { GetResponse, CreateResponse, UpdateResponse } from "rumor-utils/success";

export class EventAnnouncementController {

  public static getGuestListForAnnoucement = asyncWrapper(async (req:Request ,res: Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      ticketType: req.query.ticketType,
      addedBy: req.query.addedBy
    }
    const announcementGuestList = await EventAnnouncementService.getAnnouncementGuestList(payload)
    res.json(new GetResponse(announcementGuestList));
  })        
  
  public static postAnnouncement = asyncWrapper(async (req:Request, res:Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      ticketType: req.body.ticketType,
      addedBy: req.body.addedBy,
      recipients: req.body.recipients,
      announcement: req.body.announcement,
      attachments: req.body.attachments,
      createdBy:"e1c43ea3-1343-43a4-99fc-e02b7f8c4046"
    }
    const announcement = await EventAnnouncementService.postAnnouncement(payload)
    res.json(new CreateResponse(announcement));
  })

  public static updateAnnouncement = asyncWrapper(async(req:Request, res:Response)=> {
    const payload: any = {
      id: req.params.announcementId,
      eventId: req.params.eventId,
      announcement: req.body.announcement,
      attachments: req.body.attachments,
    }
    const updatedAnnouncement = await EventAnnouncementService.updateAnnouncement(payload)
    res.json(new UpdateResponse(""));
  })

  public static getAnnouncements = asyncWrapper(async(req:Request, res:Response) => {
    const payload: any = {
      eventId: req.params.eventId,
    }
    const announcements = await EventAnnouncementService.getAnnouncements(payload)
    res.json(new GetResponse(announcements));
  })

  public static getAnnouncement = asyncWrapper(async(req:Request, res:Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      id :req.params.announcementId
    }
    const announcement = await EventAnnouncementService.getAnnouncement(payload)
    res.json(new GetResponse(announcement));
  })

  public static deleteAnnouncement = asyncWrapper(async(req:Request, res:Response) => {
    const payload: any = {
      id: req.params.announcementId,
      eventId: req.params.eventId,
    }

    const deletedAnnouncement = await EventAnnouncementService.deleteAnnouncement(payload)
    res.json(new UpdateResponse(""));
  })

  public static getRecipientListForAnnoucement = asyncWrapper(async(req:Request, res:Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      announcementId: req.params.announcementId,
    }

    const recipientList = await EventAnnouncementService.getRecipientList(payload)
    res.json(new GetResponse(recipientList));
  })
  
}
