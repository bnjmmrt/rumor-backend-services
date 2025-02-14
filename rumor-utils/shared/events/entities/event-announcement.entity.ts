import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn} from 'typeorm';
import { Event } from './event.entity';
import { TicketType } from './ticket-type.entity';
import { User } from 'shared/entities';

@Entity()
export class EventAnnouncement extends RumorBaseEntity{
    @Column({ type: 'varchar', name: 'announcement', nullable: false })
    announcement: string;

    @Column({type: 'json', name: 'attachments', nullable: true})
    attchments: any[];

    @Column({type: 'jsonb', name: 'recipients', nullable: true, comment:'Array of GuestId'})
    recipients: any[];

    @ManyToOne(() => Event)
    event?: Event;

    @ManyToOne(() => TicketType)
    ticketType: TicketType

    @ManyToOne(()=> User)
    @JoinColumn({ name: 'added', referencedColumnName: 'id' })
    user:User
}