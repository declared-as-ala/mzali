'use client';
import { useEffect, useMemo, useState } from 'react';
import Drawer from './Drawer';
import { Save, Trash2, Plus } from 'lucide-react';
import { SITE, formatPrice } from '@/lib/site-config';
import type { OrderResponse, OrderStatus } from '@/types';

type ProductPickerItem = { id: string; name: string; price: number; image?: string };
type LineDraft = { productId: string; name: string; image?: string; qty: number; unitPrice: number; attrs?: Record<string, string> };

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  'en-attente': 'En attente',
  processing: 'En traitement',
  confirme: 'Confirmée',
  'on-hold': 'En pause',
  completed: 'Terminée',
  cancelled: 'Annulée',
  annule: 'Annulée',
  refunded: 'Remboursée',
  failed: 'Échouée',
  tentative: 'Tentative',
  'auto-draft': 'Brouillon',
  'checkout-draft': 'Brouillon checkout',
};
function labelFor(slug: string): string {
  return STATUS_LABEL[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const DELIVERY_COMPANIES = ['Navex', 'First Delivery', 'Aramex', 'Rapid Poste', 'Best Delivery', 'Mes Colis', 'Manual'];

type Props = {
  open: boolean;
  onClose: () => void;
  orderId?: string | null;
  onSaved?: (order: OrderResponse) => void;
};

export default function OrderDrawer({ open, onClose, orderId, onSaved }: Props) {
  const isEdit = Boolean(orderId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductPickerItem[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [status, setStatus] = useState<OrderStatus>('');
  const [deliveryCompany, setDeliveryCompany] = useState('');
  const [exchange, setExchange] = useState(false);
  const [privateNote, setPrivateNote] = useState('');
  const [customer, setCustomer] = useState({ firstName: '', phone: '', city: '', address: '', phone2: '', email: '', note: '' });
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');

  const total = useMemo(() => lines.reduce((s, l) => s + l.qty * l.unitPrice, 0), [lines]);

  useEffect(() => {
    if (!open) return;
    // Load products list once
    if (!products.length) {
      fetch('/api/admin/products-picker').then(async (r) => {
        if (r.ok) setProducts(await r.json());
      }).catch(() => {});
    }
    // Load available order-status slugs from the live site
    if (!statusList.length) {
      fetch('/api/admin/order-statuses').then(async (r) => {
        if (r.ok) setStatusList(await r.json());
      }).catch(() => {});
    }
    if (orderId) {
      setLoading(true);
      fetch(`/api/admin/orders/${orderId}`)
        .then((r) => r.json())
        .then((o: OrderResponse) => {
          setStatus(o.status);
          setOriginalStatus(String(o.status));
          setDeliveryCompany(String((o.meta?._mzem_delivery_company as string) ?? ''));
          setExchange(o.meta?._mzem_exchange === 'yes');
          setPrivateNote(String((o.meta?._mzem_private_note as string) ?? ''));
          setCustomer({
            firstName: o.customer.firstName ?? '',
            phone: o.customer.phone ?? '',
            city: o.customer.city ?? '',
            address: o.customer.address ?? '',
            phone2: String((o.meta?._mzem_phone_2 as string) ?? ''),
            email: o.customer.email ?? '',
            note: '',
          });
          setLines(o.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.imageUrl,
            qty: i.quantity,
            unitPrice: i.price,
          })));
        })
        .catch(() => alert('Erreur de chargement de la commande'))
        .finally(() => setLoading(false));
    } else {
      // reset on open-for-create — leave status blank so we DON'T send it,
      // letting WooCommerce apply the site's default (works on custom-status plugins).
      setStatus('');
      setOriginalStatus('');
      setDeliveryCompany('');
      setExchange(false);
      setPrivateNote('');
      setCustomer({ firstName: '', phone: '', city: '', address: '', phone2: '', email: '', note: '' });
      setLines([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  const filteredProducts = useMemo(() => {
    const q = pickerQuery.toLowerCase().trim();
    if (!q) return products.slice(0, 30);
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 30);
  }, [products, pickerQuery]);

  function addProduct(p: ProductPickerItem) {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === p.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { productId: p.id, name: p.name, image: p.image, qty: 1, unitPrice: p.price }];
    });
    setPickerOpen(false);
    setPickerQuery('');
  }
  function setLine(idx: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    if (!customer.firstName || !customer.phone) {
      alert('Nom et téléphone obligatoires.');
      return;
    }
    if (!lines.length) {
      alert('Ajoutez au moins un produit.');
      return;
    }
    setSaving(true);
    try {
      const statusChanged = isEdit && status && status !== originalStatus;
      const payload: Record<string, unknown> = {
        customer,
        items: lines.map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unitPrice: l.unitPrice, price: l.unitPrice, image: l.image ?? '' })),
        shipping: 8,
        deliveryCompany,
        exchange,
        privateNote,
        paymentMethod: 'cod' as const,
      };
      // Only send status on update if it actually changed (avoid 400 on custom-status sites).
      // On create we never send status — WC applies the site's default.
      if (statusChanged) payload.status = status;
      const url = isEdit ? `/api/admin/orders/${orderId}` : '/api/admin/orders';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur');
      const order = await res.json();
      onSaved?.(order);
      onClose();
    } catch (e) {
      alert(`Échec: ${e instanceof Error ? e.message : 'inconnu'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? `Modifier la commande` : 'Créer une commande'}
      actions={
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-soft hover:bg-brand-600 disabled:opacity-50">
          <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      }
    >
      {loading ? (
        <p className="p-10 text-center text-ink-700">Chargement…</p>
      ) : (
        <div className="space-y-5">
          {/* Détails de la commande */}
          <Card title="Détails de la commande" right={
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={exchange} onChange={(e) => setExchange(e.target.checked)} className="h-4 w-4 accent-brand-500" />
              Échange
            </label>
          }>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Statut">
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                  <option value="">— Par défaut —</option>
                  {statusList.map((s) => <option key={s} value={s}>{labelFor(s)}</option>)}
                </select>
              </Field>
              <Field label="Société de livraison">
                <select className="input" value={deliveryCompany} onChange={(e) => setDeliveryCompany(e.target.value)}>
                  <option value="">-</option>
                  {DELIVERY_COMPANIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Ajouter une note privée…" className="mt-4">
              <textarea rows={3} className="input" value={privateNote} onChange={(e) => setPrivateNote(e.target.value)} placeholder="Ajouter une note privée…" />
            </Field>
          </Card>

          {/* Détails du client */}
          <Card title="Détails du client">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nom"><input className="input" value={customer.firstName} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} placeholder="Entrez votre nom" /></Field>
              <Field label="Téléphone"><input className="input" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="Entrez votre numéro de téléphone" /></Field>
              <Field label="Ville">
                <select className="input" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })}>
                  <option value="">Sélectionner Ville</option>
                  {SITE.cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Adresse"><input className="input" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Entrez votre adresse" /></Field>
              <Field label="Téléphone 2"><input className="input" value={customer.phone2} onChange={(e) => setCustomer({ ...customer, phone2: e.target.value })} placeholder="Entrez votre second numéro de téléphone" /></Field>
              <Field label="Email"><input type="email" className="input" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="Entrez votre email" /></Field>
            </div>
            <Field label="Note" className="mt-4">
              <textarea rows={3} className="input" value={customer.note} onChange={(e) => setCustomer({ ...customer, note: e.target.value })} placeholder="Entrez les notes supplémentaires" />
            </Field>
          </Card>

          {/* Sélectionner un produit */}
          <Card title="Sélectionner un produit">
            <div className="relative">
              <input
                className="input"
                placeholder="Produits"
                value={pickerQuery}
                onChange={(e) => { setPickerQuery(e.target.value); setPickerOpen(true); }}
                onFocus={() => setPickerOpen(true)}
              />
              {pickerOpen && (
                <div className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-ink-200 bg-white shadow-card">
                  {filteredProducts.length === 0 && <p className="p-4 text-sm text-ink-700">Aucun produit.</p>}
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="flex w-full items-center gap-3 border-b border-ink-200 px-3 py-2 text-left last:border-0 hover:bg-ink-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.image ? <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-ink-200" />}
                      <span className="flex-1 text-sm font-bold">{p.name}</span>
                      <span className="text-sm font-black text-brand-500">{formatPrice(p.price)}</span>
                      <Plus size={16} className="text-brand-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Résumé des commandes */}
          <Card title="Résumé des commandes">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-100 text-xs uppercase text-ink-700">
                  <tr>
                    <th className="px-3 py-3 text-left">Produit</th>
                    <th className="px-3 py-3 text-left">ID</th>
                    <th className="px-3 py-3 text-left">Quantité</th>
                    <th className="px-3 py-3 text-left">Attributs</th>
                    <th className="px-3 py-3 text-left">Prix unitaire</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, idx) => (
                    <tr key={idx} className="border-t border-ink-200">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {l.image ? <img src={l.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : null}
                          <span className="line-clamp-1 font-bold">{l.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink-700">{l.productId}</td>
                      <td className="px-3 py-3">
                        <input type="number" min={1} value={l.qty} onChange={(e) => setLine(idx, { qty: Math.max(1, Number(e.target.value) || 1) })} className="input w-20" />
                      </td>
                      <td className="px-3 py-3 text-ink-700">—</td>
                      <td className="px-3 py-3">
                        <input type="number" min={0} step="0.01" value={l.unitPrice} onChange={(e) => setLine(idx, { unitPrice: Number(e.target.value) || 0 })} className="input w-24" />
                      </td>
                      <td className="px-3 py-3 text-right font-black">{formatPrice(l.qty * l.unitPrice)}</td>
                      <td className="px-3 py-3 text-right">
                        <button type="button" onClick={() => removeLine(idx)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {lines.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-8 text-center text-ink-700">La scène est prête pour vos produits ! ✨🎉</td></tr>
                  )}
                </tbody>
                {lines.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-ink-200 bg-ink-100">
                      <td colSpan={5} className="px-3 py-3 text-right font-black uppercase">Total</td>
                      <td className="px-3 py-3 text-right text-lg font-black text-brand-500">{formatPrice(total)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        </div>
      )}
    </Drawer>
  );
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white">
      <header className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-ink-900">{title}</h3>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-700">{label}</span>
      {children}
    </label>
  );
}
