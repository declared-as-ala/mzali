'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const sp = useSearchParams();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ password }) });
    if (res.ok) router.push(sp.get('from') ?? '/admin');
    else { setErr('Mot de passe incorrect'); setLoading(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-700 to-slate-900 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white"><Lock /></div>
          <h1 className="text-2xl font-black">Mzali Console</h1>
          <p className="text-sm text-slate-500">Connexion administrateur</p>
        </div>
        <label className="block text-sm font-semibold">Mot de passe
          <input type="password" autoFocus className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        <button disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-50">{loading ? '...' : 'Connexion'}</button>
      </form>
    </div>
  );
}
