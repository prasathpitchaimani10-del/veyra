import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Admin } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  isUserLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  loading: boolean;
  loginCustomer: (token: string, user: User) => void;
  registerCustomer: (token: string, user: User) => void;
  logoutCustomer: () => void;
  updateUserContext: (user: User) => void;
  loginAdmin: (token: string, admin: Admin) => void;
  logoutAdmin: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      const customerToken = localStorage.getItem('veyra_customer_token');
      const adminToken = localStorage.getItem('veyra_admin_token');

      const promises: Promise<any>[] = [];

      if (customerToken) {
        promises.push(
          api.getProfile()
            .then((res) => setUser(res.user))
            .catch(() => {
              localStorage.removeItem('veyra_customer_token');
              setUser(null);
            })
        );
      }

      if (adminToken) {
        promises.push(
          api.getAdminProfile()
            .then((res) => setAdmin(res.admin))
            .catch(() => {
              localStorage.removeItem('veyra_admin_token');
              setAdmin(null);
            })
        );
      }

      await Promise.allSettled(promises);
      setLoading(false);
    }

    loadSessions();
  }, []);

  const loginCustomer = (token: string, userData: User) => {
    localStorage.setItem('veyra_customer_token', token);
    setUser(userData);
  };

  const registerCustomer = (token: string, userData: User) => {
    localStorage.setItem('veyra_customer_token', token);
    setUser(userData);
  };

  const logoutCustomer = () => {
    localStorage.removeItem('veyra_customer_token');
    setUser(null);
  };

  const updateUserContext = (userData: User) => {
    setUser(userData);
  };

  const loginAdmin = (token: string, adminData: Admin) => {
    localStorage.setItem('veyra_admin_token', token);
    setAdmin(adminData);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('veyra_admin_token');
    setAdmin(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getProfile();
      setUser(res.user);
    } catch {
      logoutCustomer();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isUserLoggedIn: !!user,
        isAdminLoggedIn: !!admin,
        loading,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        updateUserContext,
        loginAdmin,
        logoutAdmin,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
