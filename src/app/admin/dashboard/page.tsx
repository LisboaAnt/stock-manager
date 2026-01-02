'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { useSettings } from '@/lib/useSettings';

type Product = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  minStock: number;
  belowMin?: boolean;
  priceCost?: number;
};

type StockReport = Product[];

type SalesReport = {
  totalSales: number;
  totalItems: number;
};

export default function Dashboard() {
  const [stock, setStock] = useState<StockReport>([]);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [stockData, salesData] = await Promise.all([
          apiFetch<StockReport>('/api/reports/stock'),
          apiFetch<SalesReport>('/api/reports/sales'),
        ]);
        setStock(stockData);
        setSales(salesData);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { userRole } = useAuth();
  const { settings } = useSettings();
  const lowStockProducts = settings.minStockAlert ? stock.filter(p => p.belowMin) : [];
  const totalProducts = stock.length;
  
  // UC05: Dashboard apenas para Gerente ou Administrador (mas Operador pode ver versão simplificada)
  // Valor total do estoque (valuation) - RF24
  const totalStockValue = stock.reduce((sum, p) => {
    const price = p.priceCost || 0;
    return sum + (p.stockQuantity * price);
  }, 0);

  return (
    <div className="space-y-6">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {loading && <div className="text-sm text-zinc-600">Carregando...</div>}

        {/* Cards de Resumo (UC05, RF24) */}
        <div className={`grid grid-cols-1 gap-4 ${(userRole === 'ADMIN' || userRole === 'MANAGER') ? 'md:grid-cols-5' : 'md:grid-cols-2'}`}>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-zinc-700">Total de Produtos</p>
            <p className="text-3xl font-semibold text-zinc-900">{totalProducts}</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-zinc-700">Produtos em Alerta</p>
            <p className="text-3xl font-semibold text-red-600">{lowStockProducts.length}</p>
            <p className="text-xs text-zinc-700 mt-1">Estoque abaixo do mínimo</p>
          </div>
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && sales && (
            <>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-sm text-zinc-700">Total de Vendas</p>
                <p className="text-3xl font-semibold text-zinc-900">
                  R$ {sales.totalSales.toFixed(2)}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-sm text-zinc-700">Itens Vendidos</p>
                <p className="text-3xl font-semibold text-zinc-900">{sales.totalItems}</p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-sm text-zinc-700">Valor Total do Estoque</p>
                <p className="text-3xl font-semibold text-zinc-900">
                  R$ {totalStockValue.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-700 mt-1">Valuation (UC05, RF24)</p>
              </div>
            </>
          )}

        </div>

        {/* Alertas de Estoque Baixo (RF23, RF29) */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-red-900 mb-3">⚠️ Produtos com Estoque Baixo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowStockProducts.slice(0, 6).map((p) => (
                <div key={p.id} className="bg-white rounded-lg p-3">
                  <p className="font-medium text-zinc-900">{p.name}</p>
                  <p className="text-xs text-zinc-700">SKU: {p.sku}</p>
                  <p className="text-sm text-red-600 font-medium mt-1">
                    {p.stockQuantity} / {p.minStock} unidades
                  </p>
                </div>
              ))}
            </div>
            {lowStockProducts.length > 6 && (
              <p className="text-sm text-red-700 mt-3">
                + {lowStockProducts.length - 6} produtos com estoque baixo
              </p>
            )}
          </div>
        )}

        <div className="bg-white border rounded-xl p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-600">
                  <th className="text-left py-2 text-zinc-900">Produto</th>
                  <th className="text-left py-2 text-zinc-900">SKU</th>
                  <th className="text-left py-2 text-zinc-900">Saldo</th>
                  <th className="text-left py-2 text-zinc-900">Mínimo</th>
                  <th className="text-left py-2 text-zinc-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 text-zinc-900">
                    <td className="py-2 text-zinc-900">{p.name}</td>
                    <td className="py-2 text-zinc-900">{p.sku}</td>
                    <td className="py-2 text-zinc-900">{p.stockQuantity}</td>
                    <td className="py-2 text-zinc-900">{p.minStock}</td>
                    <td className="py-2">
                      {settings.minStockAlert && p.belowMin ? (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Abaixo do mínimo</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

