'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type LoginResponse = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
};

export default function LoginPage() {
  const [email, setEmail] = useState('admin@stock.local');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      console.error('Erro no login:', err);
      // Tentar extrair mensagem de erro mais específica
      let errorMessage = 'Erro ao fazer login';
      if (err.message) {
        try {
          const errorData = JSON.parse(err.message.split(': ')[1] || '{}');
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f2f7fa' }}>
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Imagem à esquerda */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-full max-w-lg">
            <Image
              src="/stock-image.png"
              alt="Stock Manager - Gestão de Estoque"
              width={600}
              height={600}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Formulário à direita */}
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-zinc-200 mx-auto lg:mx-0">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold mb-2 text-zinc-900">Stock Manager</h1>
              <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Home
            </Link>
          </div>
            <p className="text-sm text-zinc-600 mb-4">
              Sistema de Gestão de Estoque
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-900">
                <strong className="font-semibold">Esta é uma demonstração.</strong>  Navegue pelo sistema e explore as funcionalidades básicas que oferecemos.
              </p>
            </div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Email
            <input
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Senha
            <div className="relative">
              <input
                className="border rounded-lg px-3 py-2 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-60"
            type="submit"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-900 mb-2">Usuários de teste:</p>
          <div className="text-xs text-zinc-700 space-y-1">
            <div className="flex items-center justify-between p-2 bg-zinc-50 rounded">
              <span className="font-medium">Administrador:</span>
              <span className="text-zinc-600">admin@stock.local / admin123</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-50 rounded">
              <span className="font-medium">Gerente:</span>
              <span className="text-zinc-600">gerente@stock.local / gerente123</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-50 rounded">
              <span className="font-medium">Operador:</span>
              <span className="text-zinc-600">operador@stock.local / operador123</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}


