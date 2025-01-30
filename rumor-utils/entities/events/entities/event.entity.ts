import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';
import { Collaborator } from './collaborator.entity';
import { TicketType } from './ticket-type.entity';
import { Talent } from './talent.entity';
import { EventTypes } from './event-types.entity';
import { EventLocation } from './event-location.entity';
import { AdmissionType } from './admission-type.entity';
import { User } from '../../users/entities/user.entity';
import { EventAgeLimit } from './event-age-limit.entity';
import { Guest } from './guest.entity';
import { RumorBaseEntity } from '../../rumor-base.entity';
import { EventStatusEnum } from '../interfaces/event.interface';
import { Ticket } from './ticket.entity';
import { FeaturedEventSection } from './featured-event-section.entity';

@Entity()
export class Event extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'varchar', nullable: true, name: 'further_instructions' })
  furtherInstructions?: string;

  @Column({ type: 'boolean', default: true, name: 'enabled' })
  enabled: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'start_date' })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'end_date' })
  endDate?: Date;

  @Column({ type: 'integer', nullable: true, name: 'limit_one_plus' })
  limitOnePlus?: number;

  @Column({ type: 'timestamp', nullable: true, name: 'rsvp_deadline' })
  rsvpDeadline?: Date;

  @Column({ type: 'boolean', default: true, name: 'show_location' })
  showLocation?: boolean;

  @Column({ type: 'boolean', default: true, name: 'use_qr' })
  useQr: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'image_flyer' })
  imageFlyer?: string;

  @Column({ type: 'varchar', nullable: true, name: 'image_cover' })
  imageCover?: string;

  @Column({ type: 'enum', enum: EventStatusEnum, nullable: true, name: 'status' })
  status: EventStatusEnum;

  @Column({ type: 'timestamp', nullable: true, name: 'publish_date' })
  publishDate?: Date;

  @Column({ type: 'boolean', name: 'is_published', default: false })
  isPublished?: boolean;

  @Column({ type: 'boolean', name: 'is_private', default: false })
  isPrivate?: boolean;

  @Column({ type: 'integer', nullable: true, name: 'capacity' })
  capacity?: number;

  @OneToMany(() => QuizQuestion, (question) => question.event)
  quizQuestions: QuizQuestion[];

  @OneToMany(() => Collaborator, (collaborator) => collaborator.event)
  collaborators: Collaborator[];

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[];

  @OneToMany(() => Talent, (talent) => talent.event)
  talents: Talent[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @ManyToOne(() => EventTypes, { nullable: true, cascade: true })
  @JoinColumn({ name: 'event_type_id' })
  eventType?: EventTypes;

  @ManyToOne(() => EventLocation, { nullable: true, cascade: true })
  @JoinColumn({ name: 'event_location_id', referencedColumnName: 'id' })
  location?: EventLocation;

  @ManyToOne(() => EventAgeLimit, { nullable: true, cascade: true })
  @JoinColumn({ name: 'event_age_limit_id', referencedColumnName: 'id' })
  ageLimit?: EventAgeLimit;

  @ManyToOne(() => AdmissionType, { nullable: true, cascade: true })
  @JoinColumn({ name: 'admission_type_id', referencedColumnName: 'id' })
  admissionType?: AdmissionType;

  @ManyToOne(() => User, (owner) => owner.hostedEvents, { nullable: true, cascade: true })
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  owner?: User;

  @OneToMany(() => Guest, (guest) => guest.event)
  guests: Guest[];

  @ManyToOne(() => FeaturedEventSection, (featuredEventSection) => featuredEventSection.events, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  featuredEventSection: FeaturedEventSection;
}
