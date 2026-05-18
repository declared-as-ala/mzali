'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Zap } from 'lucide-react';
import { useCart } from '@/lib/cart';
import type { Product } from '@/types';
import { SITE } from '@/lib/site-config';

export default function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [bundleId, setBundleId] = useState<string | undefined>(
    product.bundles.find((b) => b.isDefault)?.id ?? product.bundles[0]?.id,
  );

  const variantAttrs = product.attributes.filter((a) => a.options.length);
  const selectedBundle = product.bundles.find((b) => b.id === bundleId);
  const effectivePrice = selectedBundle ? selectedBundle.price : product.price;
  const effectiveQty = selectedBundle ? selectedBundle.quantity * qty : qty;

  const doAdd = (buyNow = false) => {
    add({
      productId: product.id,
      name: product.name,
      price: effectivePrice / Math.max(1, selectedBundle?.quantity ?? 1),
      qty: effectiveQty,
      image: product.images[0]?.url ?? '',
      variation: variantAttrs.length ? picked : undefined,
      bundleId,
    });
    if (buyNow) router.push('/commande');
  };

  return (
    <div className="mt-6 space-y-4">
      {product.bundles.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-ink-700">Offres</p>
          <div className="grid gap-2">
            {product.bundles.map((b) => {
              const active = b.id === bundleId;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBundleId(b.id)}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition ${active ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-brand-200'}`}
                >
                  <div>
                    <p className="font-black text-ink-900">{b.name}</p>
                    {b.label && <p className="text-xs text-ink-700">{b.label}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-brand-500">{b.price} {SITE.currency.symbol}</p>
                    {b.regularPrice > b.price && (
                      <p className="text-xs text-ink-300 line-through">{b.regularPrice} {SITE.currency.symbol}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {variantAttrs.map((a) => (
        <div key={a.name}>
          <p className="mb-2 text-sm font-bold text-ink-700">{a.name}</p>
          <div className="flex flex-wrap gap-2">
            {a.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setPicked({ ...picked, [a.name]: opt })}
                className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${picked[a.name] === opt ? 'border-brand-500 bg-brand-50 text-brand-500' : 'border-ink-200 hover:border-brand-300'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-ink-200">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-12 w-12 place-items-center text-ink-700 hover:bg-ink-100"><Minus size={16} /></button>
          <span className="w-12 text-center font-bold">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="grid h-12 w-12 place-items-center text-ink-700 hover:bg-ink-100"><Plus size={16} /></button>
        </div>
        <button onClick={() => doAdd(false)} className="btn-ghost flex-1"><ShoppingBag size={18} /> Ajouter au panier</button>
      </div>
      <button onClick={() => doAdd(true)} className="btn-cta w-full shake-cta">
        <Zap size={18} /> {SITE.cta.text}
      </button>
    </div>
  );
}
