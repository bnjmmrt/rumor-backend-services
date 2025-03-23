import { EventStatusEnum } from "../../interfaces/event.interface";

export const protobufPackage = "events";

export enum UserStatus {
  NEW_APPLICANT = 0,
  ACTIVE = 1,
  WAITLISTED = 2,
  DEACTIVATED = 3,
  REJECTED = 4,
  UNRECOGNIZED = -1,
}

export enum UserSource {
  INVITED_BY_HOST = 0,
  INVITED_BY_ADMIN = 1,
  INVITED_BY_COLLABORATOR = 2,
  SIGN_UP_FORM = 3,
  REQUEST_IN_APP = 4,
  PLUS_1 = 5,
  UNRECOGNIZED = -1,
  HOST_APPLICATION = 6,
}

export enum EventStatus {
  NO_EVENT_STATUS = 0,
  APPROVED_STATUS = 1,
  DRAFT_STATUS = 2,
  PENDING_STATUS = 3,
  DECLINED_STATUS = 4,
  SCHEDULED_STATUS = 5,
  UPCOMING_STATUS = 6,
  PAST_STATUS = 7,
  ARCHIVED_STATUS = 8,
  CANCELLED_STATUS = 9,
  REJECTED_STATUS = 10,
  UNRECOGNIZED = -1,
}

export enum RoleCollaboratorEnum {
  CO_HOST = 0,
  PROMOTER = 1,
  CONTRIBUTOR = 2,
  CHECK_IN = 3,
  UNRECOGNIZED = -1,
}

export enum GuestStatus {
  NO_STATUS = 0,
  DRAFT = 1,
  INVITED = 2,
  CONFIRMED = 3,
  DECLINED = 4,
  APPLIED = 5,
  REFUSED = 6,
  REVIEW = 7,
  UNRECOGNIZED = -1,
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  UNRECOGNIZED = 'UNRECOGNIZED',
}

export enum TicketStatus {
  TICKET_GENERATED = 0,
  TICKET_USED = 1,
  TICKET_CANCELED = 2,
  TICKET_EXPIRED = 3,
  UNRECOGNIZED = -1,
}

export interface Error {
  type: string;
  message: string;
}

export interface AdmissionType {
  id: string;
  name: string;
  description?: string | undefined;
  enabled?: boolean | undefined;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  enabled?: boolean | undefined;
}

export interface Talent {
  id: string;
  name: string;
  contact?: string | undefined;
  socialNetwork?: string | undefined;
  description?: string | undefined;
  imageKeyUrl?: string | undefined;
  enabled?: boolean | undefined;
}

export interface SimpleUser {
  id: string;
  phoneNumber?: string | undefined;
  firstName: string;
  lastName: string;
  email?: string | undefined;
  dateOfBirth?: string | undefined;
  approved?: boolean | undefined;
  referralCode?: string | undefined;
  imageUrl?: string | undefined;
}

export interface BulkUserData {
  eventId: string;
  message?: string | undefined;
  SuccessUserCount: number;
  failedUserCount: number;
  hostId: string;
  errFileUrl: string;
  errFilepath: string;
  users: SimpleUser[];
}

export interface EventTypeData {
  id: string;
  name: string;
  description?: string | undefined;
  enabled?: boolean | undefined;
}

export interface QueryRequest {
  query?: string | undefined;
}

export interface QuizQuestion {
  id: string;
  question: string;
  required?: boolean | undefined;
  enabled?: boolean | undefined;
  order?: number | undefined;
}

/** Reassign Ticket Type */
export interface ReassignTo {
  id?: string | undefined;
  name?: string | undefined;
}

export interface CollaboratorTicket {
  limitInvitationsNumber: number;
  name: string;
  id?: string | undefined;
  action?: string | undefined;
  reassignTo?: ReassignTo | undefined;
}

export interface EventData {
  id: string;
  name: string;
  description?: string | undefined;
  enabled?: boolean | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  limitOnePlus?: number | undefined;
  rsvpDeadline?: string | undefined;
  useQr?: boolean | undefined;
  imageFlyer?: string | undefined;
  imageCover?: string | undefined;
  location?: EventLocation | undefined;
  quizQuestions: QuizQuestionEvent[];
  collaborators: CollaboratorsEvent[];
  ticketTypes: TicketTypesEvent[];
  talents: TalentEvent[];
  eventType?: EventTypeEvent | undefined;
  status?: any | undefined;
  furtherInstructions?: string | undefined;
  showLocation?: boolean | undefined;
  admissionType?: AdmissionTypeEvent | undefined;
  owner?: OwnerEvent | undefined;
  ageLimit?: EventAgeLimit | undefined;
  autoPublished?: boolean | undefined;
  publishDate?: string | undefined;
  isPrivate?: boolean | undefined;
  capacity?: number | undefined;
  totalConfirmedGuests?: number | undefined;
  guestsCount?: number | undefined;
  currentGuestStatus?: any | undefined;
  guestId?: string | undefined;
  userId?: string | undefined;
  featuredEventSection?: FeaturedEventSection | undefined;
  timeZone?: string | undefined;
  invitationDeclinedBy?: string | undefined;
  isPublished?: boolean | undefined;
  totalCheckedInGuests?: number | undefined;
}

export interface FeaturedEventSection {
  id: string;
  name: string;
  index: number;
}

export interface FeaturedEvent {
  id: string;
  name: string;
  index: number;
  events: EventFeedData[];
}

export interface EventFeedData {
  id: string;
  name: string;
  startDate?: string | undefined;
  endDate?: string | undefined;
  imageFlyer?: string | undefined;
  imageCover?: string | undefined;
  location?: EventLocation | undefined;
}

export interface AdmissionTypeEvent {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  enabled?: boolean | undefined;
}

export interface OwnerEvent {
  id?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  profilePicture?: string | undefined;
  companyLogo?: string | undefined;
  companyName?: string | undefined;
  isFollowedByCurrentGuest?: boolean | undefined;
}

export interface EventTypeEvent {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  enabled?: boolean | undefined;
}

export interface TypeEvent {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  contact?: string | undefined;
  socialNetwork?: string | undefined;
  imageKeyUrl?: string | undefined;
  enabled?: boolean | undefined;
}

export interface TalentEvent {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  contact?: string | undefined;
  socialNetwork?: string | undefined;
  imageKeyUrl?: string | undefined;
  enabled?: boolean | undefined;
}

export interface QuizQuestionEvent {
  id?: string | undefined;
  question?: string | undefined;
  required?: boolean | undefined;
  enabled?: boolean | undefined;
  order?: number | undefined;
}

export interface TicketTypesEvent {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  capacity?: number | undefined;
  enabled?: boolean | undefined;
}

export interface CollaboratorsEvent {
  id: string;
  name: string;
  email: string;
  role: Role | undefined;
  displayName: string;
  displayNameListEvent: boolean;
  limitInvitations: boolean;
  editEventDetailsSettings: boolean;
  inviteGuestsToEvent: boolean;
  addGuestsToDrafts: boolean;
  chatWithAllGuests: boolean;
  chatWithGuestsByCollaborator: boolean;
  viewFullGuestList: boolean;
  manageInAppRsvpRequests: boolean;
  manageDedicatedSignUpForm: boolean;
  postAnnouncementsToAllGuests: boolean;
  postAnnouncementsByCollaborator: boolean;
  checkInGuests: boolean;
  generateEventReports: boolean;
  limitInvitationsNumber?: number | undefined;
  tickets: CollaboratorTicket[];
  companyLogo?: string | undefined;
  companyName?: string | undefined;
  isFollowedByCurrentGuest?: boolean | undefined;
  isApproved: boolean | undefined
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: Role | undefined;
  displayName: string;
  displayNameListEvent: boolean;
  limitInvitations: boolean;
  editEventDetailsSettings: boolean;
  inviteGuestsToEvent: boolean;
  addGuestsToDrafts: boolean;
  chatWithAllGuests: boolean;
  chatWithGuestsByCollaborator: boolean;
  viewFullGuestList: boolean;
  manageInAppRsvpRequests: boolean;
  manageDedicatedSignUpForm: boolean;
  postAnnouncementsToAllGuests: boolean;
  postAnnouncementsByCollaborator: boolean;
  checkInGuests: boolean;
  generateEventReports: boolean;
  limitInvitationsNumber?: number | undefined;
  ticketType?: TicketType | undefined;
}

export interface Role {
  name: string;
  id: string;
}

export interface EventAddress {
  address: string;
  formattedAddress: string;
  isValid?: boolean | undefined;
}

export interface EventLocation {
  placeId?: string | undefined;
  location?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  city?: string | undefined;
  regionCode?: string | undefined;
  id?: string | undefined;
}

export interface EventAgeLimit {
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  id?: string | undefined;
  enabled?: boolean | undefined;
}

export interface Guest {
  userId: string;
  name: string;
  addedBy: string;
  declinedBy: string;
  status: string;
  ticketType?: string | undefined;
  partySize?: number | undefined;
  category: string[];
  numFollowers?: string | undefined;
  baseCity?: string | undefined;
  maxAdditionalGuests?: number | undefined;
  id: string;
  profilePicture?: string | undefined;
  source?: string | undefined;
  checkIn?: boolean | undefined;
  additionalRequestedGuests?: number | undefined;
  invitationSource: string;
  email?: string | undefined;
  privateGuestNote?: string | undefined;
  isBanned?: boolean | undefined;
  questions: QuizData[];
  vouches: VouchesData[];
  addedByPicture?: string | undefined;
  declinedByPicture?: string | undefined;
  interest: string[];
  gender: Gender;
  age?: number | undefined;
  additionalGuests: AdditionalGuest[];
  phoneNumber?: string;
}

export interface AdditionalGuest {
  id: string;
  firstName: string;
  lastName: string;
  guestId: string;
  addedBy?: string | undefined;
  addedByPicture?: string | undefined;
  privateGuestNote?: string | undefined;
  checkIn?: boolean | undefined;
  profilePicture?: string | undefined;
  interest: string[];
  category: string[];
  ticketType?: string | undefined;
  numFollowers?: string | undefined;
  status?: string | undefined;
  baseCity?: string | undefined;
  declinedByPicture?: string | undefined;
  declinedBy?: string | undefined;
  gender: Gender;
  isBanned?: boolean | undefined;
  invitationSource: string;
}

export interface GuestData {
  id?: string | undefined;
  email?: string | undefined;
  phoneNumber?: string | undefined;
  name?: string | undefined;
  profilePicture?: string | undefined;
  status?: string | undefined;
  socialMediaStats?: SocialMediaStats | undefined;
  gender?: string | undefined;
  age?: number | undefined;
  address?: AddressGuest | undefined;
  interest: InterestData[];
  followsYou?: boolean | undefined;
  favorite?: boolean | undefined;
  roles: UserRoleComplete[];
  addedBy?: string | undefined;
  invitationSource: string;
  categories: string[];
  userId?: string | undefined;
  guestId?: string | undefined;
  addedByPicture?: string | undefined;
  declinedBy?: string | undefined;
  declinedByPicture?: string | undefined;
  additionalGuests: AdditionalGuest[];
  checkIn?: boolean | undefined;
  addedById?: string | undefined;
}

export interface GuestDataSimple {
  id?: string | undefined;
  email?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  profilePicture?: string | undefined;
  status?: string | undefined;
  guestStatus?: string | undefined;
  guestId?: string | undefined;
  username?: string | undefined;
  ticketType?: string | undefined;
  numberAdditionalGuests?: number | undefined;
  checkIn?: boolean | undefined;
  category: string[];
  age?: number | undefined;
  phoneNumber?: string | undefined;
  source?: string | undefined;
  addedBy?: string | undefined;
  invitationSource: UserSource;
  userId?: string | undefined;
  addedByPicture?: string | undefined;
  invitees: GuestDataSimple[];
  maxAdditionalGuests?: number | undefined;
}

export interface UserRoleComplete {
  roleId: string;
  roleName: string;
  status?: UserStatus | undefined;
  source?: UserSource | undefined;
}

export interface SocialMediaStats {
  facebookFollowersCount?: number | undefined;
  instagramFollowersCount?: number | undefined;
  youtubeFollowersCount?: number | undefined;
  tiktokFollowersCount?: number | undefined;
  linkedinFollowersCount?: number | undefined;
  xFollowersCount?: number | undefined;
  snapchatFollowersCount?: number | undefined;
}

export interface InterestData {
  id?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
}

export interface AddressGuest {
  id?: string | undefined;
  address?: string | undefined;
  googlePlaceId?: string | undefined;
}

export interface EventInvitations {
  status: GuestStatus;
  addedBy: string;
  eventId: string;
}

export interface UserEventInviteesData {
  id: string;
  name: string;
  email: string;
  profilePicture?: string | undefined;
  followerCount: string;
  status: UserStatus;
  category: string[];
  baseCity: string;
  addedBy: EventInvitations[];
}

export interface UserEventInviteesDataList {
  data: UserEventInviteesData[];
}

export interface QuizAnswer {
  answer: string;
  questionId: string;
  eventId: string;
  id?: string | undefined;
}

export interface GuestEventData {
  id: string;
  name: string;
  description?: string | undefined;
  enabled?: boolean | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  rsvpDeadline?: string | undefined;
  imageFlyer?: string | undefined;
  imageCover?: string | undefined;
  location?: EventLocation | undefined;
  eventType?: EventTypeEvent | undefined;
  status?: EventStatusEnum | undefined;
  showLocation?: boolean | undefined;
  owner?: OwnerEvent | undefined;
  ageLimit?: EventAgeLimit | undefined;
  autoPublished?: boolean | undefined;
  timeZone?: string | undefined;
  publishDate?: string | undefined;
  isPrivate?: boolean | undefined;
  guest?: GuestDataEvent | undefined;
  featuredEventSection?: FeaturedEventSection | undefined;
  isCurrentUserIsGuest?: boolean | undefined;
}

export interface GuestDataEvent {
  userId?: string | undefined;
  guestId?: string | undefined;
  guestStatus?: string | undefined;
  numFollowers?: number | undefined;
  privateGuestNote?: string | undefined;
  maxAdditionalGuests?: number | undefined;
  additionalRequestedGuests?: number | undefined;
  name?: string | undefined;
  profilePicture?: string | undefined;
}

export interface UserAttendee {
  facebookFollowerCount: number;
  instagramFollowerCount: number;
  youtubeFollowerCount: number;
  tikTokFollowerCount: number;
  linkedInFollowerCount: number;
  xFollowerCount: number;
  snapchatFollowerCount: number;
  name: string;
  userId: string;
  profilePicture: string;
  totalEventsAttended: number;
}

export interface VouchesData {
  name?: string | undefined;
  email?: string | undefined;
  picture?: string | undefined;
  isApproved?: boolean | undefined;
  idUserVouch?: string | undefined;
}

export interface QuizData {
  question?: string | undefined;
  questionId?: string | undefined;
  answer?: string | undefined;
  answerId?: string | undefined;
  required?: boolean | undefined;
  order?: number | undefined;
}

export interface DataRoleDefault {
  editEventDetailsSettings: boolean;
  inviteGuestsToEvent: boolean;
  addGuestsToDrafts: boolean;
  chatWithAllGuests: boolean;
  chatWithGuestsByCollaborator: boolean;
  viewFullGuestList: boolean;
  manageInAppRsvpRequests: boolean;
  manageDedicatedSignUpForm: boolean;
  postAnnouncementsToAllGuests: boolean;
  postAnnouncementsByCollaborator: boolean;
  checkInGuests: boolean;
  generateEventReports: boolean;
  roleName: string;
  roleId: string;
}

export interface AnswersData {
  questionId: string;
  answer?: string | undefined;
}

export interface GuestDetail {
  guestId: string;
  userId: string;
  ticketType?: string | undefined;
  maxAdditionalGuests?: number | undefined;
  privateGuestNote?: string | undefined;
  guestStatus?: GuestStatus | undefined;
  inviteMessage?: string | undefined;
  signupFormName?: string | undefined;
}

export interface GuestDetails {
  guestProfile: GuestData | undefined;
  guestDetail: GuestDetail | undefined;
  quizDataList?: QuizDataList | undefined;
  vouches: VouchesData[];
}

export interface QuizDataList {
  questions: QuizData[];
}

export interface GenerateTicketForGuestData {
  guestId?: string | undefined;
  ticketStatus?: TicketStatus | undefined;
  jwtToken?: string | undefined;
  eventQr: boolean;
  checkInStatus?: boolean | undefined;
}

export interface ToggleGuestCheckStatusData {
  guestId?: string | undefined;
  ticketStatus?: string | undefined;
  checkInStatus: boolean;
  totalConfirmedGuests?: number | undefined;
  totalCheckedInGuests?: number | undefined;
}

export interface ListEventUsedTicketsData {
  userId: string;
  guestId: string;
  ticketId: string;
  status: TicketStatus;
}

export interface CreateSignupFormRequest {
  styling: string;
  description: string;
  hasAccessForAdditionalGuests: boolean;
  questions: ISignupFormQuestionsRequest[];
}

export interface SignupFormsResponse {
  id: string;
  styling: string;
  name: string;
  submissionCount: number;
  isActive: boolean;
  isPublished: boolean;
  url: string;
  userId: string;
  userName: string;
  userProfile: string;
  description: string;
  hasAccessForAdditionalGuests: boolean;
  startDate: string;
  endDate: string;
  talents: Talent[];
  collaborators: CollaboratorsEvent[];
  questions: ISignupFormQuestionsRequest[];
  address?: EventLocation;
  type?: string;
  ageLimit?: EventAgeLimit;
  timeZone: string;
  eventStatus: EventStatusEnum;
  eventName: string;
  eventId: string;
  limitOnePlus: number;
}

export interface ISignupFormQuestionsRequest {
  id: string;
  name: string;
  action?: string;
  isRequired: boolean;
  answers?: string;
  ordering?: number;
  value?: string;
}

export const EVENTS_PACKAGE_NAME = "events";
