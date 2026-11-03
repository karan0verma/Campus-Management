'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, api } from './api';

interface AuthContextType {
  user: User | null;
  role: 'student' | 'admin' | 'technician' | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<User>;
  demoLogin: (role: 'student' | 'admin' | 'technician') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('campusops_token');
    const storedUser = localStorage.getItem('campusops_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token with backend
        api.getMe()
          .then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem('campusops_user', JSON.stringify(freshUser));
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem('campusops_token');
            localStorage.removeItem('campusops_user');
            setUser(null);
            setToken(null);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (err) {
        localStorage.removeItem('campusops_token');
        localStorage.removeItem('campusops_user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      setToken(data.access);
      setUser(data.user);
      localStorage.setItem('campusops_token', data.access);
      localStorage.setItem('campusops_user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'technician') {
        router.push('/technician/dashboard');
      } else {
        router.push('/student/dashboard');
      }

      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'student' | 'admin' | 'technician') => {
    let username = 'admin';
    let password = 'admin123';

    if (role === 'technician') {
      username = 'tech_raj';
      password = 'tech123';
    } else if (role === 'student') {
      username = 'student_arun';
      password = 'student123';
    }

    await login({ username, password });
  };

  const logout = () => {
    localStorage.removeItem('campusops_token');
    localStorage.removeItem('campusops_user');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const freshUser = await api.getMe();
      setUser(freshUser);
      localStorage.setItem('campusops_user', JSON.stringify(freshUser));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        token,
        isLoading,
        login,
        demoLogin,
        logout,
        refreshUser,
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
