import { HostSocialMedia } from '../grpc/auth/auth.pb';
import { UserStatus } from './shared.interface';

export interface AdditionalMemberInformation {
  socialUrl: string;
}

export interface AdditionalHostInformation {
  companyName: string;
  companyLogo: string;
  eventsPerYear: number;
  website: string;
  referredBy: string;
  bio: string;
  socialMedia: HostSocialMedia;
}

export interface RawUser {
  user_id: string | undefined;
  user_username: string | undefined;
  user_email: string | undefined;
  user_first_name: string | undefined;
  user_last_name: string | undefined;
  user_phone_number: string | undefined;
  user_role_status: UserStatus | string | undefined;
  user_created_at: Date;
}

export interface RawHost extends RawUser {
  user_additional_host_information: AdditionalHostInformation;
  all_events_count: number;
  upcoming_events_count: number;
  past_events_count: number;
  declined_events_count: number;
  draft_events_count: number;
  pending_events_count: number;
  user_profile_picture: string;
  user_role_created_at: string;
  user_role_source: string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export enum RoleType {
  Admin = 'admin',
  RumorSuperAdmin = 'rumor_super_admin',
  RumorManager = 'rumor_manager',
  Host = 'host',
  MainHost = 'main_host',
  CoHost = 'co_host',
  Promotor = 'promotor',
  Contributor = 'contributor',
  CheckIn = 'check_in',
  Member = 'member',
  NonMember = 'non_member',
}

export enum Tag {
  General = 'general',
  Bug = 'bug',
  NewFeatureSuggestion = 'new_feature_suggestion',
}

export enum FilterTypes {
  list = 'list',
  pastEvents = 'pastEvents',
  category = 'category',
  baseCity = 'baseCity',
  gender = 'gender',
  age = 'age',
  interest = 'interest',
  type = 'type',
  newType = 'newType',
  ticketType = 'ticketType',
  partySize = 'partySize',
  addedBy = 'addedBy',
  requestSource = 'requestSource',
  checkedIn = 'checkedIn',
  declinedBy = 'declinedBy',
  spammed = 'spammed',
  userSource = 'userSource',
  vouch = 'vouch',
  followers = 'followers',
}

export const FilterTypeValues: Record<FilterTypes, string> = {
  [FilterTypes.list]: 'checkbox',
  [FilterTypes.pastEvents]: 'checkbox',
  [FilterTypes.category]: 'checkbox',
  [FilterTypes.baseCity]: 'baseCityFilter',
  [FilterTypes.gender]: 'checkbox',
  [FilterTypes.age]: 'age',
  [FilterTypes.interest]: 'checkbox',
  [FilterTypes.type]: 'checkbox',
  [FilterTypes.ticketType]: 'checkbox',
  [FilterTypes.partySize]: 'partySize',
  [FilterTypes.addedBy]: 'checkbox',
  [FilterTypes.requestSource]: 'checkbox',
  [FilterTypes.checkedIn]: 'checkbox',
  [FilterTypes.declinedBy]: 'checkbox',
  [FilterTypes.spammed]: 'checkbox',
  [FilterTypes.userSource]: 'checkbox',
  [FilterTypes.vouch]: 'checkbox',
  [FilterTypes.followers]: 'followers',
  [FilterTypes.newType]: 'checkbox',
};
