'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

type Supplier = {
  id: string;
  name: string;
  documentId?: string;
  contactEmail?: string;
};

export default function SuppliersPage() {
  const { userRole } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    documentId: '',
    contactEmail: '',
  });
  
  // Apenas Admin e Gerente podem acessar (RF16)
  const canAccess = userRole === 'ADMIN' || userRole === 'MANAGER';
  
  useEffect(() => {
    if (canAccess) {
      loadSuppliers();
    }
  }, [canAccess]);

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Acesso Negado</h2>
          <p className="text-red-700">
            Você não tem permissão para acessar esta página. Apenas Administradores e Gerentes podem gerenciar fornecedores (RF16).
          </p>
        </div>
      </div>
    );
  }

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Supplier[]>('/api/suppliers');
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        const updated = await apiFetch<Supplier>(`/api/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? updated : s));
      } else {
        const newSupplier = await apiFetch<Supplier>('/api/suppliers', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        setSuppliers([...suppliers, newSupplier]);
      }
      setShowForm(false);
      setEditingSupplier(null);
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar fornecedor');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      documentId: supplier.documentId || '',
      contactEmail: supplier.contactEmail || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`Tem certeza que deseja excluir o fornecedor "${supplier.name}"?`)) return;
    try {
      await apiFetch(`/api/suppliers/${supplier.id}`, {
        method: 'DELETE',
      });
      setSuppliers(suppliers.filter(s => s.id !== supplier.id));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir fornecedor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      documentId: '',
      contactEmail: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
    resetForm();
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.documentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSuppliersContent = () => {
    if (loading) {
      return <div className="p-8 text-center text-zinc-700">Carregando fornecedores...</div>;
    }
    
    if (filteredSuppliers.length === 0) {
      const emptyMessage = searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado';
      return <div className="p-8 text-center text-zinc-700">{emptyMessage}</div>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-zinc-700">Nome</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-700">CNPJ/CPF</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-700">Email</th>
              <th className="text-left py-3 px-4 font-medium text-zinc-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b last:border-0 hover:bg-zinc-50">
                <td className="py-3 px-4 text-zinc-900 font-medium">{supplier.name}</td>
                <td className="py-3 px-4 text-zinc-600">{supplier.documentId || '-'}</td>
                <td className="py-3 px-4 text-zinc-600">{supplier.contactEmail || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(supplier)}
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
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Gerenciamento de Fornecedores</h2>
          <p className="text-sm text-zinc-700 mt-1">
            Cadastre e gerencie fornecedores do sistema (RF16)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Novo Fornecedor
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
            {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="supplier-name" className="block text-sm font-medium text-zinc-700 mb-1">
                  Nome do Fornecedor *
                </label>
                <input
                  id="supplier-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <label htmlFor="supplier-document" className="block text-sm font-medium text-zinc-700 mb-1">
                  CNPJ/CPF
                </label>
                <input
                  id="supplier-document"
                  type="text"
                  value={formData.documentId}
                  onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="supplier-email" className="block text-sm font-medium text-zinc-700 mb-1">
                  Email de Contato
                </label>
                <input
                  id="supplier-email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                  placeholder="contato@fornecedor.com"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {editingSupplier ? 'Salvar Alterações' : 'Criar Fornecedor'}
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
          <h3 className="text-lg font-semibold text-zinc-900">Lista de Fornecedores</h3>
          <input
            type="text"
            placeholder="Buscar por nome ou CNPJ/CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
          />
        </div>
        {renderSuppliersContent()}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Sobre o Gerenciamento de Fornecedores</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Apenas Administradores e Gerentes podem cadastrar fornecedores (RF16)</li>
          <li>Fornecedores podem ser relacionados a produtos (RF17)</li>
          <li>Fornecedores são necessários para registrar entradas de estoque (UC02)</li>
        </ul>
      </div>
    </div>
  );
}

