import { Request, Response } from 'express';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { CommunicationService } from '../services/communication.service';

// import {
//   GenericResponse,
//   VerifyResponse,
//   StatusResponse,
//   ListEmailTemplatesResponse,
//   EmailTemplatesResponse,
// } from "rumor-utils/shared/notifications/grpc/communication/communication.pb";

import {
  SendVerificationCodeRequestDto,
  VerifyCodeRequestDto,
  SendInvitationMessagesRequestDto,
  SendTextMessageRequestDto,
  SendEmailFromTemplateRequestDto,
  EmailTemplateDto,
  DeleteEmailTemplateRequestDto,
  RequestByIdDto,
} from 'rumor-utils/shared/notifications/dtos/communication.dto';
import { TwilioService } from '../utils/twilio';
import { CreateResponse, DeleteResponse, GetResponse } from 'rumor-utils/success';

export class CommunicationController {
  public static sendVerificationCode = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: SendVerificationCodeRequestDto = req.body;
      try {
        await TwilioService.sendVerificationCode(payload);
      } catch (e) {
        console.log("🚀 ~ CommunicationController sendVerificationCode ~ e: ", e)
      }
      const successResponse = new CreateResponse({}, 'Code Sent Successfully');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static verifyCode = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: VerifyCodeRequestDto = req.body;
    let result = {}
    try {
      result = await TwilioService.verifyCode(payload);
    } catch (e) {
      console.log("🚀 ~ CommunicationController verifyCode ~ e: ", e)
    }
    const successResponse = new GetResponse({ ...result }, 'Code verified');
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static sendInvitationMessages = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: SendInvitationMessagesRequestDto = req.body;
      try {
        await TwilioService.sendInvitationMessages(payload);
      } catch (e) {
        console.log("🚀 ~ CommunicationController sendInvitationMessages ~ e: ", e)
      }
      const successResponse = new GetResponse({}, 'ok');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static sendTextMessage = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: SendTextMessageRequestDto = req.body;
      try {
        await TwilioService.sendTextMessage(payload);
      } catch (e) {
        console.log("🚀 ~ CommunicationController sendTextMessage~ e: ", e)
      }
      const successResponse = new GetResponse({}, 'ok');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static sendEmailFromTemplate = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: SendEmailFromTemplateRequestDto = req.body;
      await CommunicationService.sendEmailFromTemplate(payload);
      const successResponse = new GetResponse({}, 'ok');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static createEmailTemplate = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: EmailTemplateDto = req.body;
      let response = null
      try {
        response = await CommunicationService.createEmailTemplate(payload);
      } catch (e) {
        console.log("🚀 ~ CommunicationController createEmailTemplate ~ e: ", e)
      }
      const successResponse = new CreateResponse(response, 'Template created successfully');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static listEmailTemplates = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      let response = null
      try {
        response = await CommunicationService.listEmailTemplates();
      } catch (e) {
        console.log("🚀 ~ CommunicationController listEmailTemplates ~ e: ", e)
      }
      const successResponse = new GetResponse(response, 'Ok');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static deleteEmailTemplate = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: DeleteEmailTemplateRequestDto = req.body;
      try {
        await CommunicationService.deleteEmailTemplate(payload);
      } catch (e) {
        console.log("🚀 ~ CommunicationController listEmailTemplates ~ e: ", e)
      }
      const deleteResponse = new DeleteResponse({}, 'Template Deleted Successfully');
      res.status(deleteResponse.statusCode).json(deleteResponse);
    },
  );

  public static getEmailTemplate = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: RequestByIdDto = req.body;
      let response = null
      try {
        response = await CommunicationService.getEmailTemplate(payload);
      } catch (e) {
        console.log("🚀 ~ CommunicationController listEmailTemplates ~ e: ", e)
      }
      const successResponse = new GetResponse(response, 'Ok');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );
}
