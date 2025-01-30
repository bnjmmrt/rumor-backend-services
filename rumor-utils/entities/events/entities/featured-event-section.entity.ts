import { RumorBaseEntity } from '../../rumor-base.entity';
import { Event } from '../entities/event.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class FeaturedEventSection extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'integer', name: 'index' })
  index: number;

  @OneToMany(() => Event, (event) => event.featuredEventSection)
  events: Event[];
}
