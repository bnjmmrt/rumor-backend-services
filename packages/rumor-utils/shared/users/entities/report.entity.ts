import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { RumorBaseEntity } from "../../entities/rumor-base.entity";
import { User } from './user.entity';
import { Role } from './roles/role.entity';

@Entity()
export class Report extends RumorBaseEntity {
  @ManyToOne(() => User, (user) => user.reportsMade, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reported_by' })
  reportedBy: User;

  @ManyToOne(() => User, (user) => user.reportsReceived, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reported_to' })
  reportedTo: User;

  @Column({ type: 'text', name: 'report_message' })
  reportMessage: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'reported_by_role_id' })
  reportedByRole: Role;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'reported_to_role_id' })
  reportedToRole: Role;
}