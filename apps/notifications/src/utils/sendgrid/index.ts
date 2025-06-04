import * as sgMail from '@sendgrid/mail';
import config from '../../config';
import { SendGridError } from 'rumor-utils/errors';
import { EmailAttachment } from 'rumor-utils/shared/notifications/grpc/communication/communication.pb';

class SendGridHandler {
  async sendMail(payload, template, dynamicData, attachments?: EmailAttachment[]) {
    try {
      sgMail.setApiKey(config.get('SENDGRID_API_KEY'));
      await sgMail.send({
        to: payload.to,
        from: {
          email:
            payload.from && payload.from.trim() !== ''
              ? payload.from
              : config.get('DEFAULT_SEND_EMAIL'),
          name: 'Rumor',
        },
        templateId: template.templateSendgridId.trim(),
        dynamicTemplateData: dynamicData,
        ...(attachments && { attachments: await this.createSendgridAttachments(attachments) }),
      });
    } catch (error) {
      console.log(error.response?.body?.errors, 'this error is added to debug sendgrid');
      throw new SendGridError('SendGrid Service Failure');
    }
  }
  
  async createSendgridAttachments(attachments: EmailAttachment[]) {    
    return Promise.all(attachments.map(async (attachment) => {
      try {
        const response = await fetch(attachment.media);
        
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status}`);
        }
    
        const buffer = await response.arrayBuffer();
        const base64Content = Buffer.from(buffer).toString('base64');
    
        let mimeType = 'application/octet-stream';
        if (attachment.mediaType === 'image') {
          const ext = attachment.mediaName.split('.').pop()?.toLowerCase();
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'gif') mimeType = 'image/gif';
        } else if (attachment.mediaType === 'pdf') {
          mimeType = 'application/pdf'
        }
    
        return {
          content: base64Content,
          filename: attachment.mediaName,
          type: mimeType,
          disposition: 'attachment'
        };
      } catch (error) {
        throw new Error(`Failed to create attachment from URL: ${error.message}`);
      }
    }))
  }
}

const SendGrid = new SendGridHandler();
export default SendGrid;
