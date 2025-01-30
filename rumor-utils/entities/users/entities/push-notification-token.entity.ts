import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { RumorBaseEntity } from '../../rumor-base.entity';

@Entity()
export class PushNotificationToken extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'notification_token' })
  notificationToken: string;

  @Column({ type: 'varchar', name: 'device_id' })
  deviceId: string;

  @ManyToOne(() => User, (user) => user.pushNotificationToken, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
