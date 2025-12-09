import { apiClient } from './api-client';
import { Transaction, CreateTransactionRequest } from '../types';

export const transactionsService = {
  createTransaction: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/api/v1/transactions/', data);
    return response.data;
  },

  getChildTransactions: async (childId: string, limit = 50, offset = 0): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>(
      `/api/v1/transactions/child/${childId}?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  getFamilyTransactions: async (limit = 50, offset = 0): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>(
      `/api/v1/transactions/family?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  getMyTransactions: async (limit = 50, offset = 0): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>(
      `/api/v1/transactions/my-transactions?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  getTransaction: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/api/v1/transactions/${transactionId}`);
    return response.data;
  },
};
