import apiService from './apiService';

export const triggerSchedulerJob = (payload: any) =>
  apiService.getApi().post(`/scheduler/trigger`, payload);
