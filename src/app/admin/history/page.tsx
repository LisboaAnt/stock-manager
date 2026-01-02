'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

type Movement = {
  id: string;
  productId: string;
  userId: string;
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
  reason?: 'SALE' | 'TRANSFER' | 'INTERNAL_USE';
  quantity: number;
  unitPrice: number;
  notes?: string;
  createdAt: string;
  userName?: string; // Nome do usuário (vem do backend)
};

type Product = {
  id: string;
  name: string;
  sku: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

export default function HistoryPage() {
  const { userRole } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    productId: '',
    userId: '',
    type: '' as '' | 'ENTRY' | 'EXIT' | 'ADJUSTMENT',
    startDate: '',
    endDate: '',
  });
  
  // Operador vê apenas suas movimentações (RF28)
  const canViewAll = userRole === 'ADMIN' || userRole === 'MANAGER';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, productsData, usersData] = await Promise.all([
        apiFetch<Movement[]>('/api/movements'),
        apiFetch<Product[]>('/api/products'),
        canViewAll ? apiFetch<User[]>('/api/users') : Promise.resolve([]),
      ]);
      setMovements(movementsData);
      setProducts(productsData);
      setUsers(usersData || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produto não encontrado';
  };

  const getProductSku = (productId: string) => {
    return products.find(p => p.id === productId)?.sku || '-';
  };

  const getUserName = (movement: Movement) => {
    // Se o movimento já tem userName (vem do backend), usar ele
    if (movement.userName) {
      return movement.userName;
    }
    // Caso contrário, buscar no array de usuários
    return users.find(u => u.id === movement.userId)?.name || movement.userId;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      ENTRY: 'Entrada',
      EXIT: 'Saída',
      ADJUSTMENT: 'Ajuste',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      ENTRY: 'bg-green-100 text-green-700',
      EXIT: 'bg-red-100 text-red-700',
      ADJUSTMENT: 'bg-yellow-100 text-yellow-700',
    };
    return colors[type as keyof typeof colors] || 'bg-zinc-100 text-zinc-700';
  };

  const getReasonLabel = (reason?: string) => {
    const labels = {
      SALE: 'Venda',
      TRANSFER: 'Transferência',
      INTERNAL_USE: 'Uso Interno',
    };
    return reason ? labels[reason as keyof typeof labels] || reason : '-';
  };

  // Obter userId do usuário logado
  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const filteredMovements = movements.filter(m => {
    // Operador vê apenas suas movimentações (RF28)
    if (!canViewAll) {
      const currentUserId = getCurrentUserId();
      if (currentUserId && m.userId !== currentUserId) return false;
    }
    
    if (filters.productId && m.productId !== filters.productId) return false;
    if (filters.userId && m.userId !== filters.userId) return false;
    if (filters.type && m.type !== filters.type) return false;
    if (filters.startDate && new Date(m.createdAt) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(m.createdAt) > new Date(filters.endDate)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white border rounded-xl p-4">
        <div className={`grid ${canViewAll ? 'grid-cols-1 md:grid-cols-6' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
          <div>
            <label htmlFor="filter-product" className="block text-sm font-medium text-zinc-700 mb-1">
              Produto
            </label>
            <select
              id="filter-product"
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-zinc-900"
            >
              <option value="">Todos os produtos</option>
              {products.map(prod => (
                <option key={prod.id} value={prod.id}>{prod.name}</option>
              ))}
            </select>
          </div>
          {canViewAll && (
            <div>
              <label htmlFor="filter-user" className="block text-sm font-medium text-zinc-700 mb-1">
                Usuário
              </label>
              <select
                id="filter-user"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-zinc-900"
              >
                <option value="">Todos os usuários</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="filter-type" className="block text-sm font-medium text-zinc-700 mb-1">
              Tipo de Movimentação
            </label>
            <select
              id="filter-type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-zinc-900"
            >
              <option value="">Todos os tipos</option>
              <option value="ENTRY">Entrada</option>
              <option value="EXIT">Saída</option>
              {canViewAll && <option value="ADJUSTMENT">Ajuste</option>}
            </select>
          </div>
          <div>
            <label htmlFor="filter-start-date" className="block text-sm font-medium text-zinc-700 mb-1">
              Data Inicial
            </label>
            <input
              id="filter-start-date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="filter-end-date" className="block text-sm font-medium text-zinc-700 mb-1">
              Data Final
            </label>
            <input
              id="filter-end-date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-zinc-900"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ productId: '', userId: '', type: '', startDate: '', endDate: '' })}
              className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                filters.productId || filters.userId || filters.type || filters.startDate || filters.endDate
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Movimentações */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">
            Movimentações ({filteredMovements.length})
          </h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-zinc-700">Carregando histórico...</div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-8 text-center text-zinc-700">Nenhuma movimentação encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Data/Hora</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Produto</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Quantidade</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Motivo</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Observações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="border-b last:border-0 hover:bg-zinc-50">
                    <td className="py-3 px-4 text-zinc-900">
                      {new Date(movement.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-zinc-900">
                      <div>
                        <p className="font-medium text-zinc-900">{getProductName(movement.productId)}</p>
                        <p className="text-xs text-zinc-700">SKU: {getProductSku(movement.productId)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(movement.type)}`}>
                        {getTypeLabel(movement.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-900 font-medium">
                      {movement.type === 'ENTRY' ? '+' : movement.type === 'EXIT' ? '-' : '='}
                      {movement.quantity}
                    </td>
                    <td className="py-3 px-4 text-zinc-900">
                      {movement.reason ? getReasonLabel(movement.reason) : '-'}
                    </td>
                    <td className="py-3 px-4 text-zinc-900">
                      {getUserName(movement)}
                    </td>
                    <td className="py-3 px-4 text-zinc-900 text-xs">
                      {movement.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Sobre o Histórico de Movimentações</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Histórico completo de todas as movimentações para rastreabilidade (RF31)</li>
          <li>Administradores e Gerentes visualizam histórico completo (RF28)</li>
          <li>Operadores visualizam apenas suas próprias movimentações (RF28)</li>
          <li>Filtros permitem consultar por produto, tipo, período e usuário (RF11)</li>
        </ul>
      </div>
    </div>
  );
}

