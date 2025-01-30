import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { RumorBaseEntity } from '../../rumor-base.entity';
import { Event } from './event.entity';
import { Guest } from './guest.entity';
import { Ticket } from './ticket.entity';
import { Collaborator } from './collaborator.entity';

@Entity()
export class TicketType extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'description' })
  description: string;

  @Column({ type: 'integer', name: 'capacity' })
  capacity: number;

  @Column({ type: 'boolean', default: true, name: 'enabled' })
  enabled: boolean;

  @Index()
  @ManyToOne(() => Event, (event) => event.ticketTypes, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Guest, (guest) => guest.ticketType)
  eventGuests: Guest[];

  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  tickets: Ticket[];

  @OneToMany(() => Collaborator, (collaborator) => collaborator.ticketType)
  collaborators: Collaborator[];
}
