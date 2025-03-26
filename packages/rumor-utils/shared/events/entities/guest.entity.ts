import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';
import { GuestStatus } from '../interfaces/event.interface';
import { TicketType } from './ticket-type.entity';
import { Ticket } from './ticket.entity';
import { RestrictedInvites } from './restricted-invites.entity';
import { UserSource } from '../grpc/events/general.pb';
import { SignupFormSubmissions } from './signup-form-submissions.entity';

@Entity()
export class Guest extends RumorBaseEntity {
  @Column({
    type: 'enum',
    enum: GuestStatus,
    name: 'status',
    default: GuestStatus.NO_STATUS,
  })
  status: GuestStatus;

  @Column({ type: 'integer', name: 'num_followers', nullable: true })
  numFollowers: number;

  @Column({ type: 'integer', name: 'max_additional_guests', nullable: true })
  maxAdditionalGuests: number;

  @Column({ type: 'integer', name: 'additional_requested_guests', default: 0 })
  additionalRequestedGuests: number;

  @Column({ type: 'boolean', name: 'check_in', default: false })
  checkIn: boolean;

  @Column({ type: 'varchar', name: 'private_guest_note', nullable: true })
  privateGuestNote: string;

  @Column({ type: 'varchar', name: 'invite_message', nullable: true })
  inviteMessage: string;

  @Column({ type: 'varchar', name: 'rejected_reason', nullable: true })
  rejectedReason: string;

  @Column({
    type: 'enum',
    enum: UserSource,
    name: 'role_added_by',
    default: UserSource.UNRECOGNIZED,
    nullable: true,
  })
  invitationSource;

  @Index()
  @ManyToOne(() => Event, event => event.guests, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, user => user.eventInvitations, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Partial<User>;

  @ManyToOne(() => User, user => user.addedGuests, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'added_by_id' })
  addedBy: User;

  @ManyToOne(() => User, user => user.declinedGuests, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'declined_by_id' })
  declinedBy: User;

  @ManyToOne(() => TicketType, ticketType => ticketType.eventGuests, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;

  @OneToOne(() => Ticket, ticket => ticket.guest, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  ticket: Ticket;

  @OneToMany(() => RestrictedInvites, ri => ri.guest, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  restrictedGuest: RestrictedInvites;

  @OneToOne(() => SignupFormSubmissions, sfs => sfs.guest)
  @JoinColumn({ name: 'signup_form_submission_id' })
  signupFormSubmissions: SignupFormSubmissions;
}
