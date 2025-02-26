import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class ReferralCode extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'code', unique: true })
  code: string;

  @Column({ type: 'varchar', name: 'description' })
  description: string;

  @Column({ type: 'integer', name: 'usage_count', default: 0 })
  usageCount: number;

  @Column({ type: 'integer', name: 'usage_limit' })
  usageLimit: number;

  @Column({ type: 'timestamp', name: 'expiration_date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'boolean', default: false, name: 'is_manually_deactivated' })
  isManuallyDeactivated: boolean;
}
