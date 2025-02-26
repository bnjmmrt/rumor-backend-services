import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from './user.entity';
import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ReferralRequest extends RumorBaseEntity {
  @Index()
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column({ type: 'boolean', nullable: true, name: 'is_approved' })
  isApproved: boolean;
}
