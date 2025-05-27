import { EmailTemplate } from 'rumor-utils/shared/notifications/entities/email-templates.entity';
import database from '../database';

export class SeedDatabase {
  public static dbConnection = database;

  public static async seed() {
    const data = [
      {
        templateName: 'Host Invited by Rumor Admin',
        templateSendgridId: 'd-4bcff8c979d646eb8a8cdad0d40ef144',
        params: [
          {
            key: 'invitee_first_name',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Super Admin - Verify Email',
        templateSendgridId: 'd-7550cf227ce74293a1ea02deca2799a1',
        params: [
          {
            key: 'code',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Non-Member: Invited as Plus ones by Member',
        templateSendgridId: 'd-02f7f0376fb14623aede1d2ba9a93f48',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'lead_guest_name',
            mandatory: true,
          },
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'email',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'day_of_week',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'link_to_application',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Host Application Approved',
        templateSendgridId: 'd-34b1fb7e6172495ca2524a7b52d466cb',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'company_name',
            mandatory: true,
          },
          {
            key: 'password_token',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Host Event Approved by Admin - Published',
        templateSendgridId: 'd-4c83a32736e845f795691eacf951dfa7',
        params: [
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'company_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'dayOfWeek',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'view_event',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Non-Member: New Message',
        templateSendgridId: 'd-8370bf6dc56f4ebdb0b8bd1312cd9cca',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
          {
            key: 'button_url',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Non-Member: Event Invite Recieved',
        templateSendgridId: 'd-8f6be7bb04584f61b5d1bfb23c62a285',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'day_of_week',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'email',
            mandatory: true,
          },
          {
            key: 'link_to_application',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Super Admin - New Host Application',
        templateSendgridId: 'd-8177282e79294460a115bcb1c2e7c077',
        params: [
          {
            key: 'link_to_application',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Host Event Approved by Admin - Pre-Publish',
        templateSendgridId: 'd-b282722130a7441d9080e600f5c79e42',
        params: [
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'company_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'dayOfWeek',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'publish_date',
            mandatory: true,
          },
          {
            key: 'publish_time',
            mandatory: true,
          },
          {
            key: 'view_event',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Event Info Updated',
        templateSendgridId: 'd-46fb3313929e453497d239840f3726ce',
        params: [
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'day_of_week',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'view_event',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Member: Event Invite Recieved',
        templateSendgridId: 'd-f895cf40c49e44c989d69f5bf75b12b0',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'day_of_week',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'view_event',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Host Application Denied',
        templateSendgridId: 'd-f3ecd7f249024457bbc1bb363a5a2946',
        params: [],
      },
      {
        templateName: 'Account Deactivated',
        templateSendgridId: 'd-2d620177b52748f2b47bd6ce769fe7f3',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'activate_before_datetime',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'User Event Request Approved',
        templateSendgridId: 'd-f58b53682ad14b228edbb60c66b318e7',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'dayOfWeek',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'link_to_application',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'New RSVP Sign up Form request',
        templateSendgridId: 'd-681e6081cd6a4e02935743b81d714ea6',
        params: [
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
          {
            key: 'requester_full_name',
            mandatory: true,
          },
          {
            key: 'url_button',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Host Event Rejected by Admin',
        templateSendgridId: 'd-99c62ccc6eed4099966c952657842706',
        params: [
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'New Request for [Event Name]',
        templateSendgridId: 'd-fa7ef6e9ba86484f961e6b226a60360f',
        params: [
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
          {
            key: 'requester_full_name',
            mandatory: true,
          },
          {
            key: 'url_button',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Invite New Member',
        templateSendgridId: 'd-c0ecc976bb84401bba518112835396b4',
        params: [
          {
            key: 'invitee_first_name',
            mandatory: true,
          },
          {
            key: 'referral_code',
            mandatory: false,
          },
          {
            key: 'link_to_application',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Host Application Submitted',
        templateSendgridId: 'd-ce0e9936b4b3410ba3f374b54faec9e0',
        params: [
          {
            key: 'first_name',
          },
        ],
      },
      {
        templateName: 'Super Admin - New Event Submission',
        templateSendgridId: 'd-9069c25eb5dc44ebb7033dd8439dabee',
        params: [
          {
            key: 'host',
            mandatory: true,
          },
          {
            key: 'event_url',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Event 24 Hour Reminder',
        templateSendgridId: 'd-39fbeee5c85d49209c46328cace94913',
        params: [
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'day_of_week',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'view_rsvp',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Member Approved into Rumor',
        templateSendgridId: 'd-42d31f2b83f74aa5953b31a42a34447f',
        params: [
          {
            key: 'link_to_application',
            mandatory: true,
          },
          {
            key: 'first_name',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Event Cancelation Notification',
        templateSendgridId: 'd-ef73a7b20790434ab18cc5b3a0ddc5e9',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'custom_message',
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'day_of_week',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Application Submitted',
        templateSendgridId: 'd-9a4e06c284e5414f8751ed14f89f0f4e',
        params: [
          {
            key: 'applicants_name',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Non-Member: New Event Announcement',
        templateSendgridId: 'd-b8e20b49869343a8a4af82577e4fd852',
        params: [
          {
            key: 'recipient_first_name',
            mandatory: true,
          },
          {
            key: 'host',
            mandatory: true,
          },
          {
            key: 'event',
            mandatory: true,
          },
          {
            key: 'url_button',
            mandatory: true,
          },
          {
            key: 'copy',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Super Admin - Reset Password',
        templateSendgridId: 'd-2a0e88119d204c9b926d661ac2bef49a',
        params: [
          {
            key: 'reset_url',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Non-Member Verify Email',
        templateSendgridId: 'd-9e7b245c5fde4118b2903e4179feeb5e',
        params: [
          {
            key: 'code',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Reset Password',
        templateSendgridId: 'd-2cccadf0ad264b048e8985b998d37897',
        params: [
          {
            key: 'user_name',
            mandatory: true,
          },
          {
            key: 'reset_url',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Super Admin - New Member Application',
        templateSendgridId: 'd-295696919f084d07867ff6d9aebfd4b5',
        params: [
          {
            key: 'link_to_application',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Rumor Admin: Rumor 2FA Code',
        templateSendgridId: 'd-e0f6ba98f8af450a88a5a82323f80f41',
        params: [
          {
            key: 'code',
            mandatory: true,
          },
        ],
      },
      {
        templateName: 'Member + Non-Member:  Added to Confirmed',
        templateSendgridId: 'd-edbebf00cfab486d9ca0fa2e86ba9c03',
        params: [
          {
            key: 'first_name',
            mandatory: true,
          },
          {
            key: 'event_name',
            mandatory: true,
          },
          {
            key: 'host_name',
            mandatory: true,
          },
          {
            key: 'image_url',
            mandatory: true,
          },
          {
            key: 'month',
            mandatory: true,
          },
          {
            key: 'day',
            mandatory: true,
          },
          {
            key: 'day_of_week',
            mandatory: true,
          },
          {
            key: 'hour',
            mandatory: true,
          },
          {
            key: 'minutes',
            mandatory: true,
          },
          {
            key: 'address',
            mandatory: true,
          },
          {
            key: 'view_ticket',
            mandatory: true,
          },
        ],
      },
    ];
    const existingTemplatesMap = new Map(
      (await this.dbConnection.getRepository(EmailTemplate).find()).map(et => [
        et.templateSendgridId,
        et,
      ]),
    );

    for (const item of data) {
      const existingTemplate = existingTemplatesMap.get(item.templateSendgridId);
      const template = existingTemplate
        ? Object.assign(existingTemplate, item)
        : this.dbConnection.getRepository(EmailTemplate).create(item);
      await this.dbConnection.getRepository(EmailTemplate).save(template);
    }
  }
}
