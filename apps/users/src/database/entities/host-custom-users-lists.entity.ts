import { Column, Entity, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { RumorBaseEntity } from 'rumor-utils/entities/rumor-base.entity';

@Entity()
export class HostCustomUsersLists extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'list_name' })
  listName: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'host_custom_users_lists_users',
    joinColumn: {
      name: 'list_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users: User[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host: User;
}
