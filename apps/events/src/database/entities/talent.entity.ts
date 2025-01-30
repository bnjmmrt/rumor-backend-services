import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Event } from './event.entity';
import { RumorBaseEntity } from 'rumor-utils/entities/rumor-base.entity';

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
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
