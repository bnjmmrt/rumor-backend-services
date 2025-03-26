import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Event } from './event.entity';
import { Role } from '../../users/entities/roles/role.entity';
import { User } from '../../users/entities/user.entity';
import { TicketType } from './ticket-type.entity';

@Entity('collaborator')
export class Collaborator extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'display_name', nullable: true })
  displayName: string;

  @Column({ type: 'integer', name: 'limit_invitations_number', nullable: true })
  limitInvitationsNumber?: number;

  @Column({ type: 'boolean', name: 'display_name_list_event', default: false })
  displayNameListEvent: boolean;

  @Column({ type: 'boolean', name: 'limit_invitations', default: false })
  limitInvitations: boolean;

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
  @ManyToOne(() => Event, event => event.collaborators, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Index()
  @ManyToOne(() => Role, role => role.collaborators, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Partial<Role>;

  @Index()
  @ManyToOne(() => User, user => user.collaborators, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Partial<User>;

  @Index()
  @ManyToOne(() => TicketType, ticketType => ticketType.collaborators, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: Partial<TicketType>;
}
