import apiService from './apiService';

export const getFeaturedEventSection = (baseURL: string, id: string) =>
  apiService.getApi().get(`${baseURL}/events/${id}`);

export const validatePublishEvents = (baseURL: string) =>
  apiService.getApi().post(`${baseURL}/events/publish`);

export const syncUserTopAttendee = (baseURL: string) =>
  apiService.getApi().post(`${baseURL}/events/sync-top-attendee`);

export const announcementDetail = (eventId: string, announcementId: string) =>
  apiService.getApi().get(`/event/${eventId}/event-announcement/${announcementId}`);

export const getTicketTypes = (eventId: string) =>
  apiService.getApi().get(`/ticket-types/${eventId}`);

export const deleteHostEvents = (id: string) =>
  apiService.getApi().delete(`/delete-host-events/${id}`);
