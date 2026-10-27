import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  authApi,
  clearSessionData,
  clearTemporarySessionData,
  getBackendMode,
  getStoredUser,
  getToken,
  profileApi,
  setBackendMode as setStorageBackendMode,
  setStoredUser,
  setToken,
  systemApi,
} from '../services/api';
import { User, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendMode: 'auto' | 'spring' | 'mock';
  setBackendMode: (mode: 'auto' | 'spring' | 'mock') => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  backendStatus: { online: boolean; message: string; url: string } | null;
  checkBackendStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendMode, setModeState] = useState<'auto' | 'spring' | 'mock'>(getBackendMode());
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; message: string; url: string } | null>(null);

  // Initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setUser(storedUser);
        try {
          const userProf = await profileApi.get();
          setProfile(userProf);
        } catch (err) {
          console.warn('Erro ao carregar perfil inicial:', err);
        }
      } else {
        // Auto sign-in demo user if none yet, to provide instant delight
        try {
          const res = await authApi.login({
            email: 'eduarda.andrade@atlasskills.com',
            password: 'password123',
          });
          setToken(res.token);
          setStoredUser(res.user);
          setUser(res.user);
          setProfile(res.profile);
          setTokenState(res.token);
        } catch {
          // not critical
        }
      }
      setIsLoading(false);
      checkBackendStatus();
    };

    initAuth();

    const handleExpired = () => {
      setUser(null);
      setProfile(null);
      setTokenState(null);
      setToken(null);
      setStoredUser(null);
    };

    window.addEventListener('atlas_auth_expired', handleExpired);
    return () => window.removeEventListener('atlas_auth_expired', handleExpired);
  }, []);

  const checkBackendStatus = async () => {
    try {
      const status = await systemApi.pingBackend();
      setBackendStatus(status);
    } catch {
      setBackendStatus({
        online: false,
        message: 'Backend Atlas offline',
        url: '/api/v1',
      });
    }
  };

  const setBackendMode = (mode: 'auto' | 'spring' | 'mock') => {
    setStorageBackendMode(mode);
    setModeState(mode);
    checkBackendStatus();
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
    setProfile(res.profile);
    setTokenState(res.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    setToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
    setProfile(res.profile);
    setTokenState(res.token);
  };

  const logout = () => {
    void clearSessionData();
    setToken(null);
    setStoredUser(null);
    setUser(null);
    setProfile(null);
    setTokenState(null);
  };

  const refreshProfile = async () => {
    try {
      const prof = await profileApi.get();
      setProfile(prof);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await profileApi.update(data);
    setProfile(updated);
    return updated;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword({ currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        backendMode,
        setBackendMode,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        changePassword,
        backendStatus,
        checkBackendStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
