import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, RegisterFamilyRequest, LoginRequest } from '../types';
import { authService } from '../services/auth-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest, userType: 'parent' | 'child') => Promise<void>;
  register: (data: RegisterFamilyRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('auth_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const saveAuthData = (authResponse: AuthResponse) => {
    localStorage.setItem('auth_token', authResponse.access_token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    setUser(authResponse.user);
  };

  const register = async (data: RegisterFamilyRequest) => {
    const authResponse = await authService.registerFamily(data);
    saveAuthData(authResponse);
  };

  const login = async (data: LoginRequest, userType: 'parent' | 'child') => {
    const authResponse =
      userType === 'parent'
        ? await authService.loginParent(data)
        : await authService.loginChild(data);
    saveAuthData(authResponse);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
