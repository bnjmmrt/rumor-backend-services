import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Event } from './event.entity';
import { TicketType } from './ticket-type.entity';
import { User } from '../../users/entities/user.entity';
import { Guest } from './guest.entity';

@Entity('event_announcements')
export class EventAnnouncement extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'announcement', nullable: false })
  announcement: string;

  @Column({ type: 'json', name: 'attachments', nullable: true })
  attachments: any[];

  @ManyToMany(() => Guest)
  @JoinTable({
    name: 'event_announcement_recipients',
    joinColumn: { name: 'event_announcement_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'guest_id', referencedColumnName: 'id' },
  })
  recipients: Guest[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'event_announcement_collaborators',
    joinColumn: { name: 'event_announcement_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  addedBy: User[];

  @ManyToMany(() => TicketType)
  @JoinTable({
    name: 'event_announcement_ticket_types',
    joinColumn: { name: 'event_announcement_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'ticket_type_id', referencedColumnName: 'id' },
  })
  ticketType: TicketType[];

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event?: Event;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  user: User;
}
