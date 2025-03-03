import { BadRequestError } from "rumor-utils/errors";
import config from "../../config";
import { Twilio } from "twilio";

class TwilioService {
  private twilioClient: Twilio | null = null;

  private getClient(): Twilio {
    if (!this.twilioClient) {
      const accountSid = config.get("TWILIO_ACCOUNT_SID");
      const authToken = config.get("TWILIO_AUTH_TOKEN");


      if (!accountSid || !authToken) {
        throw new BadRequestError("Twilio credentials are missing or invalid");
      }

      this.twilioClient = new Twilio(accountSid, authToken);
    }

    return this.twilioClient;
  }

  async sendVerificationCode(payload: { phoneNumber: string }) {
    const client = this.getClient();
    const sid = config.get("TWILIO_VERIFY_SID");

    if (!sid) {
      throw new BadRequestError("TWILIO_VERIFY_SID is missing or invalid");
    }

    await client.verify.v2.services(sid).verifications.create({
      to: payload.phoneNumber,
      channel: "sms",
    });

    return { status: "ok" };
  }

  async verifyCode(payload: { phoneNumber: string; verificationCode: string }) {
    const client = this.getClient();
    const sid = config.get("TWILIO_VERIFY_SID");

    if (!sid) {
      throw new BadRequestError("TWILIO_VERIFY_SID is missing or invalid");
    }

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
  }

  async sendTextMessage(payload: { phoneNumber: string; message: string }) {
    const client = this.getClient();
    const messagingServiceSid = config.get("TWILIO_MESSAGING_SERVICE_SID");

    if (!messagingServiceSid) {
      throw new BadRequestError(
        "TWILIO_MESSAGING_SERVICE_SID is missing or invalid"
      );
    }

    await client.messages.create({
      to: payload.phoneNumber,
      from: messagingServiceSid,
      body: payload.message,
    });

    return true;
  }

  async sendInvitationMessages(payload: { phoneNumbers: string[] }) {
    const client = this.getClient();
    const messagingServiceSid = config.get("TWILIO_MESSAGING_SERVICE_SID");

    if (!messagingServiceSid) {
      throw new BadRequestError(
        "TWILIO_MESSAGING_SERVICE_SID is missing or invalid"
      );
    }
    await Promise.all(
      payload.phoneNumbers.map(async (phoneNumber) => {
        await client.messages.create({
          to: phoneNumber,
          from: messagingServiceSid,
          body: `Hi, I want to invite you to join Rumor - a new app that connects a private community of people and experience organizers that shape culture. Check it out and download here: [link]`,
        });
      }),
    );
  }
}
export default new TwilioService();
