import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';
import { RumorBaseEntity } from '../../rumor-base.entity';
import { User } from './user.entity';

@Entity()
export class Interest extends RumorBaseEntity {
  @Column({ type: 'varchar', unique: true, name: 'name' })
  name: string;

  @Column({ type: 'varchar', nullable: true, name: 'description' })
  description: string;

  @Column({ type: 'boolean', default: true, name: 'enabled' })
  enabled: boolean;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  users: User[];
}
