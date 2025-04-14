import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';
import { SurveyResponses } from './survey-response.entity';

@Entity('survey')
export class Survey extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @Column({ type: 'varchar', name: 'message' })
  message?: string;

  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'varchar', name: 'status', default: 'DRAFT' })
  status: string;

  @Column({ type: 'timestamptz', name: 'event_start_date' })
  eventStartDate: Date;

  @Column({ type: 'timestamptz', name: 'event_end_date' })
  eventEndDate: Date;

  @Column({ type: 'timestamptz', name: 'survey_start_date' })
  surveyStartDate: Date;

  @Column({ type: 'timestamptz', name: 'survey_end_date' })
  surveyEndDate: Date;

  @OneToMany(() => SurveyResponses, response => response.survey)
  responses: SurveyResponses[];
}
