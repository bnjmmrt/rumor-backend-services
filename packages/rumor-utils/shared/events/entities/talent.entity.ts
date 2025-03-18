import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';import { Event } from './event.entity';

@Entity({ name: 'talents' })
export class Talent extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', nullable: true, name: 'description' })
  description: string;

  @Column({ type: 'varchar', nullable: true, name: 'contact' })
  contact: string;

  @Column({ type: 'varchar', nullable: true, name: 'social_network' })
  socialNetwork: string;

  @Column({ type: 'varchar', nullable: true, name: 'image_key_url' })
  imageKeyUrl: string;

  @Column({ type: 'boolean', nullable: true, default: true, name: 'enabled' })
  enabled: boolean;

  @Index()
  @ManyToOne(() => Event, (event) => event.talents, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
