'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import OrderDrawer from './OrderDrawer';
import CustomerBadge from './CustomerBadge';
import { formatPrice } from '@/lib/site-config';
import type { OrderResponse } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  'en-attente': 'En attente',
  'on-hold': 'En attente',
  processing: 'En traitement',
  confirme: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
  annule: 'Annulée',
  refunded: 'Remboursée',
  failed: 'Échouée',
  tentative: 'Tentative',
  'auto-draft': 'Brouillon',
  'checkout-draft': 'Brouillon checkout',
};

type Props = {
  initialOrders: OrderResponse[];
  total: number;
  repeatCounts?: Record<string, number>;
};

export default function CommandesView({ initialOrders, total, repeatCounts = {} }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function openCreate() { setEditingId(null); setDrawerOpen(true); }
  function openEdit(id: string) { setEditingId(id); setDrawerOpen(true); }

  async function remove(id: string) {
    if (!confirm(`Supprimer la commande #${id} ? Elle sera mise à la corbeille.`)) return;
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Erreur de suppression'); return; }
    startTransition(() => router.refresh());
  }

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Commandes</h1>
          <p className="text-ink-700">{total} commande{total > 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
          <Plus size={16} /> Ajouter une commande
        </button>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-xs uppercase text-ink-700">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Ville</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialOrders.map((o) => {
              const phoneKey = (o.customer.phone || '').replace(/\s/g, '');
              const repeats = phoneKey ? (repeatCounts[phoneKey] ?? 0) : 0;
              const isRegular = repeats > 1;
              return (
              <tr key={o.id} className={`border-t border-ink-200 hover:bg-ink-100 ${pending ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3 font-bold">#{o.number}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{o.customer.firstName} {o.customer.lastName ?? ''}</span>
                    {isRegular && <CustomerBadge phone={o.customer.phone} />}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-700">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">{o.customer.phone}</td>
                <td className="px-4 py-3">{o.customer.city}</td>
                <td className="px-4 py-3"><span className="chip">{STATUS_LABEL[o.status] ?? o.status}</span></td>
                <td className="px-4 py-3 text-right font-bold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(o.id)} className="rounded-lg p-2 text-ink-700 hover:bg-ink-100" title="Voir"><Eye size={16} /></button>
                    <button onClick={() => openEdit(o.id)} className="rounded-lg p-2 text-ink-700 hover:bg-ink-100" title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => remove(o.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
              );
            })}
            {!initialOrders.length && (
              <tr><td colSpan={8} className="p-8 text-center text-ink-700">Aucune commande pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <OrderDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        orderId={editingId}
        onSaved={() => startTransition(() => router.refresh())}
      />
    </div>
  );
}
