'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Product = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  minStock: number;
  belowMin?: boolean;
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

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Stock Manager</h1>
          <p className="text-sm text-zinc-500">Dashboard com dados mockados</p>
        </div>
        <a
          className="text-sm text-blue-600 hover:underline"
          href="/login"
        >
          Logout
        </a>
      </header>

      <main className="p-6 space-y-6">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {loading && <div className="text-sm text-zinc-600">Carregando...</div>}

        {sales && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total de Vendas</p>
              <p className="text-3xl font-semibold text-zinc-900">
                R$ {sales.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Itens Vendidos</p>
              <p className="text-3xl font-semibold text-zinc-900">{sales.totalItems}</p>
            </div>
          </div>
        )}

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-zinc-900">Estoque</h2>
            <span className="text-xs text-zinc-500">Mock data</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-600">
                  <th className="text-left py-2">Produto</th>
                  <th className="text-left py-2">SKU</th>
                  <th className="text-left py-2">Saldo</th>
                  <th className="text-left py-2">Mínimo</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.sku}</td>
                    <td className="py-2">{p.stockQuantity}</td>
                    <td className="py-2">{p.minStock}</td>
                    <td className="py-2">
                      {p.belowMin ? (
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
      </main>
    </div>
  );
}

