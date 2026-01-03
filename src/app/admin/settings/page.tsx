'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { apiFetch } from '@/lib/api';

type SystemSettings = {
  systemName: string;
  minStockAlert: boolean;
  autoCalculateCost: boolean;
  retentionPeriod: number; // meses
  maxProducts: number;
  enableBarcodeScan: boolean;
  enableExpiryAlerts: boolean;
  defaultCurrency: string;
};

export default function SettingsPage() {
  const { userRole } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: 'Stock Manager',
    minStockAlert: true,
    autoCalculateCost: true,
    retentionPeriod: 24,
    maxProducts: 10000,
    enableBarcodeScan: true,
    enableExpiryAlerts: true,
    defaultCurrency: 'BRL',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Apenas Admin pode configurar sistema (RF34)
  if (userRole !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Acesso Negado</h2>
          <p className="text-red-700">
            Você não tem permissão para acessar esta página. Apenas Administradores podem configurar o sistema (RF34).
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<SystemSettings>('/api/settings');
      setSettings(data);
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
      setError(err.message || 'Erro ao carregar configurações');
      // Manter valores padrão em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      setError(err.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Configurações do Sistema</h2>
        <p className="text-sm text-zinc-700 mt-1">
          Configure parâmetros globais do sistema (RF34)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Configurações salvas com sucesso!
        </div>
      )}

      {loading ? (
        <div className="bg-white border rounded-xl p-6 text-center text-zinc-700">
          Carregando configurações...
        </div>
      ) : (
      <div className="bg-white border rounded-xl p-6 space-y-6">
        <section>
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Configurações Gerais</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="setting-system-name" className="block text-sm font-medium text-zinc-700 mb-1">
                Nome do Sistema
                <input
                  id="setting-system-name"
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                />
              </label>
            </div>
            <div>
              <label htmlFor="setting-currency" className="block text-sm font-medium text-zinc-700 mb-1">
                Moeda Padrão
                <select
                  id="setting-currency"
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                >
                  <option value="BRL">BRL (Real Brasileiro)</option>
                  <option value="USD">USD (Dólar Americano)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="border-t pt-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Configurações de Estoque</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="setting-min-stock-alert" className="flex-1 cursor-pointer">
                <div className="block text-sm font-medium text-zinc-700 mb-1">
                  Alertas de Estoque Mínimo
                </div>
                <p className="text-xs text-zinc-700">
                  Notificar quando estoque estiver abaixo do mínimo (RF23, RF29)
                </p>
                <div className="relative inline-flex items-center mt-2">
                  <input
                    id="setting-min-stock-alert"
                    type="checkbox"
                    checked={settings.minStockAlert}
                    onChange={(e) => setSettings({ ...settings, minStockAlert: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="setting-auto-calculate" className="flex-1 cursor-pointer">
                <div className="block text-sm font-medium text-zinc-700 mb-1">
                  Cálculo Automático de Custo Médio
                </div>
                <p className="text-xs text-zinc-700">
                  Calcular custo médio automaticamente nas entradas (RF22)
                </p>
                <div className="relative inline-flex items-center mt-2">
                  <input
                    id="setting-auto-calculate"
                    type="checkbox"
                    checked={settings.autoCalculateCost}
                    onChange={(e) => setSettings({ ...settings, autoCalculateCost: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="setting-expiry-alerts" className="flex-1 cursor-pointer">
                <div className="block text-sm font-medium text-zinc-700 mb-1">
                  Alertas de Validade
                </div>
                <p className="text-xs text-zinc-700">
                  Notificar sobre produtos próximos da validade (RF27)
                </p>
                <div className="relative inline-flex items-center mt-2">
                  <input
                    id="setting-expiry-alerts"
                    type="checkbox"
                    checked={settings.enableExpiryAlerts}
                    onChange={(e) => setSettings({ ...settings, enableExpiryAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>
          </div>
        </section>

        <section className="border-t pt-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Configurações de Desempenho</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="setting-retention" className="block text-sm font-medium text-zinc-700 mb-1">
                Período de Retenção de Histórico (meses)
                <input
                  id="setting-retention"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.retentionPeriod}
                  onChange={(e) => setSettings({ ...settings, retentionPeriod: Number.parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                />
                <p className="text-xs text-zinc-700 mt-1">
                  Histórico de movimentações será mantido por {settings.retentionPeriod} meses
                </p>
              </label>
            </div>
            <div>
              <label htmlFor="setting-max-products" className="block text-sm font-medium text-zinc-700 mb-1">
                Limite Máximo de Produtos
                <input
                  id="setting-max-products"
                  type="number"
                  min="100"
                  max="100000"
                  step="100"
                  value={settings.maxProducts}
                  onChange={(e) => setSettings({ ...settings, maxProducts: Number.parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900"
                />
                <p className="text-xs text-zinc-700 mt-1">
                  Sistema suporta até {settings.maxProducts.toLocaleString('pt-BR')} produtos (RNF08)
                </p>
              </label>
            </div>
          </div>
        </section>

        <section className="border-t pt-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Funcionalidades</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="setting-barcode-scan" className="flex-1 cursor-pointer">
                <div className="block text-sm font-medium text-zinc-700 mb-1">
                  Leitura de Código de Barras
                </div>
                <p className="text-xs text-zinc-700">
                  Habilitar suporte a leitura de código de barras (RNF21)
                </p>
                <div className="relative inline-flex items-center mt-2">
                  <input
                    id="setting-barcode-scan"
                    type="checkbox"
                    checked={settings.enableBarcodeScan}
                    onChange={(e) => setSettings({ ...settings, enableBarcodeScan: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Sobre as Configurações</h4>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Apenas Administradores podem alterar configurações globais (RF34)</li>
          <li>Alterações nas configurações afetam todo o sistema</li>
          <li>Configurações são salvas permanentemente no banco de dados</li>
          <li>Algumas configurações podem requerer reinicialização do sistema</li>
        </ul>
      </div>
    </div>
  );
}

