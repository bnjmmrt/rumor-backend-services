import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class EventTypes extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'boolean', nullable: true, name: 'enabled' })
  enabled?: boolean;
}
