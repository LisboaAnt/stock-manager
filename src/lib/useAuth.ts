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
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar dados do usuário do localStorage (vem do login)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUserRole(userData.role || 'ADMIN');
        setUserId(userData.id || null);
        setUser(userData);
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
      }
    }
    setLoading(false);
  }, []);

  return { userRole, userId, user, loading };
}

