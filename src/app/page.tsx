import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="bg-white border rounded-2xl shadow p-8 max-w-lg w-full">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Stock Manager</h1>
        <p className="text-sm text-zinc-600 mb-6">
          Protótipo com dados mockados para fluxo de login, dashboard, produtos e relatórios.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Ir para Login
          </Link>
          <Link
            href="/dashboard"
            className="border border-zinc-200 px-4 py-2 rounded-lg text-sm font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Ver Dashboard
          </Link>
        </div>
        <p className="text-xs text-zinc-500 mt-4">
          API mock em Express ouvindo em <code>http://localhost:4000</code>. Ajuste <code>MOCK_DATA</code> para alternar.
        </p>
      </div>
    </div>
  );
}
