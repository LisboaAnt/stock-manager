'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { useSettings } from '@/lib/useSettings';

type Category = {
  id: string;
  name: string;
};

type Supplier = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  priceCost: number;
  priceSale: number;
  minStock: number;
  stockQuantity: number;
  supplierIds: string[];
};

export default function ProductsPage() {
  const { userRole } = useAuth();
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  
  // Operador só pode visualizar (RF05 - apenas leitura)
  const canEdit = userRole === 'ADMIN' || userRole === 'MANAGER';

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    priceCost: '',
    priceSale: '',
    minStock: '',
    supplierIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        apiFetch<Product[]>('/api/products'),
        apiFetch<Category[]>('/api/categories'),
        apiFetch<Supplier[]>('/api/suppliers'),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode,
        categoryId: formData.categoryId || null,
        priceCost: parseFloat(formData.priceCost),
        priceSale: parseFloat(formData.priceSale),
        minStock: parseInt(formData.minStock),
        stockQuantity: editingProduct ? editingProduct.stockQuantity : 0,
        supplierIds: formData.supplierIds,
      };

      if (editingProduct) {
        const updated = await apiFetch<Product>(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        const newProduct = await apiFetch<Product>('/api/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        setProducts([...products, newProduct]);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      categoryId: product.categoryId,
      priceCost: product.priceCost.toString(),
      priceSale: product.priceSale.toString(),
      minStock: product.minStock.toString(),
      supplierIds: product.supplierIds,
    });
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) return;
    try {
      // RF26: Verificar se produto tem histórico de movimentação antes de excluir
      const movements = await apiFetch<any[]>('/api/movements');
      const hasHistory = movements.some(m => m.productId === product.id);
      
      if (hasHistory) {
        setError(`Não é possível excluir o produto "${product.name}" pois ele possui histórico de movimentações. Produtos com histórico não podem ser removidos (RF26).`);
        return;
      }
      
      await apiFetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      setProducts(products.filter(p => p.id !== product.id));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir produto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      categoryId: '',
      priceCost: '',
      priceSale: '',
      minStock: '',
      supplierIds: [],
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.categoryId === filterCategory;
    const matchesStock = !filterStock || 
      (filterStock === 'low' && p.stockQuantity < p.minStock) ||
      (filterStock === 'ok' && p.stockQuantity >= p.minStock);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {canEdit ? 'Gerenciamento de Produtos' : 'Consulta de Produtos'}
            </h2>
            <p className="text-sm text-zinc-700 mt-1">
              {canEdit 
                ? 'Cadastre e gerencie produtos do estoque (RF05, RF06)'
                : 'Visualize produtos do estoque (apenas leitura)'
              }
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + Novo Produto
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {showForm && canEdit && (
          <div className="bg-white border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                    placeholder="Nome do produto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    SKU (Código Único) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Código de Barras (EAN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                    placeholder="789000000001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Preço de Custo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.priceCost}
                    onChange={(e) => setFormData({ ...formData, priceCost: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.priceSale}
                    onChange={(e) => setFormData({ ...formData, priceSale: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Estoque Mínimo *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                    placeholder="5"
                  />
                  <p className="text-xs text-zinc-700 mt-1">
                    Sistema gerará alerta quando estoque estiver abaixo deste valor
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Fornecedores
                  </label>
                  <select
                    multiple
                    value={formData.supplierIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, supplierIds: selected });
                    }}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                    size={3}
                  >
                    {suppliers.map(supp => (
                      <option key={supp.id} value={supp.id}>{supp.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-700 mt-1">
                    Segure Ctrl/Cmd para selecionar múltiplos
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
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
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Lista de Produtos</h3>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                >
                  <option value="">Todos</option>
                  <option value="low">Abaixo do mínimo</option>
                  <option value="ok">Estoque OK</option>
                </select>
              </div>
            </div>
          {loading ? (
            <div className="p-8 text-center text-zinc-700">Carregando produtos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-zinc-700">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-zinc-700">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-700">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-700">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-700">Preço Venda</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-700">Estoque</th>
                    <th className="text-left py-3 px-4 font-medium text-zinc-700">Status</th>
                    {canEdit && (
                      <th className="text-left py-3 px-4 font-medium text-zinc-700">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-zinc-50">
                      <td className="py-3 px-4 text-zinc-900 font-medium">{product.name}</td>
                      <td className="py-3 px-4 text-zinc-600">{product.sku}</td>
                      <td className="py-3 px-4 text-zinc-600">{getCategoryName(product.categoryId)}</td>
                      <td className="py-3 px-4 text-zinc-900">R$ {product.priceSale.toFixed(2)}</td>
                      <td className="py-3 px-4 text-zinc-900">{product.stockQuantity}</td>
                      <td className="py-3 px-4">
                        {settings.minStockAlert && product.stockQuantity < product.minStock ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Abaixo do mínimo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            OK
                          </span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-red-600 hover:text-red-700 text-xs font-medium"
                            >
                              Inativar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Sobre o Gerenciamento de Produtos</h4>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Produtos devem possuir: Nome, SKU (código único), Código de Barras (EAN), Categoria, Preços e Estoque Mínimo (RF05)</li>
            <li>Produtos podem ser categorizados para melhor organização (RF06)</li>
            <li>Não é permitido deletar produtos com histórico de movimentação (apenas inativar/arquivar)</li>
            <li>Sistema gera alertas quando estoque estiver abaixo do mínimo definido (RF23)</li>
          </ul>
        </div>
      </div>
  );
}

