import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn} from 'typeorm';
import { Event } from './event.entity';
import { TicketType } from './ticket-type.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class EventAnnouncement extends RumorBaseEntity{
    @Column({ type: 'varchar', name: 'announcement', nullable: false })
    announcement: string;

    @Column({type: 'json', name: 'attachments', nullable: true})
    attchments: any[];

    @Column({type: 'jsonb', name: 'recipients', nullable: true, comment:'Array of GuestId'})
    recipients: any[];

    @Column({type: 'jsonb', name: 'added_by', nullable: true, comment:'Array of collaborators'})
    addedBy: any[];

    @Column({type: 'jsonb', name: 'ticket_type_id', nullable: true, comment:'Array of collaborators'})
    ticketType: TicketType

    @ManyToOne(() => Event)
    @JoinColumn({ name: "event_id" })
    event?: Event;

    @ManyToOne(()=> User)
    @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
    user:User

}