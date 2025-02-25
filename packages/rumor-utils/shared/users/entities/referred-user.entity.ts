import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity()
export class ReferredUser extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'user_id' })
  userId: string;

  @Index()
  @Column({ type: 'varchar', name: 'referral_code' })
  referralCode: string;
}
