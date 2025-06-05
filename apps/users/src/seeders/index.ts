import { DefaultRoleSettings, Role, User } from 'rumor-utils/shared/entities/index';

import database from '../database';
import { Interest } from 'rumor-utils/shared/users/entities/interest.entity';
import { Focus } from 'rumor-utils/shared/users/entities/focus.entity';
import { CollaboratorRoles } from 'rumor-utils/shared/events/interfaces/event.interface';
import { RoleService } from '../services/role.service';
import { SocialService } from '../services/social.service';

export class Seeders {
  public static dbConnection = database;

  public static async seedRoles() {
    try {
      const rolesData = [
        { name: 'admin', subRoles: ['rumor_super_admin', 'rumor_manager'] },
        {
          name: 'host',
          subRoles: ['main_host', 'co_host', 'promoter', 'contributor', 'check_in'],
        },
        { name: 'member', subRoles: ['non_member'] },
      ];

      for (const roleData of rolesData) {
        let role = await this.dbConnection.getRepository(Role).findOne({
          where: { name: roleData.name },
        });
        if (!role) {
          role = new Role();
          role.name = roleData.name;
          await this.dbConnection.getRepository(Role).save(role);
        }

        for (const subRoleName of roleData.subRoles) {
          let subRole = await this.dbConnection.getRepository(Role).findOne({
            where: { name: subRoleName },
          });
          if (!subRole) {
            subRole = new Role();
            subRole.name = subRoleName;
            subRole.parentRole = role;
            await this.dbConnection.getRepository(Role).save(subRole);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public static async seedDefaultRoleSettings() {
    try {
      const data = [
        {
          role: CollaboratorRoles.CO_HOST,
          config: {
            editEventDetailsSettings: true,
            inviteGuestsToEvent: true,
            addGuestsToDrafts: true,
            viewFullGuestList: true,
            manageInAppRsvpRequests: true,
            manageDedicatedSignUpForm: true,
            postAnnouncementsToAllGuests: true,
            checkInGuests: true,
            postAnnouncementsByCollaborator: true,
            chatWithAllGuests: true,
            chatWithGuestsByCollaborator: true,
            generateEventReports: true,
            defaultRoleSettingsRepository: true,
          },
        },
        /**this role was asked to remove from collaborator roles */
        // {
        //   role: CollaboratorRoles.PROMOTER,
        //   config: {
        //     editEventDetailsSettings:false,
        //     inviteGuestsToEvent: true,
        //     addGuestsToDrafts: true,
        //     viewFullGuestList: true,
        //     manageInAppRsvpRequests: true,
        //     manageDedicatedSignUpForm: true,
        //     postAnnouncementsToAllGuests: false,
        //     checkInGuests: true,
        //     postAnnouncementsByCollaborator: true,
        //     chatWithAllGuests: false,
        //     chatWithGuestsByCollaborator: true,
        //     generateEventReports: false,
        //     defaultRoleSettingsRepository: false,
        //   },
        // },
        {
          role: CollaboratorRoles.CONTRIBUTOR,
          config: {
            editEventDetailsSettings: false,
            inviteGuestsToEvent: true,
            addGuestsToDrafts: true,
            viewFullGuestList: false,
            manageInAppRsvpRequests: false,
            manageDedicatedSignUpForm: true,
            postAnnouncementsToAllGuests: false,
            checkInGuests: false,
            chatWithAllGuests: false,
            postAnnouncementsByCollaborator: true,
            chatWithGuestsByCollaborator: true,
            generateEventReports: false,
            defaultRoleSettingsRepository: false,
          },
        },
        {
          role: CollaboratorRoles.CHECK_IN,
          config: {
            editEventDetailsSettings: false,
            inviteGuestsToEvent: false,
            addGuestsToDrafts: false,
            viewFullGuestList: true,
            manageInAppRsvpRequests: false,
            manageDedicatedSignUpForm: false,
            postAnnouncementsToAllGuests: false,
            checkInGuests: true,
            chatWithAllGuests: false,
            chatWithGuestsByCollaborator: false,
            postAnnouncementsByCollaborator: false,
            generateEventReports: false,
            defaultRoleSettingsRepository: false,
          },
        },
      ];

      //TODO: first check if data exists or not if not then only this should run also it can be move to auth service
      for (const item of data) {
        const role: Partial<Role> = await RoleService.getRoleByName({ name: item.role });

        if (!role) continue;
        let settingsEntry = await this.dbConnection.getRepository(DefaultRoleSettings).findOne({
          where: {
            role: { name: item.role },
            deletedAt: null,
          },
        });
        if (settingsEntry) {
          Object.assign(settingsEntry, item.config);
        } else {
          settingsEntry = this.dbConnection.getRepository(DefaultRoleSettings).create(item.config);
          settingsEntry.role = role;
        }
        await this.dbConnection.getRepository(DefaultRoleSettings).save(settingsEntry);
      }
    } catch (error) {
      console.log(error);
    }
  }

  public static async seedInterests() {
    const interestsData = [
      { name: 'Art', description: 'Interested in art', enabled: true },
      { name: 'Automotive', description: 'Interested in automotive', enabled: true },
      { name: 'Beauty', description: 'Interested in beauty', enabled: true },
      { name: 'Business', description: 'Interested in business', enabled: true },
      { name: 'Fashion', description: 'Interested in fashion', enabled: true },
      { name: 'Fitness', description: 'Interested in fitness', enabled: true },
      { name: 'Food', description: 'Interested in food', enabled: true },
      { name: 'Hospitality', description: 'Interested in hospitality', enabled: true },
      { name: 'Humor', description: 'Interested in humor', enabled: true },
      { name: 'Luxury', description: 'Interested in luxury', enabled: true },
      { name: 'Lifestyle', description: 'Interested in lifestyle', enabled: true },
      { name: 'Music', description: 'Interested in music', enabled: true },
      { name: 'Personal Growth', description: 'Interested in personal growth', enabled: true },
      { name: 'Philanthropy', description: 'Interested in philanthropy', enabled: true },
      { name: 'Sports', description: 'Interested in sports', enabled: true },
      { name: 'Technology', description: 'Interested in technology', enabled: true },
      { name: 'Wellness', description: 'Interested in wellness', enabled: true },
    ];

    for (const interestData of interestsData) {
      let interest = await this.dbConnection
        .getRepository(Interest)
        .findOne({ where: { name: interestData.name } });
      if (!interest) {
        interest = this.dbConnection.getRepository(Interest).create(interestData);
        await this.dbConnection.getRepository(Interest).save(interest);
      }
    }
  }

  public static async seedFocuses() {
    const focusesData = [
      { name: 'Actor' },
      { name: 'Athlete' },
      { name: 'Artist' },
      { name: 'Comedian' },
      { name: 'Content Creator' },
      { name: 'Designer' },
      { name: 'Entertainment' },
      { name: 'Entrepreneur' },
      { name: 'Filmmaker' },
      { name: 'Hospitality' },
      { name: 'Investor' },
      { name: 'Model' },
      { name: 'Musician' },
      { name: 'Philanthropist' },
      { name: 'Technology' },
      { name: 'Wellness' },
      { name: 'Writer' },
    ];

    for (const focusData of focusesData) {
      let focus = await this.dbConnection
        .getRepository(Focus)
        .findOne({ where: { name: focusData.name } });
      if (!focus) {
        focus = this.dbConnection.getRepository(Focus).create(focusData);
        await this.dbConnection.getRepository(Focus).save(focus);
      }
    }
  }

  public static async seedInstagramFollowers() {
    const pendingInstagramUsers = await this.dbConnection
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoin('user.socialStats', 'socialStats')
      .select(['user.id', 'user.instagramUserName'])
      .where('user.instagramUserName IS NOT NULL')
      .andWhere('user.instagramUserName != :empty', { empty: '' })
      .andWhere('socialStats.id IS NULL')
      .getMany();

    for (const user of pendingInstagramUsers) {
      try {
        await SocialService.scrapeInstagramFollowers(user.instagramUserName, user.id);
      } catch (e) {}
    }
  }
}
