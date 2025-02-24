import apiService from './apiService';

export const getFeaturedEventSection = (baseURL:string, id: string) => apiService.getApi().get(`${baseURL}/events/${id}`);

export const validatePublishEvents = (baseURL:string) => apiService.getApi().post(`${baseURL}/events/publish`);

export const syncUserTopAttendee = (baseURL:string) => apiService.getApi().post(`${baseURL}/events/sync-top-attendee`);