'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

type Category = {
  id: string;
  name: string;
};

export default function CategoriesPage() {
  const { userRole } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
  });

  // Apenas Admin e Gerente podem acessar
  const canAccess = userRole === 'ADMIN' || userRole === 'MANAGER';

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Category[]>('/api/categories');
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) {
      loadCategories();
    }
  }, [canAccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const updated = await apiFetch<Category>(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
      } else {
        const newCategory = await apiFetch<Category>('/api/categories', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setCategories([...categories, newCategory]);
      }
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
    });
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) return;
    try {
      await apiFetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });
      setCategories(categories.filter(c => c.id !== category.id));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir categoria');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    resetForm();
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Acesso Negado</h2>
          <p className="text-red-700">
            Você não tem permissão para acessar esta página. Apenas Administradores e Gerentes podem gerenciar categorias.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Gerenciamento de Categorias</h2>
          <p className="text-sm text-zinc-700 mt-1">
            Cadastre e gerencie categorias de produtos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Nova Categoria
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
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-zinc-700 mb-1">
                Nome da Categoria *
                <input
                  id="category-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                  placeholder="Ex: Bebidas, Alimentos, Limpeza..."
                />
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
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

      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">Lista de Categorias</h3>
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-zinc-700">Carregando categorias...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-zinc-700">
            {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b last:border-0 hover:bg-zinc-50">
                    <td className="py-3 px-4 text-zinc-900 font-medium">{category.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="text-red-600 hover:text-red-700 text-xs font-medium"
                        >
                          Excluir
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
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Sobre o Gerenciamento de Categorias</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>As categorias ajudam a organizar os produtos do estoque</li>
          <li>Você pode criar, editar e excluir categorias</li>
          <li>As categorias são usadas ao cadastrar novos produtos</li>
        </ul>
      </div>
    </div>
  );
}

