import config from '../../config';
import { Twilio } from 'twilio';

class TwilioService {
  private twilioClient: Twilio;

  constructor() {
    this.twilioClient = new Twilio(
      config.get('TWILIO_ACCOUNT_SID'),
      config.get('TWILIO_AUTH_TOKEN')
    );
  }

  async sendVerificationCode(payload: { phoneNumber: string }) {
    const sid = config.get('TWILIO_VERIFY_SID');
    await this.twilioClient.verify.v2.services(sid).verifications.create({
      to: payload.phoneNumber,
      channel: 'sms',
    });
    return { status: 'ok' };
  }

  async verifyCode(payload: { phoneNumber: string, verificationCode: string }) {
    const sid = config.get('TWILIO_VERIFY_SID');
    const verificationCheck = await this.twilioClient.verify.v2.services(sid).verificationChecks.create({
      to: payload.phoneNumber,
      code: payload.verificationCode,
    });
    return { verified: verificationCheck.status === 'approved' && verificationCheck.valid };
  }

  async sendTextMessage(payload: { phoneNumber: string, message: string }) {
    await this.twilioClient.messages.create({
      to: payload.phoneNumber,
      from: config.get('TWILIO_MESSAGING_SERVICE_SID'),
      body: payload.message,
    });
    return true;
  }

  async sendInvitationMessages(payload: { phoneNumbers: string[] }) {
    const promises = payload.phoneNumbers.map(async (phoneNumber) => {
      await this.twilioClient.messages.create({
        to: phoneNumber,
        from: config.get('TWILIO_MESSAGING_SERVICE_SID'),
        body: `Hi, I want to invite you to join Rumor - a new app that connects a private community of people and experience organizers that shape culture. Check it out and download here: [link]`,
      });
    });
    await Promise.all(promises);
  }
}

const twilioServiceInstance = new TwilioService();
export default twilioServiceInstance;