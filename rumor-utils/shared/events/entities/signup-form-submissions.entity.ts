import { RumorBaseEntity } from "../../entities/rumor-base.entity";
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { EventSignupForms } from "./event-signup-forms.entity";
import { User } from "../../users/entities/user.entity";

@Entity("signup_form_submissions")
export class SignupFormSubmissions extends RumorBaseEntity {
  @Column({ type: "varchar", name: "name" })
  name: string;

  @Column({ type: "varchar", name: "description" })
  description: string;

  @Column({ type: "boolean", default: true, name: "enabled" })
  enabled: boolean;

  @Column({ type: "jsonb", nullable: false, name: "answers" })
  answers: any;

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
}
