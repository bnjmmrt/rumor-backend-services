import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';
import { TicketStatusEnum } from '../interfaces/event.interface';
import { TicketType } from './ticket-type.entity';
import { Guest } from './guest.entity';

@Entity()
export class Ticket extends RumorBaseEntity {
  @Column({ type: 'enum', enum: TicketStatusEnum, name: 'status', default: TicketStatusEnum.TICKET_GENERATED })
  status: TicketStatusEnum;

  @Index()
  @ManyToOne(() => Event, (event) => event.tickets, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Partial<Event>;

  @ManyToOne(() => User, (user) => user.tickets, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Partial<User>;

  @ManyToOne(() => Guest, (guest) => guest.ticket, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'guest_id' })
  guest: Partial<Guest>;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets, {
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: Partial<TicketType>;
}
