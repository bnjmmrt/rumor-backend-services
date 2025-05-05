import axios, { AxiosInstance } from 'axios';
import { handleErrorResponse, handleSuccessResponse } from './responseHandlers';
import { InternalServerError } from '../errors';

class ApiService {
  private api: AxiosInstance | null = null;
  private token: string | null = null;
  private customHeaders: Record<string, string> | null = null;

  public initialize(baseUrl: string, token?: string, customHeaders?: Record<string, string>): void {
    if (!baseUrl) {
      throw new InternalServerError(new Error('Cannot create axios instance without baseUrl'));
    }

    this.api = axios.create({ baseURL: baseUrl });

    if (token) {
      this.setToken(token);
    }

    if (customHeaders) {
      this.setHeaders(customHeaders);
    }

    this.api.interceptors.request.use(
      config => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        if (this.customHeaders) {
          for (const key in this.customHeaders) {
            if (Object.prototype.hasOwnProperty.call(this.customHeaders, key)) {
              config.headers[key] = this.customHeaders[key];
            }
          }
        }

        return config;
      },
      error => Promise.reject(error),
    );

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
      this.api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }

  public setHeaders(customHeaders: Record<string, string>): void {
    this.customHeaders = customHeaders;
    if (!this.api) {
      throw new InternalServerError(new Error('API not initialized. Call initialize() first.'));
    }
    for (const key in customHeaders) {
      if (Object.prototype.hasOwnProperty.call(customHeaders, key)) {
        this.api.defaults.headers.common[key] = customHeaders[key];
      }
    }
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService;
