import { RumorBaseEntity } from "../../entities/rumor-base.entity";
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Event } from "./event.entity";
import { SignupFormQuestions } from "./signup-form-questions.entity";
import { SignupFormSubmissions } from "./signup-form-submissions.entity";
import { User } from "../../users/entities/user.entity";

@Entity("event_signup_forms")
export class EventSignupForms extends RumorBaseEntity {
  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive: boolean;

  @Column({ type: "boolean", default: false, name: "is_published" })
  isPublished: boolean;

  @Column({ type: "varchar", name: "styling", nullable: false })
  styling: string;

  @Column({ type: "varchar", name: "description", nullable: true })
  description: string;

  @Column({ type: "varchar", name: "url_code", nullable: false, unique: true })
  urlCode: string;

  @Column({
    type: "boolean",
    default: false,
    name: "has_access_for_additional_guests",
  })
  hasAccessForAdditionalGuests: boolean;

  @Column({ type: "integer", default: 0, name: "additional_guests_count" })
  additionalGuestsCount: boolean;

  @Column({ type: "jsonb", nullable: false, name: "question_ids" })
  questionIds: string[];

  @ManyToOne(() => User, (user) => user.signupForms, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "host_id" })
  createdBy: User;

  @ManyToOne(() => Event, (event) => event.signupForms, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "event_id" })
  event: Event;

  @OneToMany(() => SignupFormQuestions, (question) => question.signupForms)
  questions: SignupFormQuestions[];

  @OneToMany(() => SignupFormSubmissions, (submission) => submission.signupForm)
  submissions: SignupFormSubmissions[];
}
