'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/site-config';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function PanierPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = useMemo(() => items.reduce((s, x) => s + x.price * x.qty, 0), [items]);

  return (
    <>
      <Header categories={[]} />
      <main className="container-shop py-10">
        <h1 className="mb-6 text-3xl font-black text-ink-900">Mon panier</h1>
        {!items.length ? (
          <div className="card grid place-items-center p-20 text-center">
            <ShoppingBag size={48} className="mb-4 text-ink-300" />
            <p className="text-lg font-bold">Votre panier est vide.</p>
            <Link href="/" className="btn-primary mt-4">Continuer mes achats</Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card space-y-4 p-6 lg:col-span-2">
              {items.map((i) => (
                <div key={i.productId + (i.bundleId ?? '')} className="flex items-center gap-4 border-b border-ink-200 pb-4 last:border-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-bold">{i.name}</p>
                    <p className="text-sm text-ink-700">{formatPrice(i.price)}</p>
                  </div>
                  <div className="flex items-center rounded-xl border border-ink-200">
                    <button onClick={() => setQty(i.productId, i.qty - 1)} className="grid h-9 w-9 place-items-center hover:bg-ink-100"><Minus size={14} /></button>
                    <span className="w-10 text-center font-bold">{i.qty}</span>
                    <button onClick={() => setQty(i.productId, i.qty + 1)} className="grid h-9 w-9 place-items-center hover:bg-ink-100"><Plus size={14} /></button>
                  </div>
                  <p className="w-24 text-right font-black">{formatPrice(i.price * i.qty)}</p>
                  <button onClick={() => remove(i.productId)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <aside className="card h-fit p-6">
              <h2 className="mb-4 text-lg font-bold">Récapitulatif</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Sous-total</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between"><span>Livraison</span><span className="text-ink-300">calculée à l'étape suivante</span></div>
                <div className="mt-2 flex justify-between border-t border-ink-200 pt-3 text-lg font-black">
                  <span>Total</span>
                  <span className="text-brand-500">{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/commande" className="btn-cta mt-6 w-full">Passer la commande</Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
