import { BadRequestError } from "rumor-utils/errors";
import config from "../../config";
import { Twilio } from "twilio";

class TwilioService {
  private twilioClient: Twilio;
  private verifySid: string;
  private messagingServiceSid: string;

  constructor() {
    const accountSid = config.get("TWILIO_ACCOUNT_SID");
    const authToken = config.get("TWILIO_AUTH_TOKEN");
    this.verifySid = config.get("TWILIO_VERIFY_SID");
    this.messagingServiceSid = config.get("TWILIO_MESSAGING_SERVICE_SID");

    if (!accountSid || !authToken || !this.verifySid || !this.messagingServiceSid) {
      throw new Error("Twilio configuration is missing");
    }

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  public async sendVerificationCode(payload: { phoneNumber: string }) {
    try {
      console.log("🚀 Sending verification code to:", payload.phoneNumber);

      await this.twilioClient.verify.v2.services(this.verifySid).verifications.create({
        to: payload.phoneNumber,
        channel: "sms",
      });
    } catch (error) {
      console.error("Twilio Verification Error:", error);
      throw new BadRequestError("Failed to send verification code: " + error.message);
    }
  }

  public async verifyCode(payload: { phoneNumber: string; verificationCode: string }) {
    try {
      console.log("🚀 Verifying code for:", payload.phoneNumber);

      const verificationCheck = await this.twilioClient.verify.v2
        .services(this.verifySid)
        .verificationChecks.create({
          to: payload.phoneNumber,
          code: payload.verificationCode,
        });

      return {
        verified: verificationCheck.status === "approved" && verificationCheck.valid,
      };
    } catch (error) {
      console.error("Twilio Verification Check Error:", error);
      throw new BadRequestError("Verification failed: " + error.message);
    }
  }

  public async sendTextMessage(payload: { phoneNumber: string; message: string }) {
    try {
      console.log("🚀 Sending text message to:", payload.phoneNumber);

      await this.twilioClient.messages.create({
        to: payload.phoneNumber,
        from: this.messagingServiceSid,
        body: payload.message,
      });

      return true;
    } catch (error) {
      console.error("Twilio SMS Error:", error);
      throw new BadRequestError("Failed to send text message: " + error.message);
    }
  }

  public async sendInvitationMessages(payload: { phoneNumbers: string[] }) {
    try {
      console.log("🚀 Sending invitations to:", payload.phoneNumbers);

      const promises = payload.phoneNumbers.map(async (phoneNumber) => {
        await this.twilioClient.messages.create({
          to: phoneNumber,
          from: this.messagingServiceSid,
          body: `Hi, I want to invite you to join Rumor - a new app that connects a private community of people and experience organizers that shape culture. Check it out and download here: [link]`,
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Twilio Bulk SMS Error:", error);
      throw new BadRequestError("Failed to send invitation messages: " + error.message);
    }
  }
}

// 🔥 Directly export a singleton instance
export default new TwilioService();
