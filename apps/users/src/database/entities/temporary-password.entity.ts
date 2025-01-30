import { RumorBaseEntity } from 'rumor-utils/entities/rumor-base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class TemporaryPassword extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'password' })
  password: string;

  @OneToOne(() => User, (user) => user.temporaryPassword, { onDelete: 'CASCADE' })
  user: User;
}
