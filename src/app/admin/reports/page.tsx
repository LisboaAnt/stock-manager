'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { useSettings } from '@/lib/useSettings';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

type DetailedSalesReport = {
  salesByProduct: Array<{
    productId: string;
    productName: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
    saleCount: number;
  }>;
  salesByPeriod: Array<{
    date: string;
    saleCount: number;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topProducts: Array<{
    productName: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
};

export default function ReportsPage() {
  const { userRole } = useAuth();
  const { settings } = useSettings();
  const [stockReport, setStockReport] = useState<StockReport>([]);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [detailedSalesReport, setDetailedSalesReport] = useState<DetailedSalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'CSV' | 'JSON' | 'PDF' | 'EXCEL'>('CSV');
  const isAdmin = userRole === 'ADMIN';
  
  // Apenas Admin e Gerente podem acessar relatórios financeiros (RF13, RF14)
  const canAccess = userRole === 'ADMIN' || userRole === 'MANAGER';
  
  const loadReports = async () => {
    try {
      setLoading(true);
      const promises: Array<Promise<StockReport | SalesReport | DetailedSalesReport>> = [
        apiFetch<StockReport>('/api/reports/stock'),
        apiFetch<SalesReport>('/api/reports/sales'),
      ];
      
      // Apenas ADMIN carrega relatórios detalhados de vendas (SOL-002)
      if (isAdmin) {
        promises.push(apiFetch<DetailedSalesReport>('/api/reports/sales/detailed'));
      }
      
      const [stockData, salesData, detailedData] = await Promise.all(promises) as [StockReport, SalesReport, DetailedSalesReport?];
      setStockReport(stockData);
      setSalesReport(salesData);
      if (isAdmin && detailedData) {
        setDetailedSalesReport(detailedData);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Acesso Negado</h2>
          <p className="text-red-700">
            Você não tem permissão para acessar esta página. Apenas Administradores e Gerentes podem visualizar relatórios financeiros (RF13, RF14).
          </p>
        </div>
      </div>
    );
  }

  // Funções auxiliares para reduzir complexidade cognitiva
  const getStockStatus = (belowMin: boolean | undefined): string => {
    return belowMin ? 'Abaixo do Mínimo' : 'OK';
  };

  const getStockTableData = () => {
    return stockReport.map(p => [
      p.name,
      p.sku,
      p.stockQuantity.toString(),
      p.minStock.toString(),
      getStockStatus(p.belowMin)
    ]);
  };

  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (date: string): void => {
    const headers = ['Produto', 'SKU', 'Estoque Atual', 'Estoque Mínimo', 'Status'];
    const rows = getStockTableData();
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `relatorio-estoque-${date}.csv`);
  };

  const exportToJSON = (date: string): void => {
    const json = JSON.stringify(
      { stock: stockReport, sales: salesReport, detailedSales: detailedSalesReport },
      null,
      2
    );
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, `relatorio-${date}.json`);
  };

  const createExcelStockSheet = () => {
    const stockData = [
      ['Produto', 'SKU', 'Estoque Atual', 'Estoque Mínimo', 'Status'],
      ...stockReport.map(p => [
        p.name,
        p.sku,
        p.stockQuantity,
        p.minStock,
        getStockStatus(p.belowMin)
      ])
    ];
    return XLSX.utils.aoa_to_sheet(stockData);
  };

  const createExcelSalesSheet = () => {
    if (!salesReport) return null;
    const salesData = [
      ['Métrica', 'Valor'],
      ['Total de Vendas', salesReport.totalSales],
      ['Itens Vendidos', salesReport.totalItems]
    ];
    return XLSX.utils.aoa_to_sheet(salesData);
  };

  const createExcelDetailedSalesSheet = () => {
    if (!isAdmin || !detailedSalesReport) return null;
    const detailedData = [
      ['Produto', 'SKU', 'Quantidade Total', 'Receita Total', 'Número de Vendas'],
      ...detailedSalesReport.salesByProduct.map(s => [
        s.productName,
        s.sku,
        s.totalQuantity,
        s.totalRevenue,
        s.saleCount
      ])
    ];
    return XLSX.utils.aoa_to_sheet(detailedData);
  };

  const exportToExcel = (date: string): void => {
    const wb = XLSX.utils.book_new();
    const wsStock = createExcelStockSheet();
    XLSX.utils.book_append_sheet(wb, wsStock, 'Estoque');
    
    const wsSales = createExcelSalesSheet();
    if (wsSales) {
      XLSX.utils.book_append_sheet(wb, wsSales, 'Vendas');
    }
    
    const wsDetailed = createExcelDetailedSalesSheet();
    if (wsDetailed) {
      XLSX.utils.book_append_sheet(wb, wsDetailed, 'Vendas por Produto');
    }
    
    XLSX.writeFile(wb, `relatorio-${date}.xlsx`);
  };

  const addPDFStockTable = (doc: jsPDF): number => {
    const tableData = getStockTableData();
    autoTable(doc, {
      head: [['Produto', 'SKU', 'Estoque Atual', 'Estoque Mínimo', 'Status']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    const lastAutoTable = (doc as any).lastAutoTable;
    return lastAutoTable ? lastAutoTable.finalY + 15 : 60;
  };

  const addPDFSalesSummary = (doc: jsPDF, startY: number): number => {
    if (!salesReport) return startY;
    let finalY = startY;
    doc.setFontSize(14);
    doc.text('Resumo de Vendas', 14, finalY);
    finalY += 10;
    doc.setFontSize(10);
    doc.text(`Total de Vendas: R$ ${salesReport.totalSales.toFixed(2)}`, 14, finalY);
    finalY += 7;
    doc.text(`Itens Vendidos: ${salesReport.totalItems}`, 14, finalY);
    return finalY + 10;
  };

  const addPDFDetailedSales = (doc: jsPDF, startY: number): void => {
    if (!isAdmin || !detailedSalesReport) return;
    let finalY = startY;
    if (salesReport) finalY += 20;
    
    doc.setFontSize(14);
    doc.text('Vendas por Produto', 14, finalY);
    finalY += 10;
    
    const salesTableData = detailedSalesReport.salesByProduct.slice(0, 20).map(s => [
      s.productName,
      s.sku,
      s.totalQuantity.toString(),
      `R$ ${s.totalRevenue.toFixed(2)}`,
      s.saleCount.toString()
    ]);
    
    autoTable(doc, {
      head: [['Produto', 'SKU', 'Quantidade', 'Receita', 'Vendas']],
      body: salesTableData,
      startY: finalY,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [34, 197, 94] }
    });
  };

  const exportToPDF = (date: string): void => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Relatório de Estoque', 14, 20);
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    const stockTableEndY = addPDFStockTable(doc);
    const salesSummaryEndY = addPDFSalesSummary(doc, stockTableEndY);
    addPDFDetailedSales(doc, salesSummaryEndY);
    
    doc.save(`relatorio-${date}.pdf`);
  };

  // SOL-001: Exportação em múltiplos formatos (CSV, PDF, Excel) - apenas para ADMIN
  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    
    switch (exportFormat) {
      case 'CSV':
        exportToCSV(date);
        break;
      case 'JSON':
        exportToJSON(date);
        break;
      case 'EXCEL':
        exportToExcel(date);
        break;
      case 'PDF':
        exportToPDF(date);
        break;
    }
  };

  const lowStockProducts = settings.minStockAlert ? stockReport.filter(p => p.belowMin) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Relatórios e Análises</h2>
          <p className="text-sm text-zinc-700 mt-1">
            Relatórios de estoque, movimentações e análises financeiras
            {isAdmin && ' - SOL-001: Exportação em múltiplos formatos | SOL-002: Relatórios detalhados de vendas'}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'CSV' | 'JSON' | 'PDF' | 'EXCEL')}
            className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
          >
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
            {isAdmin && <option value="EXCEL">Excel</option>}
            {isAdmin && <option value="PDF">PDF</option>}
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Exportar Relatório
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-zinc-700">Carregando relatórios...</div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-700">Total de Produtos</p>
              <p className="text-3xl font-semibold text-zinc-900">{stockReport.length}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-700">Produtos em Alerta</p>
              <p className="text-3xl font-semibold text-red-600">{lowStockProducts.length}</p>
            </div>
            {salesReport && (
              <>
                <div className="bg-white border rounded-xl p-4">
                  <p className="text-sm text-zinc-700">Total de Vendas</p>
                  <p className="text-3xl font-semibold text-zinc-900">
                    R$ {salesReport.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <p className="text-sm text-zinc-700">Itens Vendidos</p>
                  <p className="text-3xl font-semibold text-zinc-900">{salesReport.totalItems}</p>
                </div>
              </>
            )}
          </div>

          {/* SOL-002: Relatórios detalhados de vendas - apenas para ADMIN */}
          {isAdmin && detailedSalesReport && (
            <div className="space-y-4">
                
                {/* Top Produtos */}
                <div className="bg-white border rounded-lg p-4 mb-4">
                  <h4 className="text-md font-semibold text-zinc-900 mb-3">Top 10 Produtos Mais Vendidos</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-zinc-600">
                          <th className="text-left py-2 text-zinc-900">Produto</th>
                          <th className="text-left py-2 text-zinc-900">SKU</th>
                          <th className="text-right py-2 text-zinc-900">Quantidade</th>
                          <th className="text-right py-2 text-zinc-900">Receita Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSalesReport.topProducts.map((product) => (
                          <tr key={product.sku} className="border-b last:border-0 text-zinc-900">
                            <td className="py-2 text-zinc-900">{product.productName}</td>
                            <td className="py-2 text-zinc-900">{product.sku}</td>
                            <td className="py-2 text-right text-zinc-900">{product.totalQuantity}</td>
                            <td className="py-2 text-right text-zinc-900">R$ {product.totalRevenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Vendas por Produto */}
                <div className="bg-white border rounded-lg p-4 mb-4">
                  <h4 className="text-md font-semibold text-zinc-900 mb-3">Vendas por Produto</h4>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-zinc-600 sticky top-0 bg-white">
                          <th className="text-left py-2 text-zinc-900">Produto</th>
                          <th className="text-left py-2 text-zinc-900">SKU</th>
                          <th className="text-right py-2 text-zinc-900">Quantidade</th>
                          <th className="text-right py-2 text-zinc-900">Receita Total</th>
                          <th className="text-right py-2 text-zinc-900">Nº de Vendas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSalesReport.salesByProduct.map((sale) => (
                          <tr key={sale.productId} className="border-b last:border-0 text-zinc-900">
                            <td className="py-2 text-zinc-900">{sale.productName}</td>
                            <td className="py-2 text-zinc-900">{sale.sku}</td>
                            <td className="py-2 text-right text-zinc-900">{sale.totalQuantity}</td>
                            <td className="py-2 text-right text-zinc-900">R$ {sale.totalRevenue.toFixed(2)}</td>
                            <td className="py-2 text-right text-zinc-900">{sale.saleCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Vendas por Período */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-md font-semibold text-zinc-900 mb-3">Vendas por Período (Últimos 30 dias)</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-zinc-600">
                          <th className="text-left py-2 text-zinc-900">Data</th>
                          <th className="text-right py-2 text-zinc-900">Nº de Vendas</th>
                          <th className="text-right py-2 text-zinc-900">Quantidade</th>
                          <th className="text-right py-2 text-zinc-900">Receita Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSalesReport.salesByPeriod.map((period) => (
                          <tr key={period.date} className="border-b last:border-0 text-zinc-900">
                            <td className="py-2 text-zinc-900">
                              {new Date(period.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-2 text-right text-zinc-900">{period.saleCount}</td>
                            <td className="py-2 text-right text-zinc-900">{period.totalQuantity}</td>
                            <td className="py-2 text-right text-zinc-900">R$ {period.totalRevenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
          )}

          {/* Relatório de Estoque */}
          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Relatório de Estoque Atual (RF13)</h3>
            </div>
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
                  {stockReport.map((p) => (
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

          {/* Produtos em Alerta */}
          {lowStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-3">⚠️ Produtos com Estoque Baixo (RF23, RF29)</h3>
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <p className="font-medium text-zinc-900">{p.name}</p>
                      <p className="text-xs text-zinc-700">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600 font-medium">
                        {p.stockQuantity} / {p.minStock}
                      </p>
                      <p className="text-xs text-zinc-700">Faltam {p.minStock - p.stockQuantity} unidades</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Sobre os Relatórios</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Relatórios de estoque atual mostram situação completa do inventário (RF13)</li>
          <li>Relatórios de movimentações por período permitem análise temporal (RF14)</li>
          <li>Exportação em CSV e JSON disponível para todos (RF15)</li>
          {isAdmin && <li>Exportação em Excel e PDF disponível apenas para Administradores (SOL-001)</li>}
          {isAdmin && <li>Relatórios detalhados de vendas com análises avançadas disponíveis apenas para Administradores (SOL-002)</li>}
          <li>Alertas automáticos quando estoque abaixo do mínimo (RF23, RF29)</li>
        </ul>
      </div>
    </div>
  );
}
