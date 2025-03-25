import { DefaultRoleSettings, EventAgeLimit, EventTypes, Role } from "rumor-utils/shared/entities/index";
import database from "../database";
import { CollaboratorRoles } from 'rumor-utils/shared/events/interfaces/event.interface';
import serviceMesh from "../server/helpers/serviceMeshHandler";

export class Seeders {
  public static dbConnection = database;

  public static async seedEventTypes() {
    try {
      const dataExists = await this.dbConnection.getRepository(EventTypes).find({ take: 1 });
      if (dataExists.length < 1) {
        const data = [
          {
            name: 'After Parties',
            description: 'Is an After Parties event type',
            enabled: true,
          },
          {
            name: 'Album Release',
            description: 'Is an Album Release event type',
            enabled: true,
          },
          {
            name: 'Art Shows',
            description: 'Is an Art Shows event type',
            enabled: true,
          },
          {
            name: 'Award Shows',
            description: 'Is an Award Shows event type',
            enabled: true,
          },
          {
            name: 'Brand Experiences',
            description: 'Is a Brand Experiences event type',
            enabled: true,
          },
          {
            name: 'Charity and Galas',
            description: 'Is a Charity and Galas event type',
            enabled: true,
          },
          {
            name: 'Concerts',
            description: 'Is a Concert event type',
            enabled: true,
          },
          {
            name: 'Culinary',
            description: 'Is a Culinary event type',
            enabled: true,
          },
          {
            name: 'Fashion Shows',
            description: 'Is a Fashion Shows event type',
            enabled: true,
          },
          {
            name: 'Film Festivals',
            description: 'Is a Film Festivals event type',
            enabled: true,
          },
          {
            name: 'Health & Wellness',
            description: 'Is a Health & Wellness event type',
            enabled: true,
          },
          {
            name: 'Music Festivals',
            description: 'Is a Music Festivals event type',
            enabled: true,
          },
          {
            name: 'Movie Premieres',
            description: 'Is a Movie Premieresevent type',
            enabled: true,
          },
          {
            name: 'Nightlife',
            description: 'Is a Nightlife event type',
            enabled: true,
          },
          {
            name: 'Private Parties',
            description: 'Is a Private Parties type',
            enabled: true,
          },
          {
            name: 'Product Launch',
            description: 'Is a Product Launch type',
            enabled: true,
          },
          {
            name: 'Sporting Events',
            description: 'Is a Sporting Events type',
            enabled: true,
          },
          {
            name: 'Seasonal Celebrations',
            description: 'Is a Seasonal Celebrations type',
            enabled: true,
          },
          {
            name: 'Talks & Workshops',
            description: 'Is a Talks & Workshop type',
            enabled: true,
          },
          {
            name: 'Tech',
            description: 'Is a Tech type',
            enabled: true,
          },
        ];
        await await this.dbConnection.getRepository(EventTypes).save(data);
      }
    } catch (error) {
      console.log(error)
    }
  }

  public static async seedEventAgeLimits() {
    try {
      const data_exists = await this.dbConnection.getRepository(EventAgeLimit).find({ take: 1 });
      if (data_exists.length < 1) {
        const data = [
          {
            name: 'All ages',
            description: 'All ages are permitted',
            maxAge: 120,
            minAge: 0,
            enabled: true,
          },
          {
            name: '21+',
            description: '21 years old or more',
            maxAge: 120,
            minAge: 21,
            enabled: true,
          },
          {
            name: '18+',
            description: '18 years old or more',
            maxAge: 120,
            minAge: 18,
            enabled: true,
          },
        ];
        await this.dbConnection.getRepository(EventAgeLimit).save(data);
      }
    } catch (error) {
      console.log(error)
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
            editEventDetailsSettings:false,
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
        const role: Partial<Role> = (await serviceMesh.userService().getRoleByName(item.role)).data;

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
      console.log(error)
    }
  }
}
