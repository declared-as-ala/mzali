'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, Edit, Trash2, Package, AlertTriangle, Plus } from 'lucide-react';
import ProductDrawer from './ProductDrawer';
import { formatPrice } from '@/lib/site-config';
import type { Product } from '@/types';

type Props = {
  initialProducts: Product[];
  totals: { stock: number; outOfStock: number; revenuePotential: number };
};

export default function ProduitsView({ initialProducts, totals }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function openCreate() { setEditingId(null); setDrawerOpen(true); }
  function openEdit(id: string) { setEditingId(id); setDrawerOpen(true); }

  async function remove(id: string, name: string) {
    if (!confirm(`Supprimer « ${name} » ? Le produit sera mis à la corbeille.`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Erreur de suppression'); return; }
    startTransition(() => router.refresh());
  }

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">Produits</h1>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
          <Plus size={16} /> Ajouter un produit
        </button>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-500"><Package /></div>
          <div><p className="text-3xl font-black">{totals.stock}</p><p className="text-sm text-ink-700">Stock total</p></div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-100 text-red-600"><AlertTriangle /></div>
          <div><p className="text-3xl font-black">{totals.outOfStock}</p><p className="text-sm text-ink-700">Ruptures</p></div>
        </div>
        <div className="card flex items-center justify-end gap-4 bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white">
          <div className="text-right">
            <p className="text-sm opacity-90">Revenu estimé</p>
            <p className="text-2xl font-black">{formatPrice(totals.revenuePotential)}</p>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-xs uppercase text-ink-700">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Prix</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.map((p) => (
              <tr key={p.id} className={`border-t border-ink-200 hover:bg-ink-100 ${pending ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3 font-bold">{p.id}</td>
                <td className="px-4 py-3">
                  {p.images[0]?.url ? (
                    <Image src={p.images[0].url} alt={p.name} width={40} height={50} className="rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-10 rounded-lg bg-ink-200" />
                  )}
                </td>
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stockQuantity ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`chip ${p.status === 'published' ? '' : 'bg-amber-50 text-amber-700'}`}>
                    {p.status === 'published' ? 'Affiché' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(p.id)} className="rounded-lg p-2 text-ink-700 hover:bg-ink-100" title="Voir"><Eye size={16} /></button>
                    <button onClick={() => openEdit(p.id)} className="rounded-lg p-2 text-ink-700 hover:bg-ink-100" title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => remove(p.id, p.name)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!initialProducts.length && (
              <tr><td colSpan={7} className="p-8 text-center text-ink-700">Aucun produit.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        productId={editingId}
        onSaved={() => startTransition(() => router.refresh())}
      />
    </div>
  );
}
