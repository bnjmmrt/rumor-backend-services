import { BadRequestError } from 'rumor-utils/errors';
import config from '../../config';
import { Twilio } from 'twilio';
import {accountSid,authToken } from './config';
class TwilioService {
  private twilioClient: Twilio;

  private getClient(): Twilio {
    if (!this.twilioClient) {
      const accountSid = config.get("TWILIO_ACCOUNT_SID");
      const authToken = config.get("TWILIO_AUTH_TOKEN");
      if (!accountSid || !authToken) {
        throw new BadRequestError("Twilio credentials are missing or invalid");
      }

      this.twilioClient = new Twilio(accountSid, authToken);
      return this.twilioClient;
    }
  }

  async sendVerificationCode(payload: { phoneNumber: string }) {
    try {
      const client = this.getClient();
      const sid = config.get("TWILIO_VERIFY_SID");
      await client.verify.v2.services(sid).verifications.create({
        to: payload.phoneNumber,
        channel: "sms",
      });
      return;
    } catch (error) {
      console.log(error);
      throw new BadRequestError("Failed to send verification code: " + error.message);
    }
  }

  async verifyCode(payload: { phoneNumber: string, verificationCode: string }) {
    const client = this.getClient();
    const sid = config.get("TWILIO_VERIFY_SID");

    try {
      const verificationCheck = await client.verify.v2
        .services(sid)
        .verificationChecks.create({
          to: payload.phoneNumber,
          code: payload.verificationCode,
        });
      return {
        verified:
          verificationCheck.status === "approved" && verificationCheck.valid,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestError("Verification failed: " + error.message);
    }
  }

  async sendTextMessage(payload: { phoneNumber: string, message: string }) {
    try {
      const client = this.getClient();

      await client.messages.create({
        to: payload.phoneNumber,
        from: config.get("TWILIO_MESSAGING_SERVICE_SID"),
        body: payload.message,
      });
      return true;
    } catch (error) {
      console.log(error);
      throw new BadRequestError("Failed to send text message: " + error.message);
    }
  }

  async sendInvitationMessages(payload: { phoneNumbers: string[] }) {
    try {
      const client = this.getClient();

      const promises = payload.phoneNumbers.map(async (phoneNumber) => {
        await client.messages.create({
          to: phoneNumber,
          from: config.get("TWILIO_MESSAGING_SERVICE_SID"),
          body: `Hi, I want to invite you to join Rumor - a new app that connects a private community of people and experience organizers that shape culture. Check it out and download here: [link]`,
        });
      });
      await Promise.all(promises);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("Failed to send invitation messages: " + error.message);
    }
  }
}

const twilioServiceInstance = new TwilioService();
export default twilioServiceInstance;
