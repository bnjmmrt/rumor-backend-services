import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity()
@Unique(['host', 'user'])
export class HostUserSettings extends RumorBaseEntity {
  @ManyToOne(() => User, (user) => user.managedByHosts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (host) => host.managingUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host: User;

  @Column({ type: 'boolean', name: 'is_spam', default: false }) // An user that was marked as spam (Automatically reject events)
  isSpam: boolean;

  @Column({ type: 'varchar', name: 'note', nullable: true })
  note: string;

  @Column({ type: 'boolean', name: 'is_favorite', default: false })
  isFavorite: boolean;
}
