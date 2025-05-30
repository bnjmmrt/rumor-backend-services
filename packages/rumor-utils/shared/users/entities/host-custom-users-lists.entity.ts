import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { HostCustomUsersListsUsers } from './host-custom-users-lists-users.entity';

@Entity()
export class HostCustomUsersLists extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'list_name' })
  listName: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host: User;

  @OneToMany(() => HostCustomUsersListsUsers, listUsers => listUsers.list, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  usersLists: HostCustomUsersListsUsers[];
}
