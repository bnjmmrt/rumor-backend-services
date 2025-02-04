import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from './user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class HostFollowing extends RumorBaseEntity {
  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, (host) => host.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host: User;
}
