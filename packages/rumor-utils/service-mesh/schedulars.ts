import apiService from './apiService';

export const triggerSchedulerJob = (payload: any) =>
  apiService.getApi().post(`/schedular/trigger`, payload);
