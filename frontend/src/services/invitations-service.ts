import { apiClient } from './api-client';

export interface Invitation {
  id: string;
  invite_code: string;
  status: string;
  created_at: string;
}

class InvitationsService {
  private readonly basePath = '/api/v1/invitations';

  async getInvitations(): Promise<Invitation[]> {
    const response = await apiClient.get<Invitation[]>(this.basePath);
    return response.data;
  }

  async createInvitation(): Promise<Invitation> {
    const response = await apiClient.post<Invitation>(this.basePath);
    return response.data;
  }

  async deleteInvitation(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}

export const invitationsService = new InvitationsService();
