import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Event } from './event.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class FeaturedEventSection extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'integer', name: 'index' })
  index: number;

  @OneToMany(() => Event, event => event.featuredEventSection, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  events: Event[];
}
