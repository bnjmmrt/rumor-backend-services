import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Column, Entity } from 'typeorm';
import { NotificationStatus } from '../interfaces/notification.interface';
import {
  AdminNotificationRecipients,
  NotificationDeliveryChannel,
} from '../grpc/notification/notification.pb';

@Entity()
export class AdminNotification extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'title', nullable: true })
  title?: string;

  @Column({ type: 'varchar', name: 'message' })
  message: string;

  @Column({ type: 'timestamp', name: 'scheduled_date', nullable: true })
  scheduledDate?: Date;

  @Column('text', { array: true, name: 'recipients' })
  recipients: AdminNotificationRecipients[];

  @Column('text', { array: true, name: 'channels' })
  channels: NotificationDeliveryChannel[];

  @Column({ type: 'enum', enum: NotificationStatus, name: 'status' })
  status: NotificationStatus;
}
