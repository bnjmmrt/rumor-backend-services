import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column } from 'typeorm';

@Entity('signup_form_static_questions')
export class signupFormStaticQuestions extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;
}
