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
} from 'rumor-utils/shared/notifications/dtos/communication.dto';
import { EmailTemplatesResponse, GenericResponse, ListEmailTemplatesResponse, VerifyResponse } from '../grpc/communication/communication.pb';
// import { TWILIO_CONFIG_TOKEN, TwilioClient } from '@rumor/shared/twilio';
import { Repository } from 'typeorm';
// import { EmailTemplate } from '../entities/email-templates.entity';

import * as sgMail from '@sendgrid/mail';
// import { FirebaseNotificationsService } from '@rumor/shared/firebase-notifications/firebase-notifications.service';

export class CommunicationService {

  // @InjectRepository(EmailTemplate)
  // private readonly emailTemplateRepository: Repository<EmailTemplate>;

  // constructor(
  //   private readonly configService: ConfigService,
  //   @Inject(TWILIO_CONFIG_TOKEN)
  //   private readonly twilioClient: TwilioClient,
  //   private readonly firebaseNotifications: FirebaseNotificationsService,
  // ) {
  //   sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  // }

  async sendVerificationCode(req:Request,res:Response) {
    
    //call to utils
    //return the response to client or interservice.

    payload: SendVerificationCodeRequestDto
  }

  async verifyCode(payload: VerifyCodeRequestDto): Promise<VerifyResponse> {
    
  }

  async sendTextMessage(payload: SendTextMessageRequestDto): Promise<boolean> {
    
  }

  async sendInvitationMessages(payload: SendInvitationMessagesRequestDto): Promise<void> {
    
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

      // Similar to twilio this will move to sendgrid utils folder - kaustubh
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
    // Send this to firebase utils

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
