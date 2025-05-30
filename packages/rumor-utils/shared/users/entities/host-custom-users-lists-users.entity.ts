import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { HostCustomUsersLists } from './host-custom-users-lists.entity';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';

@Entity()
export class HostCustomUsersListsUsers extends RumorBaseEntity {
  @ManyToOne(() => HostCustomUsersLists, customList => customList.usersLists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'list_id' })
  list: HostCustomUsersLists;

  @ManyToOne(() => User, user => user.customLists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
