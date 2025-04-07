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
      await TwilioService.sendVerificationCode(payload);
      const successResponse = new CreateResponse({}, 'Code Sent Successfully');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static verifyCode = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: VerifyCodeRequestDto = req.body;
    const result = await TwilioService.verifyCode(payload);
    const successResponse = new GetResponse({ ...result }, 'Code verified');
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static sendInvitationMessages = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: SendInvitationMessagesRequestDto = req.body;
      await TwilioService.sendInvitationMessages(payload);
      const successResponse = new GetResponse({}, 'ok');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static sendTextMessage = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: SendTextMessageRequestDto = req.body;
      await TwilioService.sendTextMessage(payload);
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
      const response = await CommunicationService.createEmailTemplate(payload);
      const successResponse = new CreateResponse(response, 'Template created successfully');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static listEmailTemplates = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const response = await CommunicationService.listEmailTemplates();
      const successResponse = new GetResponse(response, 'Ok');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );

  public static deleteEmailTemplate = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: DeleteEmailTemplateRequestDto = req.body;
      const response = await CommunicationService.deleteEmailTemplate(payload);
      const deleteResponse = new DeleteResponse({}, 'Template Deleted Successfully');
      res.status(deleteResponse.statusCode).json(deleteResponse);
    },
  );

  public static getEmailTemplate = asyncWrapper(
    async (req: Request, res: Response): Promise<void> => {
      const payload: RequestByIdDto = req.body;
      const response = await CommunicationService.getEmailTemplate(payload);
      const successResponse = new GetResponse(response, 'Ok');
      res.status(successResponse.statusCode).json(successResponse);
    },
  );
}
