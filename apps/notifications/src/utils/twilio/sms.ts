import { BadRequestError, InternalServerError, ValidationError } from 'rumor-utils/errors';
import config from '../../config';
import { Twilio } from 'twilio';
import { SmsRecipient } from 'rumor-utils/shared/notifications/entities/sms-recipient.entity';
import database from '../../database';

export interface SendVerificationCodePayload {
  phoneNumber: string;
}

export interface VerifyCodePayload {
  phoneNumber: string;
  code: string;
}

export interface SendTextMessagePayload {
  phoneNumber: string;
  message: string;
}

export interface SendInvitationMessagesPayload {
  phoneNumbers: string[];
  senderName: string;
}

class TwilioService {
  private twilioClient: Twilio | null = null;
  private readonly COMPLIANCE_MESSAGE = 'Msg & data rates may apply. Reply STOP to opt out.';

  constructor() {}

  private getClient(): Twilio {
    if (!this.twilioClient) {
      const accountSid = config.get('TWILIO_ACCOUNT_SID');
      const authToken = config.get('TWILIO_AUTH_TOKEN');

      if (!accountSid || !authToken) {
        throw new BadRequestError('Twilio credentials are missing or invalid');
      }

      this.twilioClient = new Twilio(accountSid, authToken);
    }

    return this.twilioClient;
  }

  async sendVerificationCode(payload: SendVerificationCodePayload) {
    const client = this.getClient();
    const sid = config.get('TWILIO_VERIFY_SID');

    if (!sid) {
      throw new BadRequestError('TWILIO_VERIFY_SID is missing or invalid');
    }

    try {
      const response = await client.verify.v2.services(sid).verifications.create({
        to: payload.phoneNumber,
        channel: 'sms',
      });

      if (!response || response.status !== 'pending') {
        throw new BadRequestError('Failed to send verification code');
      }

      return;
    } catch (error) {
      throw new InternalServerError(error);
    }
  }

  async verifyCode(payload: VerifyCodePayload) {
    const client = this.getClient();
    const sid = config.get('TWILIO_VERIFY_SID');

    if (!sid) {
      throw new BadRequestError('TWILIO_VERIFY_SID is missing or invalid');
    }

    try {
      const verificationCheck = await client.verify.v2.services(sid).verificationChecks.create({
        to: payload.phoneNumber,
        code: payload.code,
      });

      const isVerified =
        verificationCheck?.status === 'approved' && verificationCheck?.valid === true;

      if (!isVerified) {
        throw new BadRequestError('Invalid verification code');
      }

      return { verified: true };
    } catch (error) {
      console.log('🚀 ~ TwilioService ~ verifyCode ~ error:', error);
      if (error?.statusCode === 400 || error?.message?.includes('VerificationCheck')) {
        throw new ValidationError('Invalid verification code');
      }
    }
  }

  private async checkAndUpdateRecipient(phoneNumber: string): Promise<boolean> {
    try {
      let recipient = await database.getRepository(SmsRecipient).findOne({
        where: { phoneNumber },
      });

      if (!recipient) {
        recipient = database.getRepository(SmsRecipient).create({
          phoneNumber,
          hasReceivedComplianceMessage: false,
        });
        await database.getRepository(SmsRecipient).save(recipient);
        return true;
      }

      return !recipient.hasReceivedComplianceMessage;
    } catch (error) {
      console.error('Error checking recipient:', error);
      return false;
    }
  }

  private async markComplianceMessageSent(phoneNumber: string): Promise<void> {
    try {
      await database.getRepository(SmsRecipient).update(
        { phoneNumber },
        {
          hasReceivedComplianceMessage: true,
          lastMessageSentAt: new Date(),
        },
      );
    } catch (error) {
      console.error('Error updating recipient status:', error);
    }
  }

  async sendTextMessage(payload: SendTextMessagePayload) {
    const client = this.getClient();
    const messagingServiceSid = config.get('TWILIO_MESSAGING_SERVICE_SID');

    if (!messagingServiceSid) {
      throw new BadRequestError('TWILIO_MESSAGING_SERVICE_SID is missing or invalid');
    }

    try {
      // Enviar el mensaje principal
      const response = await client.messages.create({
        to: payload.phoneNumber,
        from: messagingServiceSid,
        body: payload.message,
      });

      if (!response || !response.sid) {
        throw new BadRequestError('Failed to send text message');
      }

      // Verificar si necesitamos enviar el mensaje de cumplimiento
      const needsComplianceMessage = await this.checkAndUpdateRecipient(payload.phoneNumber);

      if (needsComplianceMessage) {
        // Enviar el mensaje de cumplimiento
        await client.messages.create({
          to: payload.phoneNumber,
          from: messagingServiceSid,
          body: this.COMPLIANCE_MESSAGE,
        });

        // Marcar que el mensaje de cumplimiento fue enviado
        await this.markComplianceMessageSent(payload.phoneNumber);
      }
    } catch (error) {
      throw new InternalServerError(error);
    }
  }

  async sendInvitationMessages(payload: SendInvitationMessagesPayload) {
    const client = this.getClient();
    const messagingServiceSid = config.get('TWILIO_MESSAGING_SERVICE_SID');

    if (!messagingServiceSid) {
      throw new BadRequestError('TWILIO_MESSAGING_SERVICE_SID is missing or invalid');
    }

    try {
      await Promise.all(
        payload.phoneNumbers.map(async phoneNumber => {
          // Enviar el mensaje de invitación
          await client.messages.create({
            to: phoneNumber,
            from: messagingServiceSid,
            body: `Hi, I want to invite you to join Rumor - a new app that connects a private community of people and experience organizers that shape culture. Check it out and download here: [link]`,
          });

          // Verificar si necesitamos enviar el mensaje de cumplimiento
          const needsComplianceMessage = await this.checkAndUpdateRecipient(phoneNumber);

          if (needsComplianceMessage) {
            // Enviar el mensaje de cumplimiento
            await client.messages.create({
              to: phoneNumber,
              from: messagingServiceSid,
              body: this.COMPLIANCE_MESSAGE,
            });

            // Marcar que el mensaje de cumplimiento fue enviado
            await this.markComplianceMessageSent(phoneNumber);
          }
        }),
      );
    } catch (error) {
      throw new InternalServerError(error);
    }
  }
}

export default new TwilioService();
