import { RumorBaseEntity } from 'rumor-utils/entities/rumor-base.entity';
import { User } from './user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class HostUserMapping extends RumorBaseEntity {
  @ManyToOne(() => User, (user) => user.createdUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (host) => host.createdByHost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host: User;
}
