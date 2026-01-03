'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR';

type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
};

const roleLabels: Record<Role, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  OPERATOR: 'Operador',
};

const roleColors: Record<Role, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  OPERATOR: 'bg-green-100 text-green-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'OPERATOR' as Role,
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Implementar endpoint /api/users quando backend estiver pronto
      // Por enquanto, usando mock
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@stock.local',
          name: 'Administrador',
          role: 'ADMIN',
          isActive: true,
        },
        {
          id: '2',
          email: 'gerente@stock.local',
          name: 'Gerente de Estoque',
          role: 'MANAGER',
          isActive: true,
        },
        {
          id: '3',
          email: 'operador@stock.local',
          name: 'Operador Logístico',
          role: 'OPERATOR',
          isActive: true,
        },
      ];
      setUsers(mockUsers);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar chamada à API
      if (editingUser) {
        // Atualizar usuário
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      } else {
        // Criar novo usuário
        const newUser: User = {
          id: Date.now().toString(),
          ...formData,
        };
        setUsers([...users, newUser]);
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ email: '', name: '', role: 'OPERATOR', isActive: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      // TODO: Implementar chamada à API
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      ));
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status do usuário');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ email: '', name: '', role: 'OPERATOR', isActive: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Gerenciamento de Usuários</h2>
          <p className="text-sm text-zinc-700 mt-1">
            Gerencie usuários do sistema, permissões e perfis de acesso (RF04, RF18)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Novo Usuário
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-zinc-700 mb-1">
                Email
                <input
                  id="user-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                  placeholder="usuario@exemplo.com"
                />
              </label>
            </div>
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-zinc-700 mb-1">
                Nome Completo
                <input
                  id="user-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                  placeholder="Nome do usuário"
                />
              </label>
            </div>
            <div>
              <label htmlFor="user-role" className="block text-sm font-medium text-zinc-700 mb-1">
                Perfil (RBAC)
                <select
                  id="user-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                >
                  <option value="OPERATOR">Operador Logístico</option>
                  <option value="MANAGER">Gerente de Estoque</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <p className="text-xs text-zinc-700 mt-1">
                  Administrador: acesso total | Gerente: análise e cadastros | Operador: operações diárias
                </p>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-zinc-700">
                Usuário ativo
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-zinc-900">Lista de Usuários</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-zinc-700">Carregando usuários...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-zinc-700">Nenhum usuário cadastrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Perfil</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-zinc-50">
                    <td className="py-3 px-4 text-zinc-900">{user.name}</td>
                    <td className="py-3 px-4 text-zinc-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`text-xs font-medium ${
                            user.isActive
                              ? 'text-orange-600 hover:text-orange-700'
                              : 'text-green-600 hover:text-green-700'
                          }`}
                        >
                          {user.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Sobre o Gerenciamento de Usuários</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Apenas Administradores podem gerenciar usuários (RF04, RF18)</li>
          <li>O sistema utiliza RBAC com 3 níveis hierárquicos (RF19)</li>
          <li>Usuários podem ser ativados ou desativados sem deletar o registro</li>
          <li>Autenticação via Google Auth - usuários são criados após primeiro login</li>
        </ul>
      </div>
    </div>
  );
}

