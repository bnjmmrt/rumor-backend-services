import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from './user.entity';
import { SocialProviderType } from '../interfaces/shared.interface';

@Entity()
export class SocialProvider extends RumorBaseEntity {
  @Column({ type: 'varchar', nullable: true, name: 'name' })
  name: string;

  @Column({ type: 'varchar', nullable: true, name: 'username' })
  username: string;

  @Column({ type: 'varchar', nullable: true, name: 'email' })
  email: string;

  @Column({ type: 'varchar', nullable: true, name: 'profile_picture' })
  profilePicture: string;

  @Column({ type: 'varchar', nullable: true, name: 'provider_id' })
  providerId: string;

  @Column({ type: 'varchar', nullable: true, name: 'token' })
  token: string;

  @Column({ type: 'varchar', nullable: true, name: 'long_lived_token' })
  longLivedToken: string;

  @Column({ type: 'varchar', nullable: true, name: 'refresh_token' })
  refreshToken: string;

  @Column({ type: 'int', nullable: true, name: 'expiration_token' })
  expirationToken: number;

  @Column({ type: 'int', nullable: true, name: 'media_count' })
  mediaCount: number;

  @Column({ type: 'varchar', nullable: true, name: 'account_type' })
  accountType: string;

  @Column({
    type: 'enum',
    enum: SocialProviderType,
    name: 'type',
  })
  type: SocialProviderType;

  @ManyToOne(() => User, user => user.socialProviders, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
