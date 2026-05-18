'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Lock, RotateCcw, ShieldCheck, Eye, EyeOff, Check, AlertCircle, KeyRound } from 'lucide-react';

type Props = {
  hasCustomPassword: boolean;
  passwordUpdatedAt: string | null;
  envFallbackEnabled: boolean;
};

export default function ProfileView({ hasCustomPassword, passwordUpdatedAt, envFallbackEnabled }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!next || next !== confirm) { setStatus({ kind: 'err', msg: 'Les mots de passe ne correspondent pas.' }); return; }
    if (next.length < 6) { setStatus({ kind: 'err', msg: 'Au moins 6 caractères.' }); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erreur');
      setStatus({ kind: 'ok', msg: 'Mot de passe mis à jour.' });
      setCurrent(''); setNext(''); setConfirm('');
      startTransition(() => router.refresh());
    } catch (e) {
      setStatus({ kind: 'err', msg: e instanceof Error ? e.message : 'Erreur' });
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!confirm.length && !window.confirm('Réinitialiser le mot de passe ? Le mot de passe par défaut (.env ADMIN_PASSWORD) sera de nouveau actif.')) return;
    if (confirm.length && !window.confirm('Réinitialiser le mot de passe ? Le mot de passe par défaut (.env ADMIN_PASSWORD) sera de nouveau actif.')) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur');
      setStatus({ kind: 'ok', msg: 'Mot de passe réinitialisé. Le mot de passe par défaut est de nouveau actif.' });
      startTransition(() => router.refresh());
    } catch (e) {
      setStatus({ kind: 'err', msg: e instanceof Error ? e.message : 'Erreur' });
    } finally {
      setBusy(false);
    }
  }

  async function logoutAll() {
    if (!window.confirm('Se déconnecter ?')) return;
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin-login');
  }

  return (
    <div className={`p-8 ${pending ? 'opacity-70' : ''}`}>
      <header className="mb-6 flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
          <UserCircle size={36} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Profil</h1>
          <p className="text-ink-700">Gérez votre compte administrateur</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account info */}
        <section className="card p-6 lg:col-span-1">
          <h2 className="mb-4 text-lg font-black">Compte</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-700">Utilisateur</dt>
              <dd className="mt-0.5 font-black">admin</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-700">Mot de passe</dt>
              <dd className="mt-0.5">
                {hasCustomPassword ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    <Check size={12} /> Personnalisé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                    <AlertCircle size={12} /> Par défaut (.env)
                  </span>
                )}
              </dd>
            </div>
            {passwordUpdatedAt && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-700">Dernière mise à jour</dt>
                <dd className="mt-0.5 text-ink-900">{new Date(passwordUpdatedAt).toLocaleString('fr-FR')}</dd>
              </div>
            )}
            {envFallbackEnabled && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
                <p className="flex items-start gap-1.5 font-bold">
                  <ShieldCheck size={14} className="mt-0.5 flex-none" />
                  Récupération activée
                </p>
                <p className="mt-1 leading-relaxed">
                  Le mot de passe défini dans <code className="rounded bg-blue-100 px-1">.env.local</code> reste utilisable comme mot de passe de secours.
                </p>
              </div>
            )}
          </dl>

          <button
            onClick={logoutAll}
            className="mt-5 w-full rounded-xl border border-ink-200 bg-white py-2 text-sm font-bold text-ink-900 hover:bg-ink-100"
          >
            Se déconnecter
          </button>
        </section>

        {/* Change password */}
        <section className="card p-6 lg:col-span-2">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-black">
            <Lock size={18} className="text-brand-500" /> Changer le mot de passe
          </h2>
          <p className="mb-5 text-sm text-ink-700">Minimum 6 caractères. Utilisez quelque chose d&apos;unique.</p>

          <form onSubmit={changePassword} className="space-y-4">
            <PasswordField
              label="Mot de passe actuel"
              value={current}
              onChange={setCurrent}
              show={showCurrent}
              onToggleShow={() => setShowCurrent(!showCurrent)}
              autoComplete="current-password"
            />
            <PasswordField
              label="Nouveau mot de passe"
              value={next}
              onChange={setNext}
              show={showNext}
              onToggleShow={() => setShowNext(!showNext)}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirmer le nouveau mot de passe"
              value={confirm}
              onChange={setConfirm}
              show={showNext}
              onToggleShow={() => setShowNext(!showNext)}
              autoComplete="new-password"
            />

            {status && (
              <p className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${status.kind === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {status.kind === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />}
                {status.msg}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
                <KeyRound size={16} />
                {busy ? 'Mise à jour…' : 'Mettre à jour'}
              </button>
              {hasCustomPassword && (
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Réinitialiser au mot de passe par défaut
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, onToggleShow, autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-700">{label}</span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="input pr-12"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-700 hover:bg-ink-100"
          aria-label={show ? 'Masquer' : 'Afficher'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
