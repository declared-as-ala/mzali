'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { useCart } from '@/lib/cart';
import { SITE, formatPrice } from '@/lib/site-config';
import type { CheckoutPayload } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const total = useMemo(() => items.reduce((s, x) => s + x.price * x.qty, 0), [items]);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    firstName: string;
    phone: string;
    phone2: string;
    email: string;
    city: string;
    address: string;
    note: string;
  }>({
    firstName: '',
    phone: '',
    phone2: '',
    email: '',
    city: SITE.cities[0],
    address: '',
    note: '',
  });

  const shipping = 8;
  const grand = total + shipping;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    try {
      const payload: CheckoutPayload = {
        customer: { ...form, lastName: '' },
        items,
        shipping,
        paymentMethod: 'cod',
        source: 'storefront-next',
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Échec de la commande');
      clear();
      router.push(`/merci?id=${data.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert(`Erreur lors de la commande : ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header categories={[]} />
      <main className="container-shop py-10">
        <h1 className="mb-6 text-3xl font-black text-ink-900">Finaliser la commande</h1>
        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
          <div className="card space-y-4 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold">Coordonnées</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-bold text-ink-700">
                Nom complet *
                <input
                  className="input mt-1 font-normal"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </label>
              <label className="block text-sm font-bold text-ink-700">
                Téléphone *
                <input
                  className="input mt-1 font-normal"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label className="block text-sm font-bold text-ink-700">
                Téléphone 2
                <input
                  className="input mt-1 font-normal"
                  value={form.phone2}
                  onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                />
              </label>
              <label className="block text-sm font-bold text-ink-700">
                Email
                <input
                  type="email"
                  className="input mt-1 font-normal"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label className="block text-sm font-bold text-ink-700">
                Ville *
                <select
                  className="input mt-1 font-normal"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  {SITE.cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold text-ink-700 md:col-span-2">
                Adresse *
                <input
                  className="input mt-1 font-normal"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </label>
              <label className="block text-sm font-bold text-ink-700 md:col-span-2">
                Note (optionnel)
                <textarea
                  className="input mt-1 font-normal"
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </label>
            </div>
          </div>

          <aside className="card h-fit p-6">
            <h2 className="mb-4 text-lg font-bold">Votre commande</h2>
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.productId + (i.bundleId ?? '')} className="flex items-center gap-3 border-b border-ink-200 pb-3 last:border-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-bold">{i.name}</p>
                    <p className="text-ink-700">×{i.qty}</p>
                  </div>
                  <span className="font-bold">{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-ink-200 pt-4 text-sm">
              <div className="flex justify-between"><span>Sous-total</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span>Livraison</span><span>{formatPrice(shipping)}</span></div>
              <div className="mt-2 flex justify-between border-t border-ink-200 pt-2 text-lg font-black">
                <span>Total</span>
                <span className="text-brand-500">{formatPrice(grand)}</span>
              </div>
            </div>
            <button
              disabled={submitting || !items.length}
              className="btn-cta mt-6 w-full disabled:opacity-50"
            >
              {submitting ? 'Envoi…' : 'Confirmer la commande'}
            </button>
            <p className="mt-3 text-center text-xs text-ink-700">Paiement à la livraison · Sans engagement</p>
          </aside>
        </form>
      </main>
      <Footer />
    </>
  );
}
