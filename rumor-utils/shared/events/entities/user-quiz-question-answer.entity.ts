import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Event } from './event.entity';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';import { User } from '../../users/entities/user.entity';
import { QuizQuestion } from './quiz-question.entity';

@Entity()
export class UserQuizAnswer extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'answer' })
  answer: string;

  @ManyToOne(() => User, (user) => user.answers, { nullable: true, cascade: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: Partial<User>;

  @ManyToOne(() => QuizQuestion, (question) => question.answers, { nullable: true, cascade: true })
  @JoinColumn({ name: 'question_id', referencedColumnName: 'id' })
  question?: QuizQuestion;

  @Index()
  @ManyToOne(() => Event, (event) => event.quizQuestions, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
