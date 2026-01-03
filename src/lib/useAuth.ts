'use client';

import { useState, useEffect } from 'react';

type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export function useAuth() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Buscar dados do usuário do localStorage (vem do login)
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUserRole(userData.role || null);
        setUserId(userData.id || null);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  return { 
    userRole: userRole || 'OPERATOR', 
    userId, 
    user, 
    loading, 
    isAuthenticated 
  };
}

