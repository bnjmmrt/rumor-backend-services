import axios from 'axios';

import { handleErrorResponse, handleSuccessResponse } from './responseHandlers';
import { InternalServerError } from '../errors';

const createApiService = () => {
    let api = null;
    let token = null;

    const setToken = newToken => {
        token = newToken;
    };

    const configure = ({ baseUrl: baseURL }) => {
        if (!baseURL) {
            throw new InternalServerError(new Error('Cannot create axios instance without baseUrl'));
        }

        api = axios.create({
            baseURL
        });

        api.interceptors.request.use(
            config => {
                const customConfig = config;
                customConfig.headers.Authorization = `Bearer ${token}`;
                return customConfig;
            },
            error => Promise.reject(error)
        );

        api.interceptors.response.use(handleSuccessResponse, handleErrorResponse);
    };

    const getApi = () => api;

    return {
        configure,
        setToken,
        getApi
    };
};

export default createApiService();
