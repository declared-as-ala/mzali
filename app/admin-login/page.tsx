'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-700 to-slate-900 p-4">
      <div className="h-72 w-full max-w-sm animate-pulse rounded-2xl bg-white/10" />
    </div>
  );
}

function LoginForm() {
  const sp = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    const data = await res.json().catch(() => ({} as { role?: 'admin' | 'employee'; redirect?: string }));
    if (!res.ok) {
      setErr('Identifiants incorrects');
      setLoading(false);
      return;
    }

    const role = data.role as 'admin' | 'employee' | undefined;
    const home = role === 'employee' ? '/employee' : '/admin';

    // Honor ?from=... only if it matches the role's allowed area.
    // Otherwise default to the role's home.
    const fromRaw = sp.get('from');
    const fromOk = fromRaw && (
      (role === 'admin' && fromRaw.startsWith('/admin')) ||
      (role === 'employee' && fromRaw.startsWith('/employee'))
    );
    const target = (fromOk && fromRaw) || data.redirect || home;

    // Hard navigation so the browser sends the new auth cookie on the fresh request,
    // and middleware re-evaluates with the new session.
    window.location.assign(target);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-700 to-slate-900 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white"><Lock /></div>
          <h1 className="text-2xl font-black">Mzali Console</h1>
          <p className="text-sm text-slate-500">Connectez-vous à votre compte</p>
        </div>

        <label className="block text-sm font-semibold">
          Email <span className="text-xs font-normal text-slate-500">(ou « admin »)</span>
          <div className="relative mt-1">
            <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              className="input pl-9"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin ou employe@example.com"
              required
            />
          </div>
        </label>

        <label className="mt-4 block text-sm font-semibold">Mot de passe
          <input
            type="password"
            className="input mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        <button disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-50">
          {loading ? '...' : 'Connexion'}
        </button>
      </form>
    </div>
  );
}
