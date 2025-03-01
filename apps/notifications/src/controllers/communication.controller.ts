import asyncWrapper from "../server/helpers/asyncWrapper"; // Assuming you have this utility

import { CommunicationService } from "../services/communication.service";
import {
  GenericResponse,
  VerifyResponse,
  StatusResponse,
  ListEmailTemplatesResponse,
  EmailTemplatesResponse,
} from "rumor-utils/shared/notifications/grpc/communication/communication.pb";
import {
  SendVerificationCodeRequestDto,
  VerifyCodeRequestDto,
  SendInvitationMessagesRequestDto,
  SendTextMessageRequestDto,
  SendEmailFromTemplateRequestDto,
  EmailTemplateDto,
  DeleteEmailTemplateRequestDto,
  RequestByIdDto,
} from "rumor-utils/shared/notifications/dtos/communication.dto";
import twilioServiceInstance from "src/utils/twilio/twilio.service";
import {
  CreateResponse,
  DeleteResponse,
  GetResponse,
} from "packages/rumor-utils/success";

export class CommunicationController {
  // SendVerificationCode
  public static sendVerificationCode = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SendVerificationCodeRequestDto = req.body;
      const response: any = await twilioServiceInstance.sendVerificationCode(
        payload
      );
      const successResponse = new CreateResponse(
        response,
        "Code Sent Successfully"
      );
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static verifyCode = asyncWrapper(async (req, res): Promise<void> => {
    const payload: VerifyCodeRequestDto = req.body;
    const result = await twilioServiceInstance.verifyCode(payload);
    const response: VerifyResponse = {
      status: result.verified ? 200 : 400,
      data: result,
    };
    const successResponse = new GetResponse(response, "Code Verified");
    res.json(successResponse).status(successResponse.statusCode);
  });

  public static sendInvitationMessages = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SendInvitationMessagesRequestDto = req.body;
      twilioServiceInstance.sendInvitationMessages(payload);
      const response: StatusResponse = {
        success: true,
      };
      const successResponse = new GetResponse(response, "ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static sendTextMessage = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SendTextMessageRequestDto = req.body;
      twilioServiceInstance.sendTextMessage(payload);
      const response: StatusResponse = {
        success: true,
      };
      const successResponse = new GetResponse(response, "ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static sendEmailFromTemplate = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: SendEmailFromTemplateRequestDto = req.body;
      const response: GenericResponse =
        await CommunicationService.sendEmailFromTemplate(payload);
      const successResponse = new GetResponse(response, "ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static createEmailTemplate = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: EmailTemplateDto = req.body;
      const response: GenericResponse =
        await CommunicationService.createEmailTemplate(payload);
      const successResponse = new CreateResponse(
        response,
        "Template created successfully"
      );
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static listEmailTemplates = asyncWrapper(
    async (req, res): Promise<void> => {
      const response: ListEmailTemplatesResponse =
        await CommunicationService.listEmailTemplates();
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );

  public static deleteEmailTemplate = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: DeleteEmailTemplateRequestDto = req.body;
      const response: GenericResponse =
        await CommunicationService.deleteEmailTemplate(payload);
      const deleteResponse = new DeleteResponse("Template deleted");
      res.json(deleteResponse).status(deleteResponse.statusCode);
    }
  );

  public static getEmailTemplate = asyncWrapper(
    async (req, res): Promise<void> => {
      const payload: RequestByIdDto = req.body;
      const response: EmailTemplatesResponse =
        await CommunicationService.getEmailTemplate(payload);
      const successResponse = new GetResponse(response, "Ok");
      res.json(successResponse).status(successResponse.statusCode);
    }
  );
}
