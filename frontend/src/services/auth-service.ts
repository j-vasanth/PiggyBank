import { apiClient } from './api-client';
import { AuthResponse, RegisterFamilyRequest, LoginRequest } from '../types';

export const authService = {
  registerFamily: async (data: RegisterFamilyRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  loginParent: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login/parent', data);
    return response.data;
  },

  loginChild: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login/child', data);
    return response.data;
  },
};
