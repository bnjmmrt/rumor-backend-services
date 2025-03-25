import axios, { AxiosInstance } from 'axios';
import { handleErrorResponse, handleSuccessResponse } from './responseHandlers';
import { InternalServerError } from '../errors';

class ApiService {
  private api: AxiosInstance | null = null;
  private token: string | null = null;

  public initialize(baseUrl: string, token?: string): void {
    if (!baseUrl) {
      throw new InternalServerError(new Error('Cannot create axios instance without baseUrl'));
    }

    this.api = axios.create({ baseURL: baseUrl });

    if (token) {
      this.setToken(token);
      this.api.interceptors.request.use(
        config => {
          if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
          }
          return config;
        },
        error => Promise.reject(error),
      );
    }

    this.api.interceptors.response.use(handleSuccessResponse, handleErrorResponse);
  }

  public getApi(): AxiosInstance {
    if (!this.api) {
      throw new InternalServerError(
        new Error('API not configured. Call initialize() before using getApi().'),
      );
    }
    return this.api;
  }

  public setToken(token: string): void {
    this.token = token;
    if (this.api) {
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
    }
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService;
