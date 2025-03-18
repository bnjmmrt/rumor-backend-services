import { RumorBaseEntity } from "../../entities/rumor-base.entity";
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn, OneToOne
} from "typeorm";
import { EventSignupForms } from "./event-signup-forms.entity";
import { User } from "../../users/entities/user.entity";
import { ISignupFormQuestionsRequest } from "../grpc/events/general.pb";
import { Guest } from "./guest.entity";

@Entity("signup_form_submissions")
export class SignupFormSubmissions extends RumorBaseEntity {
  @Column({ type: "jsonb", nullable: false, name: "answers" })
  answers: ISignupFormQuestionsRequest[];

  @ManyToOne(() => EventSignupForms, (signupForm) => signupForm.submissions, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "signup_form_id" })
  signupForm: EventSignupForms;

  @ManyToOne(() => User, (user) => user.signupFormSubmissions, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  attendees: User;

  @OneToOne(() => Guest, (guest) => guest.signupFormSubmissions, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "guest_id" })
  guest: Guest;
}
