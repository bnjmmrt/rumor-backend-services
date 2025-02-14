import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../../entities/email-templates.entity';

@Injectable()
export class SeedDatabase {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async seed() {
    const data = [
      {
        templateName: 'Reset Password',
        templateSendgridId: 'd-2cccadf0ad264b048e8985b998d37897',
        params: [
          {
            key: 'user_name',
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
        ],
      },
      {
        templateName: 'New Event Announcement',
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
        templateName: 'Host Application Denied',
        templateSendgridId: 'd-f3ecd7f249024457bbc1bb363a5a2946',
        params: [],
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
        templateName: 'Event Submission Rejected',
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
        templateName: 'Host Invited by Rumor Admin',
        templateSendgridId: 'd-4bcff8c979d646eb8a8cdad0d40ef144',
        params: [
          {
            key: 'invitee_first_name',
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
    ];
    const existingTemplatesMap = new Map((await this.emailTemplateRepository.find()).map((et) => [et.templateSendgridId, et]));

    for (const item of data) {
      const existingTemplate = existingTemplatesMap.get(item.templateSendgridId);
      const template = existingTemplate ? Object.assign(existingTemplate, item) : this.emailTemplateRepository.create(item);
      await this.emailTemplateRepository.save(template);
    }
  }
}
