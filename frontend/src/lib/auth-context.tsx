'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from './types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  demoLogin: (role: UserRole, studentIndex?: string) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole, studentIndex?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage on mount
    const savedToken = localStorage.getItem('vidyaflow_token');
    const savedUser = localStorage.getItem('vidyaflow_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('vidyaflow_token');
        localStorage.removeItem('vidyaflow_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('vidyaflow_token', authToken);
    localStorage.setItem('vidyaflow_user', JSON.stringify(userData));

    // Role-based redirection after login as required by assessment
    if (userData.role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    handleAuthSuccess(res.user, res.accessToken);
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const res = await api.register(email, password, name, role);
    handleAuthSuccess(res.user, res.accessToken);
  };

  const demoLogin = async (role: UserRole, studentIndex?: string) => {
    const res = await api.demoLogin(role, studentIndex);
    handleAuthSuccess(res.user, res.accessToken);
  };

  const switchDemoUser = async (role: UserRole, studentIndex?: string) => {
    const res = await api.demoLogin(role, studentIndex);
    setUser(res.user);
    setToken(res.accessToken);
    localStorage.setItem('vidyaflow_token', res.accessToken);
    localStorage.setItem('vidyaflow_user', JSON.stringify(res.user));

    if (res.user.role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vidyaflow_token');
    localStorage.removeItem('vidyaflow_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
