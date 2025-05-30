import { RumorBaseEntity } from '../../../shared/entities/rumor-base.entity';
import { Entity, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity({ name: 'notifications' })
export class Notification extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'title', nullable: false })
  title: string;

  @Column({ type: 'text', name: 'message', nullable: false })
  message: string;

  @Column({ type: 'jsonb', name: 'body', nullable: true })
  body: object;

  @Column({ type: 'varchar', name: 'notification_image', default: '' })
  notificationImage: string;

  @Column({ type: 'date', name: 'date', nullable: true })
  date?: string;

  @Column({ type: 'varchar', name: 'time', nullable: true })
  time?: string;

  @Column({ type: 'varchar', name: 'notification_type', nullable: false })
  notificationType: string;

  @Column({ type: 'varchar', name: 'notification_module', nullable: true })
  notificationModule: string;

  @Column({ type: 'varchar', name: 'role', nullable: true })
  role: string;

  @Column({ type: 'boolean', name: 'is_seen', default: false })
  isSeen: boolean;

  @ManyToMany(() => User, user => user.notifications, { cascade: ['insert', 'update'] })
  @JoinTable({
    name: 'notification_recipients',
    joinColumn: { name: 'notification_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  recipients: User[];

  @ManyToOne(() => Event, { nullable: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'linked_event_id' })
  linkedEvent?: Event;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'linked_user_id' })
  linkedUser?: User;
}
