import { RumorBaseEntity } from 'rumor-utils/entities/rumor-base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class EventAgeLimit extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'description' })
  description: string;

  @Column({ type: 'integer', name: 'min_age' })
  minAge: number;

  @Column({ type: 'integer', name: 'max_age' })
  maxAge: number;

  @Column({ type: 'boolean', default: true, name: 'enabled' })
  enabled: boolean;
}
