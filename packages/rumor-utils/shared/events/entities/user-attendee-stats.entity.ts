import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';import { User } from '../../users/entities/user.entity';

@Entity()
export class UserAttendeeStats extends RumorBaseEntity {
  @Column({ type: 'int', default: 0, name: 'total_events_attended' })
  totalEventsAttended: number;

  @Column({ type: 'int', default: 0, name: 'facebook_followers_count' })
  facebookFollowersCount: number;

  @Column({ type: 'int', default: 0, name: 'instagram_followers_count' })
  instagramFollowersCount: number;

  @Column({ type: 'int', default: 0, name: 'youtube_followers_count' })
  youtubeFollowersCount: number;

  @Column({ type: 'int', default: 0, name: 'tiktok_followers_count' })
  tiktokFollowersCount: number;

  @Column({ type: 'int', default: 0, name: 'linkedin_followers_count' })
  linkedinFollowersCount: number;

  @Column({ type: 'int', default: 0, name: 'x_followers_count' })
  xFollowersCount: number;

  @Column({ type: 'int', default: 0, name: 'snapchat_followers_count' })
  snapchatFollowersCount: number;

  @OneToOne(() => User, (user) => user.attendeeStats, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
