import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';

@Entity()
export class Invitation extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string;

  @Column({ type: 'varchar', name: 'referral_code', nullable: true })
  referralCode: string;

  @Column({ type: 'bool', name: 'sign_up_complete', default: 'false' })
  signUpComplete: boolean;

  @ManyToOne(() => User, user => user.invitations)
  @JoinColumn({ name: 'invitee_user_id' })
  inviteeUser: User;
}
