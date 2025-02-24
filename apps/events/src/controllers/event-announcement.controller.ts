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

export class EventAnnouncementController {

  public static async getGuestListForAnnoucement(payload: PaginatedRequestDto,res: Response){
    const announcementGuestList = await EventAnnouncementService.getAnnouncementGuestList(payload)
    res.json(announcementGuestList).status(200);
  }                
  
  static async postAnnoucement(payload: PaginatedRequestDto) {
    //return AuthService.getHosts(payload);
  }

  static async updateAnnouncement(){
    //return AuthService.getMembers(payload);
  }
}
