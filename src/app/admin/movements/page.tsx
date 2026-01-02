'use client';

import { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

type Product = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  minStock: number;
};

type Supplier = {
  id: string;
  name: string;
};

type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
type ExitReason = 'SALE' | 'TRANSFER' | 'INTERNAL_USE';

export default function MovementsPage() {
  const { userRole, userId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<'ENTRY' | 'EXIT' | 'ADJUSTMENT'>('ENTRY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Operador não pode fazer ajustes (RF09 - apenas Admin/Gerente)
  const canAdjust = userRole === 'ADMIN' || userRole === 'MANAGER';

  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '',
    quantity: '',
    reason: 'SALE' as ExitReason,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, suppliersData] = await Promise.all([
        apiFetch<Product[]>('/api/products'),
        apiFetch<Supplier[]>('/api/suppliers'),
      ]);
      setProducts(productsData);
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
      setError(null);
      setSuccess(null);

      const selectedProduct = products.find(p => p.id === formData.productId);
      if (!selectedProduct) {
        setError('Produto não encontrado');
        return;
      }

      // Validação para saída: verificar se há estoque suficiente
      if (activeTab === 'EXIT') {
        if (parseInt(formData.quantity) > selectedProduct.stockQuantity) {
          setError(`Estoque insuficiente! Disponível: ${selectedProduct.stockQuantity} unidades (RF25)`);
          return;
        }
      }

      // Validação para ajuste: apenas Admin/Gerente
      if (activeTab === 'ADJUSTMENT') {
        // TODO: Verificar permissão do usuário
      }

      if (!userId) {
        setError('Usuário não identificado. Faça login novamente.');
        return;
      }

      const movementData = {
        productId: formData.productId,
        userId: userId,
        type: activeTab,
        quantity: parseInt(formData.quantity),
        reason: activeTab === 'EXIT' ? formData.reason : undefined,
        unitPrice: 0, // TODO: Calcular baseado no produto
        notes: formData.notes,
      };

      await apiFetch('/api/movements', {
        method: 'POST',
        body: JSON.stringify(movementData),
      });

      setSuccess('Movimentação registrada com sucesso!');
      resetForm();
      await loadData(); // Recarregar produtos para atualizar estoque
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar movimentação');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      supplierId: '',
      quantity: '',
      reason: 'SALE',
      notes: '',
    });
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Movimentações de Estoque</h2>
        <p className="text-sm text-zinc-700 mt-1">
          {canAdjust 
            ? 'Registre entradas, saídas e ajustes de inventário (RF07, RF08, RF09)'
            : 'Registre entradas e saídas de estoque (RF07, RF08)'
          }
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border rounded-xl p-1 flex gap-1">
        <button
          onClick={() => {
            setActiveTab('ENTRY');
            resetForm();
          }}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'ENTRY'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Entrada (Compra)
        </button>
        <button
          onClick={() => {
            setActiveTab('EXIT');
            resetForm();
          }}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'EXIT'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Saída (Venda/Uso)
        </button>
        {canAdjust && (
          <button
            onClick={() => {
              setActiveTab('ADJUSTMENT');
              resetForm();
            }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'ADJUSTMENT'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Ajuste (Perdas)
          </button>
        )}
      </div>

      {/* Form */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">
          {activeTab === 'ENTRY' && 'Registrar Entrada de Mercadoria (UC02)'}
          {activeTab === 'EXIT' && 'Registrar Saída de Mercadoria (UC03)'}
          {activeTab === 'ADJUSTMENT' && 'Ajuste de Inventário (UC04)'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'ENTRY' && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Fornecedor *
                </label>
                <select
                  required
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map(supp => (
                    <option key={supp.id} value={supp.id}>{supp.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Produto *
              </label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
              >
                <option value="">Selecione um produto</option>
                {products.map(prod => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} (SKU: {prod.sku}) - Estoque: {prod.stockQuantity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1">
                Quantidade *
                {activeTab === 'ADJUSTMENT' && (
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-zinc-600 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-2 bg-zinc-900 text-white text-xs rounded-lg shadow-lg">
                      <p className="mb-1 font-semibold">Como funciona o Ajuste:</p>
                      <p>O valor informado será a <strong>nova quantidade disponível</strong> do produto em estoque. O sistema ajustará automaticamente a diferença.</p>
                      <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900"></div>
                    </div>
                  </div>
                )}
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 placeholder:text-zinc-500"
                placeholder="0"
                style={{ color: '#18181b' }}
              />
              {selectedProduct && activeTab === 'EXIT' && (
                <p className="text-xs text-zinc-700 mt-1">
                  Disponível: {selectedProduct.stockQuantity} unidades
                </p>
              )}
              {selectedProduct && activeTab === 'ADJUSTMENT' && (
                <p className="text-xs text-zinc-700 mt-1">
                  Estoque atual: {selectedProduct.stockQuantity} unidades
                </p>
              )}
            </div>

            {activeTab === 'EXIT' && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Motivo da Saída *
                </label>
                <select
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value as ExitReason })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                >
                  <option value="SALE">Venda</option>
                  <option value="TRANSFER">Transferência</option>
                  <option value="INTERNAL_USE">Uso Interno</option>
                </select>
              </div>
            )}


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 placeholder:text-zinc-500"
                rows={3}
                placeholder="Observações sobre a movimentação..."
                style={{ color: '#18181b' }}
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-zinc-900 mb-2">Informações do Produto</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-zinc-700">Estoque Atual:</span>
                  <p className="font-medium text-zinc-900">{selectedProduct.stockQuantity}</p>
                </div>
                <div>
                  <span className="text-zinc-700">Estoque Mínimo:</span>
                  <p className="font-medium text-zinc-900">{selectedProduct.minStock}</p>
                </div>
                {activeTab === 'ENTRY' && (
                  <div>
                    <span className="text-zinc-700">Estoque Após:</span>
                    <p className="font-medium text-green-600">
                      {selectedProduct.stockQuantity + (parseInt(formData.quantity) || 0)}
                    </p>
                  </div>
                )}
                {activeTab === 'EXIT' && (
                  <div>
                    <span className="text-zinc-700">Estoque Após:</span>
                    <p className={`font-medium ${
                      (selectedProduct.stockQuantity - (parseInt(formData.quantity) || 0)) < selectedProduct.minStock
                        ? 'text-red-600'
                        : 'text-zinc-900'
                    }`}>
                      {selectedProduct.stockQuantity - (parseInt(formData.quantity) || 0)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Registrar Movimentação
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors text-sm font-medium"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Sobre as Movimentações</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Entrada:</strong> Aumenta o estoque e calcula custo médio automaticamente (RF22, UC02)</li>
          <li><strong>Saída:</strong> Diminui o estoque. Sistema bloqueia se quantidade for maior que disponível (RF25, UC03)</li>
          <li><strong>Ajuste:</strong> Apenas Admin/Gerente. Corrige saldos e cria registro de prejuízo (RF09, UC04)</li>
          <li>Todas as movimentações são rastreadas com usuário, data e hora (RF31)</li>
        </ul>
      </div>
    </div>
  );
}

