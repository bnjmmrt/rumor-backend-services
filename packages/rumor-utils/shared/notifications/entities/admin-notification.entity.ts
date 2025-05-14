import {
  AdminNotificationRecipients,
  AdminNotificationType,
} from '../grpc/notification/notification.pb';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class AdminNotification extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'title', nullable: true })
  title?: string;

  @Column({ type: 'varchar', name: 'message' })
  message: string;

  @Column({ type: 'boolean', default: false, name: 'is_scheduled' })
  isScheduled: boolean;

  @Column({ type: 'timestamp', name: 'scheduled_date', nullable: true })
  scheduledDate?: Date;

  @Column('text', { array: true, name: 'recipients' })
  recipients: AdminNotificationRecipients[];

  @Column('text', { array: true, name: 'types' })
  types: AdminNotificationType[];
}
