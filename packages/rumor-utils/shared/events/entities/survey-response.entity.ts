import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from '../../users/entities/user.entity';
import { Survey } from './survey.entity';

@Entity('survey_responses')
export class SurveyResponses extends RumorBaseEntity {
  @Column({ type: 'jsonb', name: 'response' })
  response: string;

  @Column({ type: 'timestamptz', name: 'responded_at' })
  respondedAt: Date;

  @ManyToOne(() => Survey, survey => survey.responses)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @ManyToOne(() => User, user => user.surveyResponses)
  @JoinColumn({ name: 'user_id' })  
  user: User;
}
