'use client';

import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/useAuth';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userRole } = useAuth();
  
  return (
    <SidebarLayout userRole={userRole}>
      {children}
    </SidebarLayout>
  );
}

