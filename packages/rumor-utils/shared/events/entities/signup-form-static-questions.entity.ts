import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column } from 'typeorm';
import { QuestionValueType } from '../interfaces/event.interface';

@Entity('signup_form_static_questions')
export class SignupFormStaticQuestions extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({
    type: 'enum',
    enum: QuestionValueType,
    name: 'type',
    default: QuestionValueType.STRING,
    nullable: false,
  })
  type: QuestionValueType;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_required' })
  isRequired: boolean;

  @Column({ type: 'boolean', default: false, name: 'has_required' })
  hasRequired: boolean;

  @Column({ type: 'varchar', name: 'key' })
  key: string;

  @Column({ type: 'boolean', default: false, name: 'has_toggle' })
  hasToggle: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_toggled' })
  isToggled: boolean;
}
