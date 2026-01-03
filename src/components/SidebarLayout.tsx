'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, Settings, LogOut, Truck, ArrowUpDown, History, FileText, FolderTree } from 'lucide-react';

type SidebarLayoutProps = Readonly<{
  children: React.ReactNode;
  userRole?: 'ADMIN' | 'MANAGER' | 'OPERATOR';
}>;

export default function SidebarLayout({ children, userRole = 'ADMIN' }: SidebarLayoutProps) {
  const pathname = usePathname();
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const isOperator = userRole === 'OPERATOR';

  // Base items para todos os perfis
  const baseNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produtos', icon: Package },
  ];

  // Items específicos por perfil
  const managerNavItems = [
    { href: '/admin/categories', label: 'Categorias', icon: FolderTree },
    { href: '/admin/suppliers', label: 'Fornecedores', icon: Truck },
    { href: '/admin/movements', label: 'Movimentações', icon: ArrowUpDown },
    { href: '/admin/history', label: 'Histórico', icon: History },
    { href: '/admin/reports', label: 'Relatórios', icon: FileText },
  ];

  const operatorNavItems = [
    { href: '/admin/movements', label: 'Movimentações', icon: ArrowUpDown },
    { href: '/admin/history', label: 'Histórico', icon: History },
  ];

  const adminNavItems = [
    { href: '/admin/categories', label: 'Categorias', icon: FolderTree },
    { href: '/admin/suppliers', label: 'Fornecedores', icon: Truck },
    { href: '/admin/movements', label: 'Movimentações', icon: ArrowUpDown },
    { href: '/admin/history', label: 'Histórico', icon: History },
    { href: '/admin/reports', label: 'Relatórios', icon: FileText },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
  ];

  // Montar navItems baseado no perfil
  let navItems = baseNavItems;
  if (isAdmin) {
    navItems = [...baseNavItems, ...adminNavItems];
  } else if (isManager) {
    navItems = [...baseNavItems, ...managerNavItems];
  } else if (isOperator) {
    navItems = [...baseNavItems, ...operatorNavItems];
  }

  const roleLabels = {
    ADMIN: 'Administrador',
    MANAGER: 'Gerente',
    OPERATOR: 'Operador',
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar - Fixo */}
      <aside className="w-64 h-screen bg-blue-50 flex flex-col fixed left-0 top-0">
        <div className="p-6 border-b border-blue-100 shrink-0">
          <h1 className="text-xl font-bold text-zinc-900">Sistema de Estoque</h1>
          <p className="text-xs text-zinc-700 mt-1">{roleLabels[userRole]}</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 pl-0 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-[48px] flex items-center justify-between bg-white rounded-r-[30px] px-4 pl-10 py-3 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-700">{item.label}</span>
                </div>
                <div className="w-4 h-4 flex items-center justify-center">
                  <span 
                    className={`w-4 h-4 bg-zinc-900 rounded-full transition-all duration-300 ease-in-out ${
                      isActive 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-50'
                    }`}
                  ></span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-100 shrink-0">
          <Link
            href="/login"
            className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-zinc-700" />
              <span className="text-sm font-medium text-zinc-700">Sair</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content - Com margem para o sidebar fixo */}
      <div className="flex-1 flex flex-col ml-64">
        <header className="bg-white border-b border-zinc-200 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {pathname === '/admin/dashboard' && 'Dashboard'}
                {pathname === '/admin/products' && 'Gerenciamento de Produtos'}
                {pathname === '/admin/categories' && 'Gerenciamento de Categorias'}
                {pathname === '/admin/suppliers' && 'Gerenciamento de Fornecedores'}
                {pathname === '/admin/movements' && 'Movimentações de Estoque'}
                {pathname === '/admin/history' && 'Histórico de Movimentações'}
                {pathname === '/admin/reports' && 'Relatórios e Análises'}
                {pathname === '/admin/users' && 'Gerenciamento de Usuários'}
                {pathname === '/admin/settings' && 'Configurações do Sistema'}
              </h2>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

