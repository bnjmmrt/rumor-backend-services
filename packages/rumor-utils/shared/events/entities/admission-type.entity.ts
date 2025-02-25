import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column } from 'typeorm';

@Entity('admission_type')
export class AdmissionType extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'description' })
  description: string;

  @Column({ type: 'boolean', default: true, name: 'enabled' })
  enabled: boolean;
}
