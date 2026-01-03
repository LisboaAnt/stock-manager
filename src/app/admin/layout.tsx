'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/useAuth';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userRole, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-700">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <SidebarLayout userRole={userRole || 'OPERATOR'}>
      {children}
    </SidebarLayout>
  );
}

