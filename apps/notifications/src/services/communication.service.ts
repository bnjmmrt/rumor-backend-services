import {
  DeleteEmailTemplateRequestDto,
  EmailTemplateDto,
  RequestByIdDto,
  SendEmailFromTemplateRequestDto,
} from "rumor-utils/shared/notifications/dtos/communication.dto";

// import {
//   EmailTemplatesResponse,
//   GenericResponse,
//   ListEmailTemplatesResponse,
// } from "rumor-utils/shared/notifications/grpc/communication/communication.pb";

import database from "../database";
import { EmailTemplate } from "rumor-utils/shared/notifications/entities/email-templates.entity";
import { BadRequestError, NotFoundError } from "rumor-utils/errors";
import SendGrid from "../utils/sendgrid";
export class CommunicationService {
  public static dbConnection = database;
  
  public static async sendEmailFromTemplate(payload: SendEmailFromTemplateRequestDto){
    const template = await this.dbConnection
    .getRepository(EmailTemplate)
    .findOne({
      where: { templateName: payload.template },
    });
    
    if (!template) {
      throw new NotFoundError("Template for send email not found");
    }

    const dynamicData: Record<string, string> = {};
    for (const item of payload.dynamicData) {
      dynamicData[item.key] = item.value;
    }

    for (const item of template.params) {
      if (item.mandatory && !dynamicData[item.key]) {
        throw new BadRequestError(`Parameter [${item.key}] not set`);
      }
    }
    await SendGrid.sendMail(payload, template, dynamicData);
  }

  public static async createEmailTemplate(
    payload: EmailTemplateDto
  ) {
    const emailTemplate = new EmailTemplate();
    emailTemplate.templateName = payload.templateName;
    emailTemplate.templateSendgridId = payload.templateSendgridId;
    emailTemplate.params = payload.params;
    let createdTemplate = await this.dbConnection.getRepository(EmailTemplate).save(emailTemplate);
    return createdTemplate;
  }

  public static listEmailTemplates = async () =>
    await this.dbConnection
      .getRepository(EmailTemplate)
      .find({ where: { deletedAt: null } });

  public static deleteEmailTemplate = async (
    payload: DeleteEmailTemplateRequestDto
  ) =>
    await this.dbConnection
      .getRepository(EmailTemplate)
      .update({ id: payload.templateId }, { deletedAt: new Date() });

  public static async getEmailTemplate(payload: RequestByIdDto) {
    const template = await this.dbConnection
      .getRepository(EmailTemplate)
      .findOne({
        where: {
          id: payload.id,
        },
      });
    if (!template) {
      throw new NotFoundError("Element not found");
    }
    return template
  }
}
