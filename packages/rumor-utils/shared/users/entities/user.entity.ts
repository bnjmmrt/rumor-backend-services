import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Relation,
  JoinTable,
  ManyToMany,
  Index,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { SocialProvider } from './social-provider.entity';
import {
  AdditionalHostInformation,
  AdditionalMemberInformation,
  Gender,
} from '../interfaces/auth.interface';
import { Address } from './address.entity';
import { Invitation } from './invitation.entity';
import { UserRole } from './roles/user-role.entity';
import { Event } from '../../events/entities/event.entity';
import { UserSettings } from './user-settings.entity';
import { Ticket } from '../../events/entities/ticket.entity';
import { Interest } from './interest.entity';
import { SocialStats } from './social-stats.entity';
import { Guest } from '../../events/entities';
import { UserQuizAnswer } from '../../events/entities/user-quiz-question-answer.entity';
import { HostFollowing } from './host-following.entity';
import { HostCustomUsersLists } from './host-custom-users-lists.entity';
import { HostFavorite } from './host-favorite.entity';
import { TemporaryPassword } from './temporary-password.entity';
import { TemporaryPasswordToken } from './temporary-password-token.entity';
import { UserAttendeeStats } from '../../events/entities/user-attendee-stats.entity';
import { Collaborator } from '../../events/entities';
import { CsvUploadRecords } from '../../events/entities';
import { VouchRequest } from './vouch-request.entity';
import { PushNotificationToken } from './push-notification-token.entity';
import { HostUserMapping } from './host-user-mapping.entity';
import { SignupFormSubmissions } from '../../events/entities/signup-form-submissions.entity';
import { EventSignupForms } from '../../events/entities/event-signup-forms.entity';
import { Notification } from '../../notifications/entities/notification.entity';

import { HostFeedback } from './host-feedback.entity';
import { HostUserSettings } from './host-user-settings.entity';
import { RestrictedInvites } from '../../events/entities';
import { Focus } from './focus.entity';
import { Report } from './report.entity';

@Entity()
export class User extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true, name: 'date_of_birth' })
  dateOfBirth: string | null;

  @Index()
  @Column({ type: 'varchar', name: 'email' })
  email: string;

  @Column({ type: 'varchar', nullable: true, name: 'username', unique: true })
  username: string;

  @Index()
  @Column({ type: 'varchar', name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: Gender, nullable: true, name: 'gender' })
  gender: Gender;

  @Column({ type: 'jsonb', nullable: true, name: 'additional_member_information', default: null })
  additionalMemberInformation: AdditionalMemberInformation | null;

  @Column({ type: 'jsonb', nullable: true, name: 'additional_host_information' })
  additionalHostInformation: AdditionalHostInformation | null;

  @Column({ type: 'varchar', name: 'profile_picture', nullable: true })
  profilePicture?: string;

  @Column({ type: 'varchar', name: 'instagram_user_name', nullable: true })
  instagramUserName?: string;

  @Column({ type: 'boolean', name: 'is_first_time_logged_in', default: false })
  isFirstTimeLoggedIn: boolean;

  @Column({ type: 'boolean', name: 'isDeactivated', default: false })
  isDeactivated: boolean;

  @Column({ type: 'boolean', name: 'instagram_validated', default: false, nullable: true })
  instagramValidated: boolean;

  @Column({ type: 'boolean', name: 'community_guidelines_agreed', default: false })
  communityGuidelinesAgreed: boolean;

  @Column({ type: 'timestamp', name: 'community_guidelines_agreed_at', nullable: true })
  communityGuidelinesAgreedAt: Date | null;

  @Column({ type: 'varchar', name: '2fa_code', nullable: true })
  twoFactorCode: string | null;

  @Column({ type: 'timestamp', name: '2fa_code_date', nullable: true })
  twoFactorCodeDate: Date | null;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deactivated_at' })
  deactivatedAt: Date | null;

  @OneToMany(() => SocialProvider, socialProvider => socialProvider.user)
  socialProviders: Relation<SocialProvider[]>;

  @OneToOne(() => SocialStats, socialStats => socialStats.user)
  socialStats: Relation<SocialStats>;

  @OneToOne(() => Address, { nullable: true, cascade: true })
  @JoinColumn({ name: 'address_id', referencedColumnName: 'id' })
  address: Address | null;

  @OneToMany(() => Invitation, invitation => invitation.inviteeUser)
  invitations: Relation<Invitation[]>;

  @OneToMany(() => UserRole, userRole => userRole.user, { cascade: true })
  roles: Relation<UserRole[]>;

  @OneToMany(() => Event, event => event.owner)
  hostedEvents: Event[];

  @OneToMany(() => UserQuizAnswer, answer => answer.user)
  answers: UserQuizAnswer[];

  @OneToOne(() => UserSettings, userSettings => userSettings.user, { cascade: ['remove'] })
  userSettings: Relation<UserSettings>;

  @ManyToMany(() => Interest, { cascade: false })
  @JoinTable({ name: 'interest_users_user' })
  interests: Interest[];

  @ManyToMany(() => Focus, { cascade: false })
  @JoinTable({ name: 'focus_users_user' })
  focuses: Focus[];

  @OneToMany(() => RestrictedInvites, ri => ri.restrictedBy, { onDelete: 'CASCADE' })
  restrictedByInvitee: RestrictedInvites;

  @OneToMany(() => Guest, guest => guest.user)
  eventInvitations: Guest[];

  @OneToMany(() => Guest, guest => guest.declinedBy)
  declinedGuests: Guest[];

  @OneToMany(() => Guest, guest => guest.addedBy)
  addedGuests: Guest[];

  @OneToMany(() => Ticket, ticket => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => HostFollowing, hostFollowing => hostFollowing.follower, { cascade: true })
  following: HostFollowing[];

  @OneToMany(() => HostFollowing, hostFollowing => hostFollowing.host, { cascade: true })
  followers: HostFollowing[];

  @OneToMany(() => HostUserMapping, hostCreated => hostCreated.user)
  createdUser: HostUserMapping[];

  @OneToMany(() => HostUserMapping, hostCreated => hostCreated.host)
  createdByHost: HostUserMapping[];

  @OneToMany(() => HostCustomUsersLists, hostCustomUsersLists => hostCustomUsersLists.host, {
    onDelete: 'CASCADE',
  })
  customLists: HostCustomUsersLists[];

  @OneToMany(() => HostFavorite, hostFavorite => hostFavorite.host, { cascade: true })
  favoritedMembers: HostFavorite[];

  @OneToMany(() => HostFavorite, hostFavorite => hostFavorite.member, { cascade: true })
  favoritedByHosts: HostFavorite[];

  @OneToOne(() => TemporaryPassword, temporaryPassword => temporaryPassword.user, {
    nullable: true,
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'temporary_password_id', referencedColumnName: 'id' })
  temporaryPassword: TemporaryPassword | null;

  @OneToOne(() => TemporaryPasswordToken, temporaryPasswordToken => temporaryPasswordToken.user, {
    nullable: true,
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'temporary_password_token_id', referencedColumnName: 'id' })
  temporaryPasswordToken: TemporaryPasswordToken | null;

  @OneToOne(() => UserAttendeeStats, attendeeStats => attendeeStats.user)
  @JoinColumn({ name: 'attendee_stats_id' })
  attendeeStats: UserAttendeeStats;

  @OneToMany(() => Collaborator, collaborator => collaborator.user)
  collaborators: Collaborator[];

  @OneToMany(() => VouchRequest, vouchRequest => vouchRequest.user)
  vouchRequests: VouchRequest[];

  @OneToMany(() => VouchRequest, vouchRequest => vouchRequest.requester)
  requestedVouches: VouchRequest[];

  @OneToMany(() => PushNotificationToken, pushNotificationToken => pushNotificationToken.user)
  pushNotificationToken: PushNotificationToken[];

  @OneToMany(() => SignupFormSubmissions, sfs => sfs.attendees)
  signupFormSubmissions: SignupFormSubmissions[];

  @OneToMany(() => EventSignupForms, esf => esf.event)
  signupForms: EventSignupForms[];

  @OneToMany(() => Notification, notification => notification.linkedUser)
  triggeredNotifications: Notification[];

  @ManyToMany(() => Notification, notification => notification.recipients)
  notifications: Notification[];

  @OneToMany(() => HostFeedback, hostFeedback => hostFeedback.user)
  hostFeedbacks: Relation<HostFeedback[]>;

  @OneToMany(() => HostUserSettings, hostUserSettings => hostUserSettings.user, { cascade: true })
  managedByHosts: Relation<HostUserSettings[]>;

  @OneToMany(() => HostUserSettings, hostUserSettings => hostUserSettings.host, { cascade: true })
  managingUsers: Relation<HostUserSettings[]>;

  @OneToMany(() => Report, report => report.reportedBy)
  reportsMade: Relation<Report[]>;

  @OneToMany(() => Report, report => report.reportedTo)
  reportsReceived: Relation<Report[]>;

  @OneToMany(() => CsvUploadRecords, csvUploads => csvUploads.host)
  csvUploads: CsvUploadRecords[];

  // New Relation: Tracks which CSV upload created this user
  @ManyToOne(() => CsvUploadRecords, csvUpload => csvUpload.uploadedUsers, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'csv_upload_id' })
  uploadedViaCsv: CsvUploadRecords | null;
}
