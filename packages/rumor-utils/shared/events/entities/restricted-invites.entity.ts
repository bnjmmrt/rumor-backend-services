import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Guest } from './guest.entity';
import { User } from '../../users/entities/user.entity';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Event } from './event.entity';

@Entity('restricted_invites')
export class RestrictedInvites extends RumorBaseEntity {
  @ManyToOne(() => Event, event => event.restrictedInvites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'id' })
  event: Event;

  @ManyToOne(() => Guest, guest => guest.restrictedGuest, { cascade: true })
  @JoinColumn({ name: 'guest_id', referencedColumnName: 'id' })
  guest: Guest; // The guest who is restricted from being invited again

  @ManyToOne(() => User, user => user.restrictedByInvitee, { cascade: true })
  @JoinColumn({ name: 'restricted_by', referencedColumnName: 'id' })
  restrictedBy: User;
}
