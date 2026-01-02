import { useState, useEffect } from 'react';
import { apiFetch } from './api';

type SystemSettings = {
  systemName: string;
  minStockAlert: boolean;
  autoCalculateCost: boolean;
  retentionPeriod: number;
  maxProducts: number;
  enableBarcodeScan: boolean;
  enableExpiryAlerts: boolean;
  defaultCurrency: string;
};

const defaultSettings: SystemSettings = {
  systemName: 'Stock Manager',
  minStockAlert: true,
  autoCalculateCost: true,
  retentionPeriod: 24,
  maxProducts: 10000,
  enableBarcodeScan: true,
  enableExpiryAlerts: true,
  defaultCurrency: 'BRL',
};

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiFetch<SystemSettings>('/api/settings');
        setSettings(data);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // Manter valores padrão em caso de erro
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading };
}

