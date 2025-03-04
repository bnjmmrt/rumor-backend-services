import { RumorBaseEntity } from '../../../shared/entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NotificationSource, NotificationStatus, NotificationType, RecipientsType } from '../interfaces/notification.interface';
import { EmailTemplate } from './email-templates.entity';

@Entity()
export class Notification extends RumorBaseEntity {
  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'message', type: 'varchar' })
  message: string;

  @Column({ name: 'date', type: 'date' })
  date: string;

  @Column({ name: 'time', type: 'varchar' })
  time: string;

  @Column({ name: 'type', type: 'jsonb', nullable: true })
  type?: NotificationType[];

  @Column({ name: 'recipients', type: 'jsonb', nullable: true })
  recipients?: RecipientsType[];

  @Column({ name: 'emails', type: 'jsonb', nullable: true })
  emails?: string[];

  @Column({ name: 'user_ids', type: 'jsonb', nullable: true })
  userIds?: string[];

  @Column({ name: 'status', type: 'enum', enum: NotificationStatus, default: NotificationStatus.DRAFT })
  status: NotificationStatus;

  @Column({ name: 'source', type: 'enum', enum: NotificationSource, default: NotificationSource.CUSTOM })
  source: NotificationSource;

  @ManyToOne(() => EmailTemplate, (template) => template.notifications, { nullable: true, cascade: true })
  @JoinColumn({ name: 'related_template', referencedColumnName: 'id' })
  relatedTemplate?: Partial<EmailTemplate>;
}
