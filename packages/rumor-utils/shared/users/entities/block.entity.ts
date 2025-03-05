import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from './user.entity';
import { Role } from './roles/role.entity';

@Entity()
export class Block extends RumorBaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: User; // The member who blocked

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocked_to' })
  blockedTo: User; // The host who got blocked

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'blocked_by_role_id' })
  blockedByRole: Role; // Role of the blocker (should be MEMBER)

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'blocked_to_role_id' })
  blockedToRole: Role; // Role of the blocked user (should be HOST)
}
