import { RumorBaseEntity } from '../../rumor-base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class TemporaryPasswordToken extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'token' })
  token: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @OneToOne(() => User, (user) => user.temporaryPasswordToken, { onDelete: 'CASCADE' })
  user: User;
}
