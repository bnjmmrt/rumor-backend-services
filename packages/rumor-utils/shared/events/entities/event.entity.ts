import { Entity, Column, OneToMany, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { EventStatusEnum } from '../interfaces/event.interface';
import { Ticket } from './ticket.entity';
import { FeaturedEventSection } from './featured-event-section.entity';
import { EventSignupForms } from './event-signup-forms.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { CsvUploadRecords } from './csv-upload-records.entity';
import { RestrictedInvites } from './restricted-invites.entity';
import { EventAnnouncement } from './event-announcement.entity';

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

  @Column({ type: 'timestamptz', nullable: true, name: 'start_date' })
  startDate?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'end_date' })
  endDate?: Date;

  @Column({ type: 'varchar', nullable: true, name: 'timezone' })
  timeZone?: string;

  @Column({ type: 'integer', nullable: true, name: 'limit_one_plus' })
  limitOnePlus?: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'rsvp_deadline' })
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

  @Column({ type: 'timestamptz', nullable: true, name: 'publish_date' })
  publishDate?: Date;

  @Column({ type: 'boolean', name: 'is_published', default: false })
  isPublished?: boolean;

  @Column({ type: 'boolean', name: 'is_private', default: false })
  isPrivate?: boolean;

  @Column({ type: 'integer', nullable: true, name: 'capacity', default: 0 })
  capacity?: number;

  @OneToMany(() => QuizQuestion, question => question.event, { cascade: true, onDelete: 'CASCADE' })
  quizQuestions: QuizQuestion[];

  @OneToMany(() => Collaborator, collaborator => collaborator.event, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  collaborators: Collaborator[];

  @OneToMany(() => TicketType, ticketType => ticketType.event, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  ticketTypes: TicketType[];

  @OneToMany(() => Talent, talent => talent.event, { cascade: true, onDelete: 'CASCADE' })
  talents: Talent[];

  @OneToMany(() => Ticket, ticket => ticket.event, { cascade: true, onDelete: 'CASCADE' })
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

  @ManyToOne(() => User, owner => owner.hostedEvents, { nullable: true, cascade: true })
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  owner?: User;

  @OneToMany(() => Guest, guest => guest.event, { cascade: true, onDelete: 'CASCADE' })
  guests: Guest[];

  @OneToMany(() => RestrictedInvites, ri => ri.event, { cascade: true, onDelete: 'CASCADE' })
  restrictedInvites: RestrictedInvites;

  @ManyToOne(() => FeaturedEventSection, featuredEventSection => featuredEventSection.events, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  featuredEventSection: FeaturedEventSection;

  @OneToMany(() => CsvUploadRecords, csvUploads => csvUploads.event, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  csvUploads: CsvUploadRecords[];

  @OneToMany(() => EventSignupForms, esf => esf.event, { cascade: true, onDelete: 'CASCADE' })
  signupForms: EventSignupForms[];

  @OneToMany(() => Notification, notification => notification.linkedEvent, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  notifications: Notification[];

  @OneToMany(() => EventAnnouncement, (announcement) => announcement.event, {cascade: true})
  eventAnnouncements: EventAnnouncement[];
}
