import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AvailableClients } from '../grpc-clients';
import { unpackGenericResponse, unpackResponse, unpackStatusResponse } from '../utils/utils';
import { COMMUNICATION_SERVICE_NAME, CommunicationServiceClient } from 'apps/communication/src/grpc/communication/communication.pb';

@Injectable()
export class CommunicationClient {
  constructor(
    @Inject(AvailableClients.COMMUNICATION_PACKAGE.packageName)
    private client: ClientGrpc,
  ) {}

  private service: CommunicationServiceClient;
  private readonly logger = new Logger(CommunicationClient.name);

  onModuleInit() {
    this.service = this.client.getService<CommunicationServiceClient>(COMMUNICATION_SERVICE_NAME);
  }

  async sendVerificationCode(phoneNumber: string, injectedLogger?: Logger) {
    return unpackResponse(
      this.service.sendVerificationCode({
        phoneNumber,
      }),
      'sending verification code',
      injectedLogger ?? this.logger,
    );
  }

  async verifyPhoneNumber(phoneNumber: string, code: string, injectedLogger?: Logger) {
    return unpackResponse(
      this.service.verifyCode({
        phoneNumber,
        verificationCode: code,
      }),
      'verifying phone number',
      injectedLogger ?? this.logger,
    );
  }

  async sendInvitationMessages(phoneNumbers: string[], senderName: string, injectedLogger?: Logger) {
    return unpackStatusResponse(
      this.service.sendInvitationMessages({
        phoneNumbers,
        senderName,
      }),
      'sending invitation messages',
      injectedLogger ?? this.logger,
    );
  }

  async sendTextMessage(phoneNumber: string, message: string, injectedLogger?: Logger) {
    return unpackStatusResponse(
      this.service.sendTextMessage({
        phoneNumber,
        message,
      }),
      'sending text message',
      injectedLogger ?? this.logger,
    );
  }

  async sendEmailFromTemplate(dynamicData, template: string, to: string[], from?: string, injectedLogger?: Logger) {
    return unpackGenericResponse(
      this.service.sendEmailFromTemplate({
        from,
        to,
        dynamicData,
        template,
      }),
      'Sending email from template',
      injectedLogger ?? this.logger,
    );
  }

  async getTemplateById(id: string, injectedLogger?: Logger) {
    return unpackResponse(this.service.getEmailTemplate({ id: id }), 'Getting template by id', injectedLogger ?? this.logger);
  }

  async sendPushNotification(tokens: string[], title: string, body: string, injectedLogger?: Logger) {
    return unpackResponse(this.service.sendPushNotification({ tokens, title, body }), 'Sending push notification', injectedLogger ?? this.logger);
  }
}
