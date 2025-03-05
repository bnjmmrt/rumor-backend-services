import apiService from './apiService';

import { InvitedGuestRequestDto } from '../shared/events/dtos/guest.dto';
import { CreateNonMemberUserRequestDto, NonMemberSignUpRequestDto } from '../shared/users/dtos/auth.dto';

export const validate = () => apiService.getApi().post(`/auth/validate`);

export const getCurrentMember = () => apiService.getApi().get(`/auth/get-current-member`);

export const getBasicHostProfile = (id: string) => apiService.getApi().get(`/auth/admin/host/${id}/profile`);

export const getMembersOrNonMembers = (userId: string, query: string) => apiService.getApi().post(`/auth/user/get-member-or-non-member/?query=${query}`, { userId });

export const getUser = (baseURL:string, userId: string) => apiService.getApi().get(`${baseURL}/users/${userId}`);

export const getRoleByName = (name: string) => apiService.getApi().post(`/auth/roles/get-role-by-name`, { name });

export const getUserWithRolesByEmail = (email: string) => apiService.getApi().post(`/auth/get-user-with-roles-by-email`, { email });

export const getUserWithRolesByPhone = (baseURL:string, phoneNumber: string) => apiService.getApi().post(`/auth/get-user-with-roles-by-phone`, phoneNumber);

export const createNonMemberUser = (payload: CreateNonMemberUserRequestDto) => apiService.getApi().post(`/auth/non-member`, { email: payload.email, phoneNumber: payload.phoneNumber, firstName: payload.firstName, lastName: payload.lastName });

export const assignRoleToUser = (baseURL:string, userId: string, roleName?: string, roleId?: string) => apiService.getApi().post(`/auth/role/assign/${userId}`, { roleName, roleId });

export const markUserAsSpam = (baseURL:string, userId: string) => apiService.getApi().post(`${baseURL}/users/${userId}/spam`);

export const registerInvitesAsNonMember = (payload: InvitedGuestRequestDto) => apiService.getApi().post(`/auth/user/invite-as-non-member`, { firstName: payload.firstName, lastName: payload.lastName, phoneNumber: payload.phoneNumber, email: payload.email , id: payload.userId});

export const getCurrentUser = () => apiService.getApi().get(`/auth/current-user`);

export const getUserSettings = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}/settings`);

export const getPushNotificationTokens = (baseURL:string, userId: string) => apiService.getApi().get(`${baseURL}/users/${userId}/push-notification-tokens`);

export const getUserFocuses = ( id: string) => apiService.getApi().get(`/auth/user/${id}/focuses`);

export const saveFocusesForUser = ( userId: string, focusIds: string[]) => apiService.getApi().post(`/auth/user/${userId}/add-focus`, { focusIds });

export const getUserInterests = (id: string) => apiService.getApi().get(`/auth/user-interests/${id}`);

export const getVouchRequests = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}/vouch-requests`);

export const getUserVouches = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}/vouches`);

export const syncSocialStats = (baseURL:string, userId: string) => apiService.getApi().post(`${baseURL}/users/${userId}/sync-social-stats`);

export const getAllusers = (query: string) => apiService.getApi().get(`/auth/users-list?${query}`);