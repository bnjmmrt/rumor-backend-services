import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import {
  DeleteEmailTemplateRequestDto,
  EmailTemplateDto,
  RequestByIdDto,
  SendEmailFromTemplateRequestDto,
  SendInvitationMessagesRequestDto,
  SendPushNotificationRequestDto,
  SendTextMessageRequestDto,
  SendVerificationCodeRequestDto,
  VerifyCodeRequestDto,
} from '../dtos/communication.dto';
import { EmailTemplatesResponse, GenericResponse, ListEmailTemplatesResponse, VerifyResponse } from '../grpc/communication/communication.pb';
import { ConfigService } from '@nestjs/config';
import { TWILIO_CONFIG_TOKEN, TwilioClient } from '@rumor/shared/twilio';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-templates.entity';

import * as sgMail from '@sendgrid/mail';
import { FirebaseNotificationsService } from '@rumor/shared/firebase-notifications/firebase-notifications.service';

const responses = {
  conflict: (message: string) => ({
    status: HttpStatus.CONFLICT,
    error: {
      type: 'conflict',
      message: message,
    },
  }),
  notFound: (message: string | null) => ({
    status: HttpStatus.NOT_FOUND,
    error: {
      type: 'user_not_found',
      message: message ?? 'Specified user not found',
    },
  }),
  badRequest: (message?: string) => ({
    status: HttpStatus.BAD_REQUEST,
    error: {
      type: 'bad_request',
      message: message ?? 'Bad Request',
    },
    data: null,
  }),
  forbidden: (message: string) => ({
    status: HttpStatus.FORBIDDEN,
    error: {
      type: 'forbidden',
      message: message ?? 'Bad Request',
    },
  }),
  ok: {
    status: HttpStatus.OK,
    error: null,
  },
  data: <T>(data: T) => ({
    status: HttpStatus.OK,
    error: null,
    data: data,
  }),
  verification: (verified: boolean) => ({
    status: HttpStatus.OK,
    error: undefined,
    data: {
      verified,
    },
  }),
};

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  @InjectRepository(EmailTemplate)
  private readonly emailTemplateRepository: Repository<EmailTemplate>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(TWILIO_CONFIG_TOKEN)
    private readonly twilioClient: TwilioClient,
    private readonly firebaseNotifications: FirebaseNotificationsService,
  ) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendVerificationCode(payload: SendVerificationCodeRequestDto): Promise<GenericResponse> {
    try {
      const sid = this.configService.get<string>('TWILIO_VERIFY_SID');
      await this.twilioClient.verify.v2.services(sid).verifications.create({
        to: payload.phoneNumber,
        channel: 'sms',
      });
      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('Unknown error occured, please try again');
    }
  }

  async verifyCode(payload: VerifyCodeRequestDto): Promise<VerifyResponse> {
    try {
      const sid = this.configService.get<string>('TWILIO_VERIFY_SID');
      const verificationCheck = await this.twilioClient.verify.v2.services(sid).verificationChecks.create({
        to: payload.phoneNumber,
        code: payload.verificationCode,
      });
      return responses.verification(verificationCheck.status === 'approved' && verificationCheck.valid);
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('Unknown error occured, please try again');
    }
  }

  async sendTextMessage(payload: SendTextMessageRequestDto): Promise<boolean> {
    try {
      await this.twilioClient.messages.create({
        to: payload.phoneNumber,
        from: this.configService.get<string>('TWILIO_MESSAGING_SERVICE_SID'),
        body: payload.message,
      });
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  async sendInvitationMessages(payload: SendInvitationMessagesRequestDto): Promise<void> {
    try {
      await Promise.all(
        payload.phoneNumbers.map(async (phoneNumber) => {
          await this.twilioClient.messages.create({
            to: phoneNumber,
            from: this.configService.get<string>('TWILIO_MESSAGING_SERVICE_SID'),
            body: `Hi, I want to invite you to join Rumor - a new app that connects a private community of people and experience organizers that shape culture. Check it out and download here: [link]`,
          });
        }),
      );
    } catch (err) {
      this.logger.error(err);
    }
  }

  async sendEmailFromTemplate(payload: SendEmailFromTemplateRequestDto): Promise<GenericResponse> {
    try {
      const template = await this.emailTemplateRepository.findOne({
        where: { templateName: payload.template },
      });
      if (!template) {
        return responses.notFound('Template for send email not found');
      }

      const dynamicData: Record<string, string> = {};
      for (const item of payload.dynamicData) {
        dynamicData[item.key] = item.value;
      }

      for (const item of template.params) {
        if (item.mandatory && !dynamicData[item.key]) {
          return responses.badRequest(`Parameter [${item.key}] not set`);
        }
      }

      await sgMail.send({
        to: payload.to,
        from: {
          email: payload.from && payload.from.trim() !== '' ? payload.from : this.configService.get<string>('DEFAULT_SEND_EMAIL'),
          name: 'Rumor',
        },
        templateId: template.templateSendgridId,
        dynamicTemplateData: dynamicData,
      });

      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to send email.');
    }
  }

  async createEmailTemplate(payload: EmailTemplateDto): Promise<GenericResponse> {
    try {
      const emailTemplate = new EmailTemplate();
      emailTemplate.templateName = payload.templateName;
      emailTemplate.templateSendgridId = payload.templateSendgridId;
      emailTemplate.params = payload.params;

      await this.emailTemplateRepository.save(emailTemplate);
      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to save email template.');
    }
  }

  async listEmailTemplates(): Promise<ListEmailTemplatesResponse> {
    try {
      const templates = await this.emailTemplateRepository.find({ where: { deletedAt: null } });
      return responses.data(templates);
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to get list of email templates.');
    }
  }

  async deleteEmailTemplate(payload: DeleteEmailTemplateRequestDto): Promise<GenericResponse> {
    try {
      this.emailTemplateRepository.update({ id: payload.templateId }, { deletedAt: new Date() });
      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to delete email template.');
    }
  }

  async getEmailTemplate(payload: RequestByIdDto): Promise<EmailTemplatesResponse> {
    try {
      const template = await this.emailTemplateRepository.findOne({
        where: {
          id: payload.id,
        },
      });
      if (!template) {
        return responses.notFound('Element not found');
      }
      return responses.data(template);
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('An error occurred, when try to delete email template.');
    }
  }

  async sendPushNotificationRequest(payload: SendPushNotificationRequestDto): Promise<GenericResponse> {
    try {
      const success = this.firebaseNotifications.sendPushNotification(payload);
      if (!success) {
        return responses.badRequest('error occurred while trying to send push notifications');
      }
      return responses.ok;
    } catch (err) {
      this.logger.error(err);
      return responses.badRequest('error occurred while trying to send push notifications');
    }
  }
}
