import * as sgMail from "@sendgrid/mail";
import config from '../../config';
import { SendGridError } from 'rumor-utils/errors'
class SendGridHandler {
    async sendMail(payload, template, dynamicData){
        try {
            sgMail.setApiKey(config.get('SENDGRID_API_KEY'));
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
        } catch (error) {
            throw new SendGridError("SendGrid Service Failure");
        }
     }
}

const SendGrid = new SendGridHandler()
export default SendGrid;





