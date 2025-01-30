import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { RumorBaseEntity } from '../../rumor-base.entity';
import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';
import { GuestStatus } from '../interfaces/event.interface';
import { TicketType } from './ticket-type.entity';
import { UserSource } from '../interfaces/event.interface';
import { Ticket } from './ticket.entity';

@Entity()
export class Guest extends RumorBaseEntity {
  @Column({ type: 'enum', enum: GuestStatus, name: 'status', default: GuestStatus.NO_STATUS })
  status: GuestStatus;

  @Column({ type: 'integer', name: 'num_followers', nullable: true })
  numFollowers: number;

  @Column({ type: 'integer', name: 'max_additional_guests', nullable: true })
  maxAdditionalGuests: number;

  @Column({ type: 'integer', name: 'additional_requested_guests', default: 0 })
  additionalRequestedGuests: number;

  @Column({ type: 'varchar', name: 'private_guest_note', nullable: true })
  privateGuestNote: string;

  @Column({ type: 'varchar', name: 'invite_message', nullable: true })
  inviteMessage: string;

  @Column({ type: 'varchar', name: 'rejected_reason', nullable: true })
  rejectedReason: string;

  @Column({ type: 'enum', enum: UserSource, name: 'role_added_by', default: UserSource.UNRECOGNIZED, nullable: true })
  invitationSource;

  @Index()
  @ManyToOne(() => Event, (event) => event.guests, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, (user) => user.eventInvitations, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Partial<User>;

  @ManyToOne(() => User, (user) => user.addedGuests, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'added_by_id' })
  addedBy: User;

  @ManyToOne(() => User, (user) => user.declinedGuests, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'declined_by_id' })
  declinedBy: User;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.eventGuests, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;

  @OneToOne(() => Ticket, (ticket) => ticket.guest)
  ticket: Ticket;
}
