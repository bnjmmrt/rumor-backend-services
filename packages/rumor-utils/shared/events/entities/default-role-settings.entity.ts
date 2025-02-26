import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Role } from '../../users/entities/roles/role.entity';

@Entity('default_role_settings')
export class DefaultRoleSettings extends RumorBaseEntity {
  @Column({ type: 'boolean', name: 'edit_event_details_settings', default: false })
  editEventDetailsSettings: boolean;

  @Column({ type: 'boolean', name: 'invite_guests_to_event', default: false })
  inviteGuestsToEvent: boolean;

  @Column({ type: 'boolean', name: 'add_guests_to_drafts', default: false })
  addGuestsToDrafts: boolean;

  @Column({ type: 'boolean', name: 'chat_with_all_guests', default: false })
  chatWithAllGuests: boolean;

  @Column({ type: 'boolean', name: 'chat_with_guests_by_collaborator', default: false })
  chatWithGuestsByCollaborator: boolean;

  @Column({ type: 'boolean', name: 'view_full_guest_list', default: false })
  viewFullGuestList: boolean;

  @Column({ type: 'boolean', name: 'manage_in_app_rsvp_requests', default: false })
  manageInAppRsvpRequests: boolean;

  @Column({ type: 'boolean', name: 'manage_dedicated_sign_up_form', default: false })
  manageDedicatedSignUpForm: boolean;

  @Column({ type: 'boolean', name: 'post_announcements_to_all_guests', default: false })
  postAnnouncementsToAllGuests: boolean;

  @Column({ type: 'boolean', name: 'post_announcements_by_collaborator', default: false })
  postAnnouncementsByCollaborator: boolean;

  @Column({ type: 'boolean', name: 'check_in_guests', default: false })
  checkInGuests: boolean;

  @Column({ type: 'boolean', name: 'generate_event_reports', default: false })
  generateEventReports: boolean;

  @Index()
  @ManyToOne(() => Role, (role) => role.defaultRoleSettings, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Partial<Role>;
}
