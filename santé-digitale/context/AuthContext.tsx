
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse, User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  role: UserRole | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [role, setRole] = useState<UserRole | null>(localStorage.getItem('user_role') as UserRole);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // GET /auth/profile/ returns the User object with the 'role' field
      const userData = await api.get<User>('/auth/profile/');
      setUser(userData);
      setRole(userData.role);
      localStorage.setItem('user_role', userData.role);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials: any) => {
    // UPDATED: Use /auth/jwt/create/ per backend spec
    const data = await api.post<AuthResponse>('/auth/jwt/create/', credentials);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setToken(data.access);
    
    // Fetch full profile immediately after login to get role and user details
    const userData = await api.get<User>('/auth/profile/');
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem('user_role', userData.role);
  };

  const register = async (registrationData: any) => {
    // UPDATED: Use /auth/register/ per backend spec
    await api.post('/auth/register/', registrationData);
    await login({ 
      username: registrationData.username, 
      password: registrationData.password 
    });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
