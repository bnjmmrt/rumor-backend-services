import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';
import { Tag } from '../interfaces/auth.interface';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';

@Entity()
export class HostFeedback extends RumorBaseEntity {
  @Column({ type: 'enum', enum: Tag, name: 'tag' })
  tag: Tag;

  @Column({ type: 'varchar', name: 'description' })
  description: string;

  @ManyToOne(() => User, (user) => user.hostFeedbacks, { onDelete: 'CASCADE' }) // Define the relationship
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' }) // Specify the join column
  user: User; // Define the user property
}