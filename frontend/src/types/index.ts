export interface User {
  id: string;
  username: string;
  name: string;
  family_id: string;
  user_type: 'parent' | 'child';
  role?: 'owner' | 'co_parent';
  avatar?: string;
  family_code?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Child {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  age: number | null;
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  child_id: string;
  parent_admin_id: string | null;
  type: 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  category: string | null;
  created_at: string;
}

export interface CreateChildRequest {
  username: string;
  name: string;
  password: string;
  avatar?: string;
  age?: number;
}

export interface CreateTransactionRequest {
  child_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  category?: string;
}

export interface RegisterFamilyRequest {
  family_name: string;
  parent_username: string;
  parent_name: string;
  parent_password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
