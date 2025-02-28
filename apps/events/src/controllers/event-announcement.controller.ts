import { Request, Response } from 'express'

import {
  AUTH_SERVICE_NAME,
  BasicHostProfileResponse,
  GetHostsResponse,
  GetMembersResponse,
  HostProfileResponse,
  MemberProfileResponse,
  SignUpResponse,
  TokenResponse,
} from 'rumor-utils/shared/users/grpc/auth/auth.pb'

import { IdRequestDto, PaginatedRequestDto, UserAndIdRequestDto } from 'rumor-utils/shared/users/dtos/shared.dto';
import { LoginRequestDto, AdminSignUpRequestDto, UpdateUserStatusRequestDto } from 'rumor-utils/shared/users/dtos/auth.dto';
import { UpdateHostProfileRequestDto } from 'rumor-utils/shared/users/dtos/admin.dto';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import { EventAnnouncementService } from '../services/event-announcement.service';
import asyncWrapper from "../server/helpers/asyncWrapper";
import { GetResponse, CreateResponse, UpdateResponse } from "rumor-utils/success";

export class EventAnnouncementController {

  public static getGuestListForAnnoucement = asyncWrapper(async (req:Request ,res: Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      ticketType: req.query.ticketType,
      addedBy: req.query.addedBy,
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
    console.log("🚀 ~ EventAnnouncementController ~ getAnnouncements=asyncWrapper ~ announcements:", announcements)
    res.json(new GetResponse(announcements));

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
