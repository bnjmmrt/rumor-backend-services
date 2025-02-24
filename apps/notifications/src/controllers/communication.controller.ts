import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommunicationService } from '../services/communication.service';

import {
  COMMUNICATION_SERVICE_NAME,
  EmailTemplatesResponse,
  GenericResponse,
  ListEmailTemplatesResponse,
  StatusResponse,
  VerifyResponse,
} from '../grpc/communication/communication.pb';
import {
  DeleteEmailTemplateRequestDto,
  EmailTemplateDto,
  RequestByIdDto,
  SendEmailFromTemplateRequestDto,
  SendInvitationMessagesRequestDto,
  SendTextMessageRequestDto,
  SendVerificationCodeRequestDto,
  VerifyCodeRequestDto,
} from '../dtos/communication.dto';

@Controller('communication')
export class CommunicationController {
  @Inject(CommunicationService)
  private readonly service: CommunicationService;

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'SendVerificationCode')
  private async sendVerificationCode(payload: SendVerificationCodeRequestDto): Promise<GenericResponse> {
    return this.service.sendVerificationCode(payload);
  }

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'VerifyCode')
  private async verifyCode(payload: VerifyCodeRequestDto): Promise<VerifyResponse> {
    return this.service.verifyCode(payload);
  }

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'SendInvitationMessages')
  private async sendInvitationMessages(payload: SendInvitationMessagesRequestDto): Promise<StatusResponse> {
    this.service.sendInvitationMessages(payload);
    return {
      success: true,
    };
  }

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'SendTextMessage')
  private async sendTextMessage(payload: SendTextMessageRequestDto): Promise<StatusResponse> {
    this.service.sendTextMessage(payload);
    return {
      success: true,
    };
  }

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'SendEmailFromTemplate')
  private async sendEmailFromTemplate(payload: SendEmailFromTemplateRequestDto): Promise<GenericResponse> {
    return this.service.sendEmailFromTemplate(payload);
  }

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'CreateEmailTemplate')
  private async createEmailTemplate(payload: EmailTemplateDto): Promise<GenericResponse> {
    return this.service.createEmailTemplate(payload);
  }

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'ListEmailTemplates')
  private async listEmailTemplates(): Promise<ListEmailTemplatesResponse> {
    return this.service.listEmailTemplates();
  }

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'DeleteEmailTemplate')
  private async deleteEmailTemplate(payload: DeleteEmailTemplateRequestDto): Promise<GenericResponse> {
    return this.service.deleteEmailTemplate(payload);
  }

  @GrpcMethod(COMMUNICATION_SERVICE_NAME, 'GetEmailTemplate')
  private async getEmailTemplate(payload: RequestByIdDto): Promise<EmailTemplatesResponse> {
    return this.service.getEmailTemplate(payload);
  }
}
