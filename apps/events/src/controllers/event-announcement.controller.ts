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
import { GetResponse, CreateResponse } from "rumor-utils/success";

export class EventAnnouncementController {

  public static getGuestListForAnnoucement = asyncWrapper(async (req:Request ,res: Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      announcementId: req.params.announcementId,
      ticketType: req.query.ticketType,
      addedBy: req.query.addedBy,
    }
    const announcementGuestList = await EventAnnouncementService.getAnnouncementGuestList(payload)
    res.json(new GetResponse(announcementGuestList));
  })        
  
  public static postAnnoucement = asyncWrapper(async (req:Request, res: Response) => {
    const payload: any = {
      eventId: req.params.eventId,
      ticketType: req.body.ticketType,
      addedBy: req.body.addedBy,
      recepients: req.body.recepients,
      announcement: req.body.announcement,
      attachments: req.body.attachments,
    }
    const announcement = await EventAnnouncementService.postAnnouncement(payload)
    res.json(new CreateResponse(announcement));
  })

  static async updateAnnouncement(){
    //return AuthService.getMembers(payload);
  }
}
