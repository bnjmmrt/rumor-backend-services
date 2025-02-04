import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class VouchRequest extends RumorBaseEntity {
  @Index()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event, { nullable: false })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column({ type: 'boolean', nullable: true, name: 'is_approved' })
  isApproved: boolean;
}
