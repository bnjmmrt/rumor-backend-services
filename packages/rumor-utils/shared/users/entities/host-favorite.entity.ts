import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class HostFavorite extends RumorBaseEntity {
  @ManyToOne(() => User, user => user.favoritedMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host: User;

  @ManyToOne(() => User, user => user.favoritedByHosts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: User;
}
