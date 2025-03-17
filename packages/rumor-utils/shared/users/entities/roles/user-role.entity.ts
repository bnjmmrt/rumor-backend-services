import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { RumorBaseEntity } from '../../../entities/rumor-base.entity';
import { User } from '../user.entity';
import { Role } from './role.entity';
import { UserSource, UserStatus } from '../../interfaces/shared.interface';

@Entity()
export class UserRole extends RumorBaseEntity {
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.NEW_APPLICANT, name: 'status' })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserSource, nullable: true, name: 'source', default: UserSource.REQUEST_IN_APP })
  source?: UserSource;

  @Column({ type: 'boolean', name: 'is_blacklisted', nullable: true }) // An user that was marked as spam (Automatically reject events)
  isBlacklisted: boolean;

  @Column({ type: 'boolean', name: 'profile_setup_completed', default: false })
  profileSetupCompleted: boolean;

  @ManyToOne(() => User, (user) => user.roles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
