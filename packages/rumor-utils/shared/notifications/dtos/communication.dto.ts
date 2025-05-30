import { IsString, IsOptional, IsNotEmpty, IsArray, IsUUID } from 'class-validator';
import {
  DeleteEmailTemplateRequest,
  EmptyRequest,
  RequestById,
  SendEmailFromTemplateRequest,
  SendEmailRequest,
  SendInvitationMessagesRequest,
  SendTextMessageRequest,
  SendVerificationCodeRequest,
  SendPushNotificationRequest,
  VerifyCodeRequest,
} from '../grpc/communication/communication.pb';
import { EmailTemplate } from '@fusionauth/typescript-client';
import { ParamsEmailTemplatePayloadInterface } from '../interfaces/email-templates.interface';

export class SendEmailRequestDto implements SendEmailRequest {
  @IsOptional()
  @IsString()
  to?: string;
  @IsOptional()
  @IsString()
  from?: string;
  @IsOptional()
  @IsString()
  text?: string;
  @IsOptional()
  @IsString()
  html?: string;
  @IsOptional()
  @IsString()
  subject?: string;
  @IsOptional()
  @IsString()
  cc?: string;
  @IsOptional()
  @IsString()
  userId?: string;
}

export class SendVerificationCodeRequestDto implements SendVerificationCodeRequest {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class VerifyCodeRequestDto implements VerifyCodeRequest {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class SendInvitationMessagesRequestDto implements SendInvitationMessagesRequest {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  phoneNumbers: string[];
  @IsString()
  @IsNotEmpty()
  senderName: string;
}

export class SendTextMessageRequestDto implements SendTextMessageRequest {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SendEmailFromTemplateRequestDto implements SendEmailFromTemplateRequest {
  @IsString()
  @IsOptional()
  from?: string;
  @IsArray()
  @IsString({ each: true })
  to: string[];
  @IsArray()
  @IsNotEmpty()
  dynamicData: ParamsEmailTemplatePayloadInterface[];
  @IsString()
  @IsNotEmpty()
  template: string;
}

export class EmailTemplateDto implements EmailTemplate {
  @IsString()
  @IsNotEmpty()
  templateName: string;
  @IsString()
  @IsNotEmpty()
  templateSendgridId: string;
  @IsArray()
  @IsNotEmpty()
  params: [];
  @IsString()
  @IsOptional()
  id?: string;
}

export class EmptyRequestDto implements EmptyRequest {}

export class DeleteEmailTemplateRequestDto implements DeleteEmailTemplateRequest {
  @IsUUID()
  @IsNotEmpty()
  templateId: string;
}

export class RequestByIdDto implements RequestById {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class SendPushNotificationRequestDto implements SendPushNotificationRequest {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  tokens: string[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
