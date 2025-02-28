// import { Controller, Inject } from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';
// import { CommunicationService } from '../services/communication.service';

// import {
//   COMMUNICATION_SERVICE_NAME,
//   EmailTemplatesResponse,
//   GenericResponse,
//   ListEmailTemplatesResponse,
//   StatusResponse,
//   VerifyResponse,
// } from '../grpc/communication/communication.pb';
// import {
//   DeleteEmailTemplateRequestDto,
//   EmailTemplateDto,
//   RequestByIdDto,
//   SendEmailFromTemplateRequestDto,
//   SendInvitationMessagesRequestDto,
//   SendTextMessageRequestDto,
//   SendVerificationCodeRequestDto,
//   VerifyCodeRequestDto,
// } from '../dtos/communication.dto';

// @Controller('communication')
// export class CommunicationController {
//   @Inject(CommunicationService)
//   private readonly service: CommunicationService;

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'SendVerificationCode')
//   private async sendVerificationCode(payload: SendVerificationCodeRequestDto): Promise<GenericResponse> {
//     return this.service.sendVerificationCode(payload);
//   }

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'VerifyCode')
//   private async verifyCode(payload: VerifyCodeRequestDto): Promise<VerifyResponse> {
//     return this.service.verifyCode(payload);
//   }

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'SendInvitationMessages')
//   private async sendInvitationMessages(payload: SendInvitationMessagesRequestDto): Promise<StatusResponse> {
//     this.service.sendInvitationMessages(payload);
//     return {
//       success: true,
//     };
//   }

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'SendTextMessage')
//   private async sendTextMessage(payload: SendTextMessageRequestDto): Promise<StatusResponse> {
//     this.service.sendTextMessage(payload);
//     return {
//       success: true,
//     };
//   }

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'SendEmailFromTemplate')
//   private async sendEmailFromTemplate(payload: SendEmailFromTemplateRequestDto): Promise<GenericResponse> {
//     return this.service.sendEmailFromTemplate(payload);
//   }

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'CreateEmailTemplate')
//   private async createEmailTemplate(payload: EmailTemplateDto): Promise<GenericResponse> {
//     return this.service.createEmailTemplate(payload);
//   }

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'ListEmailTemplates')
//   private async listEmailTemplates(): Promise<ListEmailTemplatesResponse> {
//     return this.service.listEmailTemplates();
//   }

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'DeleteEmailTemplate')
//   private async deleteEmailTemplate(payload: DeleteEmailTemplateRequestDto): Promise<GenericResponse> {
//     return this.service.deleteEmailTemplate(payload);
//   }

//   @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'GetEmailTemplate')
//   private async getEmailTemplate(payload: RequestByIdDto): Promise<EmailTemplatesResponse> {
//     return this.service.getEmailTemplate(payload);
//   }
// }


import express from 'express';
import { asyncWrapper } from '../utils/asyncWrapper'; // Assuming you have this utility
import { CommunicationService } from '../services/communication.service';
import {
  GenericResponse,
  VerifyResponse,
  StatusResponse,
  ListEmailTemplatesResponse,
  EmailTemplatesResponse
} from '../grpc/communication/communication.pb';
import {
  SendVerificationCodeRequestDto,
  VerifyCodeRequestDto,
  SendInvitationMessagesRequestDto,
  SendTextMessageRequestDto,
  SendEmailFromTemplateRequestDto,
  EmailTemplateDto,
  DeleteEmailTemplateRequestDto,
  RequestByIdDto
} from '../dtos/communication.dto';

// Initialize router and service
const router = express.Router();
const communicationService = new CommunicationService();

// SendVerificationCode
const sendVerificationCode = asyncWrapper(
  async (req, res): Promise<void> => {
    const payload: SendVerificationCodeRequestDto = req.body;
    const response: GenericResponse = await communicationService.sendVerificationCode(payload);
    res.json(response);
  }
);

// VerifyCode
const verifyCode = asyncWrapper(
  async (req, res): Promise<void> => {
    const payload: VerifyCodeRequestDto = req.body;
    const response: VerifyResponse = await communicationService.verifyCode(payload);
    res.json(response);
  }
);

// SendInvitationMessages
const sendInvitationMessages = asyncWrapper(
  async (req, res): Promise<void> => {
    const payload: SendInvitationMessagesRequestDto = req.body;
    communicationService.sendInvitationMessages(payload);
    const response: StatusResponse = {
      success: true
    };
    res.json(response);
  }
);

// SendTextMessage
const sendTextMessage = asyncWrapper(
  async (req, res): Promise<void> => {
    const payload: SendTextMessageRequestDto = req.body;
    communicationService.sendTextMessage(payload);
    const response: StatusResponse = {
      success: true
    };
    res.json(response);
  }
);

// SendEmailFromTemplate
const sendEmailFromTemplate = asyncWrapper(
  async (req, res): Promise<void> => {
    const payload: SendEmailFromTemplateRequestDto = req.body;
    const response: GenericResponse = await communicationService.sendEmailFromTemplate(payload);
    res.json(response);
  }
);

// CreateEmailTemplate
const createEmailTemplate = asyncWrapper(
  async (req, res): Promise<void> => {
    const payload: EmailTemplateDto = req.body;
    const response: GenericResponse = await communicationService.createEmailTemplate(payload);
    res.json(response);
  }
);

// ListEmailTemplates
const listEmailTemplates = asyncWrapper(
  async (req, res): Promise<void> => {
    const response: ListEmailTemplatesResponse = await communicationService.listEmailTemplates();
    res.json(response);
  }
);

// DeleteEmailTemplate
const deleteEmailTemplate = asyncWrapper(
  async (req, res): Promise<void> => {
    const payload: DeleteEmailTemplateRequestDto = req.body;
    const response: GenericResponse = await communicationService.deleteEmailTemplate(payload);
    res.json(response);
  }
);

// GetEmailTemplate
const getEmailTemplate = asyncWrapper(
  async (req, res): Promise<void> => {
    const payload: RequestByIdDto = req.body;
    const response: EmailTemplatesResponse = await communicationService.getEmailTemplate(payload);
    res.json(response);
  }
);

// Set up routes
