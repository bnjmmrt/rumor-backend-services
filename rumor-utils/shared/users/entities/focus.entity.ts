import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from './user.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity()
export class Focus extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  users: User[];
}
