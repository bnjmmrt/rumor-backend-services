import apiService from './apiService';

import { InvitedGuestRequestDto } from '../shared/events/dtos/guest.dto';

export const validate = (baseURL:string, token: string) => apiService.getApi().post(`${baseURL}/auth/validate`, { token });

export const getCurrentMember = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}`);

export const getBasicHostProfile = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}`);

export const getMembersOrNonMembers = (baseURL:string, userId: string, query: string) => apiService.getApi().get(`${baseURL}/users/${userId}?query=${query}`);

export const getUser = (baseURL:string, userId: string) => apiService.getApi().get(`${baseURL}/users/${userId}`);

export const getRoleByName = (baseURL:string, name: string) => apiService.getApi().get(`${baseURL}/roles/${name}`);

export const getUserWithRolesByEmail = (baseURL:string, email: string) => apiService.getApi().get(`${baseURL}/users/${email}`);

export const createNonMemberUser = (baseURL:string, email?: string, phoneNumber?: string, firstName?: string, lastName?: string) => apiService.getApi().post(`${baseURL}/users`, { email, phoneNumber, firstName, lastName });

export const assignRoleToUser = (baseURL:string, userId: string, roleName?: string, roleId?: string) => apiService.getApi().post(`${baseURL}/users/${userId}/roles`, { roleName, roleId });

export const markUserAsSpam = (baseURL:string, userId: string) => apiService.getApi().post(`${baseURL}/users/${userId}/spam`);

export const registerInvitesAsNonMember = (baseURL:string, payload: InvitedGuestRequestDto) => apiService.getApi().post(`${baseURL}/users`, { firstName: payload.firstName, lastName: payload.lastName, phoneNumber: payload.phoneNumber, email: payload.email });

export const getCurrentUser = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}`);

export const getUserSettings = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}/settings`);

export const getPushNotificationTokens = (baseURL:string, userId: string) => apiService.getApi().get(`${baseURL}/users/${userId}/push-notification-tokens`);

export const getUserFocuses = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}/focuses`);

export const saveFocusesForUser = (baseURL:string, userId: string, focusIds: string[]) => apiService.getApi().post(`${baseURL}/users/${userId}/focuses`, { focusIds });

export const getUserInterests = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}/interests`);

export const getVouchRequests = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}/vouch-requests`);

export const getUserVouches = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/users/${id}/vouches`);

export const syncSocialStats = (baseURL:string, userId: string) => apiService.getApi().post(`${baseURL}/users/${userId}/sync-social-stats`);