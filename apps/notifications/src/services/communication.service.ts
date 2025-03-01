import {
  DeleteEmailTemplateRequestDto,
  EmailTemplateDto,
  RequestByIdDto,
  SendEmailFromTemplateRequestDto,
  SendPushNotificationRequestDto,
} from "rumor-utils/shared/notifications/dtos/communication.dto";
import {
  EmailTemplatesResponse,
  GenericResponse,
  ListEmailTemplatesResponse,
} from "rumor-utils/shared/notifications/grpc/communication/communication.pb";
// import { TWILIO_CONFIG_TOKEN, TwilioClient } from '@rumor/shared/twilio';
// import { EmailTemplate } from '../entities/email-templates.entity';
import * as sgMail from "@sendgrid/mail";
//import { FirebaseNotificationsService } from "@rumor/shared/firebase-notifications/firebase-notifications.service";
import database from "../database";
import { EmailTemplate } from "rumor-utils/shared/notifications/entities/email-templates.entity";
import { BadRequestError, NotFoundError } from "rumor-utils/errors";
import config from "../config";
export class CommunicationService {
  public static dbConnection = database;

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

  // public static async sendVerificationCode(payload: SendVerificationCodeRequestDto) {

  //   //call to utils
  //   //return the response to client or interservice.

  //   payload: SendVerificationCodeRequestDto
  // }

  // public static async verifyCode(payload: VerifyCodeRequestDto): Promise<VerifyResponse> {

  // }

  // public static async sendTextMessage(payload: SendTextMessageRequestDto): Promise<boolean> {

  // }

  // public static async sendInvitationMessages(payload: SendInvitationMessagesRequestDto): Promise<void> {

  // }

  public static async sendEmailFromTemplate(
    payload: SendEmailFromTemplateRequestDto
  ): Promise<GenericResponse> {
    const template = await this.dbConnection
      .getRepository(EmailTemplate)
      .findOne({
        where: { templateName: payload.template },
      });
    if (!template) {
      // return responses.notFound('Template for send email not found');
      throw new NotFoundError("Template for send email not found");
    }

    const dynamicData: Record<string, string> = {};
    for (const item of payload.dynamicData) {
      dynamicData[item.key] = item.value;
    }

    for (const item of template.params) {
      if (item.mandatory && !dynamicData[item.key]) {
        // return responses.badRequest(`Parameter [${item.key}] not set`);
        throw new BadRequestError(`Parameter [${item.key}] not set`);
      }
    }

    // Similar to twilio this will move to sendgrid utils folder - kaustubh
    await sgMail.send({
      to: payload.to,
      from: {
        email:
          payload.from && payload.from.trim() !== ""
            ? payload.from
            : config.get("DEFAULT_SEND_EMAIL"),
        name: "Rumor",
      },
      templateId: template.templateSendgridId,
      dynamicTemplateData: dynamicData,
    });
    return;
  }

  public static async createEmailTemplate(
    payload: EmailTemplateDto
  ): Promise<GenericResponse> {
    const emailTemplate = new EmailTemplate();
    emailTemplate.templateName = payload.templateName;
    emailTemplate.templateSendgridId = payload.templateSendgridId;
    emailTemplate.params = payload.params;

    await this.dbConnection.getRepository(EmailTemplate).save(emailTemplate);
    return;
  }

  public static async listEmailTemplates(): Promise<ListEmailTemplatesResponse> {
    const templates = await this.dbConnection
      .getRepository(EmailTemplate)
      .find({ where: { deletedAt: null } });
    return {
      status: 200,
      data: templates,
    };
  }

  public static async deleteEmailTemplate(
    payload: DeleteEmailTemplateRequestDto
  ): Promise<GenericResponse> {
    await this.dbConnection
      .getRepository(EmailTemplate)
      .update({ id: payload.templateId }, { deletedAt: new Date() });
    return;
  }

  public static async getEmailTemplate(
    payload: RequestByIdDto
  ): Promise<EmailTemplatesResponse> {
    const template = await this.dbConnection
      .getRepository(EmailTemplate)
      .findOne({
        where: {
          id: payload.id,
        },
      });
    if (!template) {
      // return responses.notFound('Element not found');
      throw new NotFoundError("Element not found");
    }
    return {
      status: 200,
      data: template,
    };
  }

  // public static async sendPushNotificationRequest(
  //   payload: SendPushNotificationRequestDto
  // ): Promise<GenericResponse> {
  //   // Send this to firebase utils

  //   const success = FirebaseNotificationsService.sendPushNotification(payload);
  //   if (!success) {
  //     // return responses.badRequest('error occurred while trying to send push notifications');
  //     throw new BadRequestError(
  //       "error occurred while trying to send push notifications"
  //     );
  //   }
  //   return;
  // }
}
