import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EventSignupForms } from './event-signup-forms.entity';

@Entity('signup_form_questions')
export class SignupFormQuestions extends RumorBaseEntity {
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_required' })
  isRequired: boolean;
  

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'value', default: null })
  value: string;

  @Column({ type: 'integer', name: 'ordering', default: 0 })
  ordering: number;

  @ManyToOne(() => EventSignupForms, event => event.questions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'sign_up_form_id' })
  signupForms: EventSignupForms;

  @Column({ type: 'boolean', default: false, name: 'has_toggle' })
  hasToggle: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_toggled' })
  isToggled: boolean;
}
