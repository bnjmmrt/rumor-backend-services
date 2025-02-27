function sendVerificationCode(){
    const sid = this.configService.get<string>('TWILIO_VERIFY_SID');
      await this.twilioClient.verify.v2.services(sid).verifications.create({
        to: payload.phoneNumber,
        channel: 'sms',
      });
      return responses.ok;
}


function verifyCode(){
    const sid = this.configService.get<string>('TWILIO_VERIFY_SID');
    const verificationCheck = await this.twilioClient.verify.v2.services(sid).verificationChecks.create({
        to: payload.phoneNumber,
        code: payload.verificationCode,
      });
      return responses.verification(verificationCheck.status === 'approved' && verificationCheck.valid);
}

function sendTextMessage(){
    await this.twilioClient.messages.create({
        to: payload.phoneNumber,
        from: this.configService.get<string>('TWILIO_MESSAGING_SERVICE_SID'),
        body: payload.message,
      });
      return true;
}

function sendInvitationMessages(payload){
    const promises = payload.phoneNumbers.map(async (phoneNumber) => {
        await this.twilioClient.messages.create({
          to: phoneNumber,
          from: this.configService.get<string>('TWILIO_MESSAGING_SERVICE_SID'),
          body: `Hi, I want to invite you to join Rumor - a new app that connects a private community of people and experience organizers that shape culture. Check it out and download here: [link]`,
        });
      })
      await Promise.all(promises);
}

