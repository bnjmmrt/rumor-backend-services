import { Column, Entity, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { RumorBaseEntity } from '../../rumor-base.entity';
import { Event } from './event.entity';
import { UserQuizAnswer } from './user-quiz-question-answer.entity';

@Entity()
export class QuizQuestion extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'question' })
  question: string;

  @Column({ type: 'boolean', default: 'false', name: 'required' })
  required: boolean;

  @Column({ type: 'boolean', default: 'true', name: 'enabled' })
  enabled: boolean;

  @Column({ type: 'int', default: 0, name: 'order' })
  order: number;

  @Index()
  @ManyToOne(() => Event, (event) => event.quizQuestions, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => UserQuizAnswer, (answer) => answer.question)
  answers: UserQuizAnswer[];
}
