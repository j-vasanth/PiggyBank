import { apiClient } from './api-client';
import { Child, CreateChildRequest } from '../types';

export const childrenService = {
  getChildren: async (): Promise<Child[]> => {
    const response = await apiClient.get<Child[]>('/api/v1/children/');
    return response.data;
  },

  getChild: async (childId: string): Promise<Child> => {
    const response = await apiClient.get<Child>(`/api/v1/children/${childId}`);
    return response.data;
  },

  createChild: async (data: CreateChildRequest): Promise<Child> => {
    const response = await apiClient.post<Child>('/api/v1/children/', data);
    return response.data;
  },

  updateChild: async (childId: string, data: Partial<CreateChildRequest>): Promise<Child> => {
    const response = await apiClient.patch<Child>(`/api/v1/children/${childId}`, data);
    return response.data;
  },

  deleteChild: async (childId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/children/${childId}`);
  },
};
