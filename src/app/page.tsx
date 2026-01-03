'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Shield, Zap, Database, Server, CheckCircle2, ArrowRight, Mail, Globe, ExternalLink, Heart, X } from "lucide-react";

export default function Home() {
  const [showDonation, setShowDonation] = useState(false);

  return (
    <>
      {/* Conteúdo */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-zinc-50 relative overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-zinc-200 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-zinc-900">Stock Manager</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDonation(true)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-red-500" />
                Apoie o Projeto
              </button>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Acessar Versão de Teste
              </Link>
              <Link
                href="#contato"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Entrar em Contato
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de Doação */}
      {showDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm border-0 cursor-default"
            onClick={() => setShowDonation(false)}
            aria-label="Fechar modal"
          />
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10" 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-title"
            tabIndex={0}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <h3 id="donation-title" className="text-2xl font-bold text-zinc-900">Apoie o Projeto</h3>
              </div>
              <button
                onClick={() => setShowDonation(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-zinc-700 mb-6">
              Este sistema é gratuito e de código aberto. Se você gostou e quer apoiar o desenvolvimento, 
              considere fazer uma doação via PIX.
            </p>
            <div className="bg-green-50 rounded-xl p-5 border border-green-200 mb-6">
            
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-lg font-mono text-zinc-900 break-all select-all">
                  antoniol.carvalho49@gmail.com
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('antoniol.carvalho49@gmail.com');
                  alert('Chave PIX copiada!');
                }}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Copiar Chave PIX
              </button>
            </div>
            <p className="text-sm text-zinc-600 text-center">
              Sua contribuição ajuda a manter e melhorar o sistema. Muito obrigado! 🙏
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Gratuito</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-zinc-900 mb-6">
            Sistema de Gestão de{' '}
            <span className="text-blue-600">Estoque</span>
            <br />
            para sua Empresa
          </h1>
          <p className="text-xl text-zinc-600 mb-8 max-w-3xl mx-auto">
            Solução completa e gratuita para gerenciar seu inventário. 
            O banco de dados roda em servidor local, garantindo que seus dados sigilosos permaneçam sob seu controle total.
          </p>
          <div className=" rounded-xl p-4 max-w-2xl mx-auto mb-8">
            <p className="text-sm text-blue-900">
              <strong className="font-semibold"></strong> Não temos interesse em acessar ou armazenar dados sigilosos dos nossos clientes. 
              O banco de dados fica em seu servidor local, e nós respeitamos sua privacidade.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#caracteristicas"
              className="px-8 py-4 bg-white text-zinc-900 border-2 border-zinc-200 rounded-lg text-lg font-semibold hover:border-zinc-300 transition-all flex items-center justify-center gap-2"
            >
              Saiba Mais
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-zinc-900 mb-4">
            Por que escolher o Stock Manager?
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Uma solução completa, gratuita e focada em empresas que valorizam privacidade e controle total
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-zinc-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Banco de Dados Local
            </h3>
            <p className="text-zinc-600">
              O banco de dados roda em seu servidor local. Seus dados sigilosos nunca saem da sua infraestrutura, garantindo privacidade e controle total.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-zinc-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              100% Gratuito
            </h3>
            <p className="text-zinc-600">
              Sem custos de licença, sem mensalidades, sem limitações. Use todas as funcionalidades sem pagar nada.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-zinc-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Segurança e Privacidade
            </h3>
            <p className="text-zinc-600">
              Respeitamos sua privacidade. Não temos acesso aos seus dados sigilosos - o banco fica em seu servidor local, e nós mantemos nossa integridade.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-zinc-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Fácil de Usar
            </h3>
            <p className="text-zinc-600">
              Interface intuitiva e moderna. Seus funcionários aprendem rapidamente, sem necessidade de treinamento extensivo.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-zinc-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Funcionalidades Completas
            </h3>
            <p className="text-zinc-600">
              Gestão de produtos, categorias, fornecedores, movimentações, relatórios e muito mais. Tudo que você precisa.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-zinc-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              Focado em Empresas
            </h3>
            <p className="text-zinc-600">
              Desenvolvido pensando nas necessidades reais de empresas. Suporte a múltiplos usuários, permissões e auditoria completa.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-4">
            Oferecemos hospedagem do front e back-end, enquanto o banco de dados fica na sua loja. 
            Valor totalmente acessível e seus dados sigilosos permanecem sob seu controle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
              Acessar Versão de Teste
              <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
              href="#contato"
              className="px-8 py-4 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-400 transition-all border-2 border-blue-400 flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Falar com Provedor
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-zinc-900 mb-4">
            Entre em Contato
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Precisa de ajuda com a instalação ou hospedagem? Entre em contato conosco!
          </p>
        </div>

        {/* Serviço de Hospedagem */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Server className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-zinc-900 mb-3 text-xl">Serviço de Hospedagem Disponível</h3>
              <p className="text-zinc-700 mb-4 text-lg">
                <strong>Oferecemos hospedagem completa do front-end e back-end!</strong>
              </p>
              <ul className="space-y-3 text-zinc-700 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Front-end e Back-end hospedados por nós</strong> - Você não precisa se preocupar com servidores web</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Banco de dados fica na sua loja</strong> - Seus dados sigilosos permanecem sob seu controle total</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 shrink-0" />
                  <span><strong>Valor totalmente acessível</strong> - Preço justo e transparente, sem surpresas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integridade */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 mb-3 text-xl">Nossa Integridade e Compromisso</h3>
              <p className="text-zinc-700">
                O banco de dados roda em seu servidor local (na sua loja). Não temos acesso aos seus dados sigilosos 
                e não temos interesse em armazená-los. Respeitamos sua privacidade e mantemos nossa integridade. 
                Você tem controle total sobre suas informações.
              </p>
            </div>
          </div>
        </div>

        {/* Contato - Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <a
            href="mailto:alemsys.digital@gmail.com"
            className="group bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl">Email</h4>
                <p className="text-blue-100">Envie-nos uma mensagem</p>
              </div>
            </div>
            <p className="text-white font-medium text-lg break-all">alemsys.digital@gmail.com</p>
          </a>

          <a
            href="https://alemsys.digital/pt"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl">Website</h4>
                <p className="text-blue-100">Conheça nossos serviços</p>
              </div>
            </div>
            <p className="text-white font-medium text-lg flex items-center gap-2">
              alemsys.digital/pt
              <ExternalLink className="w-5 h-5" />
            </p>
          </a>
        </div>


      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Package className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-semibold text-white">Stock Manager</span>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-sm text-zinc-400">
                Sistema gratuito de gestão de estoque para servidores locais
              </p>
              <a
                href="https://alemsys.digital/pt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Globe className="w-4 h-4" />
                alemsys.digital/pt
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
            <p>© {new Date().getFullYear()} Stock Manager. Desenvolvido por <a href="https://alemsys.digital/pt" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Alemsys Digital</a>. Todos os direitos reservados.</p>
          </div>
      </div>
      </footer>
      </div>
      
      {/* Empilhadeira Animada - No topo do documento, não rola com a página */}
      <div 
        className="animate-slide-horizontal"
        style={{ 
          position: 'absolute',
          top: 'calc(92%)',
          width: '120px',
          height: '120px',
          pointerEvents: 'none',
          zIndex: 50,
          willChange: 'left, transform'
        }}
      >
        <img
          src="/empilhadeira.webp"
          alt="Empilhadeira"
          style={{ 
            width: '120px', 
            height: '120px', 
            objectFit: 'contain',
            display: 'block',
            opacity: 0.6,
            transform: 'none',
            flexShrink: 0
          }}
        />
      </div>
    </>
  );
}
