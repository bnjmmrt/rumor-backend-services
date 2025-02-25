import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';

@Entity()
export class UserSettings extends RumorBaseEntity {
  @Column({ type: 'boolean', name: 'allow_email_notifications', default: true })
  allowEmailNotifications: boolean;

  @Column({ type: 'boolean', name: 'allow_push_notifications', default: true })
  allowPushNotifications: boolean;

  @Column({ type: 'boolean', name: 'allow_sms_notifications', default: true })
  allowSMSNotifications: boolean;

  @Column({ type: 'boolean', name: 'notify_for_events_in_my_city', default: true })
  notifyForEventsInMyCity: boolean;

  @Column({ type: 'boolean', name: 'notify_when_following_event_host', default: true })
  notifyWhenFollowingEventHost: boolean;

  @Column({ type: 'boolean', name: 'notify_for_event_invitations', default: true })
  notifyForEventInvitations: boolean;

  @Column({ type: 'boolean', name: 'notify_for_messages_from_host', default: true })
  notifyForMessagesFromHost: boolean;

  @Column({ type: 'boolean', name: 'notify_for_event_announcements', default: true })
  notifyForEventAnnouncements: boolean;

  @Column({ type: 'boolean', name: 'mute_notifications', default: false })
  muteNotifications: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'mute_duration' })
  muteDuration: string;

  @Column({
    type: 'timestamp',
    name: 'current_time_set_duration',
    nullable: true,
  })
  currentTimeSetDuration: Date;

  @Column({ type: 'boolean', name: 'enable_sms_notification', default: true })
  enableSmsNotifications: boolean;

  @Column({ type: 'boolean', name: 'enable_app_notification', default: true })
  enableAppNotifications: boolean;

  @Column({ type: 'boolean', name: 'enable_email_notification', default: true })
  enableEmailNotifications: boolean;

  @OneToOne(() => User, (user) => user.userSettings, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
