// import { Repository } from 'typeorm';
// import { DefaultRoleSettings } from 'src/database/entities/default-role-settings.entity';
// import { AuthClient } from 'rumor-utils/clients/auth.client';
// import { Role } from '../../../../users/src/database/entities/roles/role.entity';
// import { CollaboratorRoles } from '../../interfaces/event.interface';
// import dbconnection from 'src/database';;

// export class SeedDatabaseRoleSettings {
//   constructor(
//     @Inject(AuthClient)
//     private readonly authClient: AuthClient,
//     @InjectRepository(DefaultRoleSettings)
//     private readonly defaultRoleSettingsRepository: Repository<DefaultRoleSettings>,
//   ) {}

//   async seed() {
//     const data = [
//       {
//         role: CollaboratorRoles.CO_HOST,
//         config: {
//           defaultRoleSettingsRepository: true,
//           inviteGuestsToEvent: true,
//           addGuestsToDrafts: true,
//           chatWithAllGuests: true,
//           chatWithGuestsByCollaborator: true,
//           viewFullGuestList: true,
//           manageInAppRsvpRequests: true,
//           manageDedicatedSignUpForm: true,
//           postAnnouncementsToAllGuests: true,
//           postAnnouncementsByCollaborator: true,
//           checkInGuests: true,
//           generateEventReports: true,
//         },
//       },
//       {
//         role: CollaboratorRoles.PROMOTER,
//         config: {
//           defaultRoleSettingsRepository: false,
//           inviteGuestsToEvent: true,
//           addGuestsToDrafts: true,
//           chatWithAllGuests: false,
//           chatWithGuestsByCollaborator: true,
//           viewFullGuestList: true,
//           manageInAppRsvpRequests: true,
//           manageDedicatedSignUpForm: true,
//           postAnnouncementsToAllGuests: false,
//           postAnnouncementsByCollaborator: true,
//           checkInGuests: true,
//           generateEventReports: false,
//         },
//       },
//       {
//         role: CollaboratorRoles.CONTRIBUTOR,
//         config: {
//           defaultRoleSettingsRepository: false,
//           inviteGuestsToEvent: true,
//           addGuestsToDrafts: true,
//           chatWithAllGuests: false,
//           chatWithGuestsByCollaborator: true,
//           viewFullGuestList: false,
//           manageInAppRsvpRequests: false,
//           manageDedicatedSignUpForm: true,
//           postAnnouncementsToAllGuests: false,
//           postAnnouncementsByCollaborator: true,
//           checkInGuests: false,
//           generateEventReports: false,
//         },
//       },
//       {
//         role: CollaboratorRoles.CHECK_IN,
//         config: {
//           defaultRoleSettingsRepository: false,
//           inviteGuestsToEvent: false,
//           addGuestsToDrafts: false,
//           chatWithAllGuests: false,
//           chatWithGuestsByCollaborator: false,
//           viewFullGuestList: true,
//           manageInAppRsvpRequests: false,
//           manageDedicatedSignUpForm: false,
//           postAnnouncementsToAllGuests: false,
//           postAnnouncementsByCollaborator: false,
//           checkInGuests: true,
//           generateEventReports: false,
//         },
//       },
//     ];

//     for (const item of data) {
//       const role: Partial<Role> = await this.authClient.getRoleByName(item.role);

//       if (!role) continue;
//       let settingsEntry = await this.defaultRoleSettingsRepository.findOne({
//         where: {
//           role: { name: item.role },
//           deletedAt: null,
//         },
//       });

//       if (settingsEntry) {
//         Object.assign(settingsEntry, item.config);
//       } else {
//         settingsEntry = this.defaultRoleSettingsRepository.create(item.config);
//         settingsEntry.role = role;
//       }
//       await this.defaultRoleSettingsRepository.save(settingsEntry);
//     }
//   }
// }
