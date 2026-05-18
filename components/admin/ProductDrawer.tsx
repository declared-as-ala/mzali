'use client';
import { useEffect, useState } from 'react';
import Drawer from './Drawer';
import { Save, Copy, Trash2, Plus, X, GripVertical } from 'lucide-react';
import type { Product, ProductBundle } from '@/types';

type Tab = 'description' | 'options' | 'bundles' | 'related' | 'reviews';

type FormState = {
  name: string;
  sku: string;
  categoryIds: string[];
  manageStock: boolean;
  stockQuantity: number;
  regularPrice: number;
  salePrice: number;
  cost: number;
  deliveryPrice: number;
  deliveryCost: number;
  description: string;
  status: 'published' | 'draft' | 'private';
  images: { id: string; url: string }[];
  options: { label: string; type: 'text' | 'select' | 'radio'; values: string[] }[];
  bundles: ProductBundle[];
  upsellIds: string[];
};

const EMPTY: FormState = {
  name: '', sku: '', categoryIds: [], manageStock: false, stockQuantity: 0,
  regularPrice: 0, salePrice: 0, cost: 0, deliveryPrice: 0, deliveryCost: 0,
  description: '', status: 'published', images: [],
  options: [], bundles: [], upsellIds: [],
};

type Props = {
  open: boolean;
  onClose: () => void;
  productId?: string | null;
  onSaved?: (p: Product) => void;
};

export default function ProductDrawer({ open, onClose, productId, onSaved }: Props) {
  const isEdit = Boolean(productId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('description');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    if (!categories.length) {
      fetch('/api/admin/categories').then(async (r) => r.ok && setCategories(await r.json())).catch(() => {});
    }
    if (productId) {
      setLoading(true);
      fetch(`/api/admin/products/${productId}`)
        .then((r) => r.json())
        .then((p: Product) => {
          const options = (p.meta?._mzem_options as FormState['options']) ?? [];
          setForm({
            name: p.name,
            sku: (p.meta?._sku as string) ?? '',
            categoryIds: p.categoryIds,
            manageStock: p.stockQuantity !== null,
            stockQuantity: p.stockQuantity ?? 0,
            regularPrice: p.regularPrice,
            salePrice: p.salePrice ?? p.price,
            cost: Number(p.meta?._mzem_cost ?? 0),
            deliveryPrice: Number(p.meta?._mzem_delivery_price ?? 0),
            deliveryCost: Number(p.meta?._mzem_delivery_cost ?? 0),
            description: p.description,
            status: p.status,
            images: p.images.map((i) => ({ id: i.id, url: i.url })),
            options: Array.isArray(options) ? options.map((o) => ({
              label: o.label,
              type: o.type,
              values: typeof (o as unknown as { values: string }).values === 'string'
                ? String((o as unknown as { values: string }).values).split(',').map((s) => s.trim()).filter(Boolean)
                : (o.values as unknown as string[]),
            })) : [],
            bundles: p.bundles,
            upsellIds: p.upsellIds,
          });
        })
        .catch(() => alert('Erreur de chargement du produit'))
        .finally(() => setLoading(false));
    } else {
      setForm(EMPTY);
    }
    setTab('description');
  }, [open, productId, categories.length]);

  function up<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.name.trim()) { alert('Nom obligatoire'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        status: form.status,
        description: form.description,
        regularPrice: form.regularPrice,
        salePrice: form.salePrice || null,
        cost: form.cost,
        deliveryPrice: form.deliveryPrice,
        deliveryCost: form.deliveryCost,
        manageStock: form.manageStock,
        stockQuantity: form.manageStock ? form.stockQuantity : null,
        categoryIds: form.categoryIds,
        imageIds: form.images.map((i) => i.id),
        upsellIds: form.upsellIds,
        bundles: form.bundles,
        options: form.options.map((o) => ({ label: o.label, type: o.type, values: o.values.join(',') })),
      };
      const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur');
      const product = await res.json();
      onSaved?.(product);
      onClose();
    } catch (e) {
      alert(`Échec: ${e instanceof Error ? e.message : 'inconnu'}`);
    } finally {
      setSaving(false);
    }
  }

  async function duplicate() {
    if (!productId) return;
    const res = await fetch(`/api/admin/products/${productId}`);
    if (!res.ok) return alert('Erreur');
    const original: Product = await res.json();
    const payload = {
      name: `${original.name} (copie)`,
      status: 'draft' as const,
      description: original.description,
      regularPrice: original.regularPrice,
      salePrice: original.salePrice ?? null,
      categoryIds: original.categoryIds,
      imageIds: original.images.map((i) => i.id),
      bundles: original.bundles,
    };
    const create = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!create.ok) return alert('Erreur de duplication');
    const p = await create.json();
    onSaved?.(p);
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? `Modifier ${form.name}`.trim() : 'Ajouter un produit'}
      actions={
        <>
          <select
            value={form.status}
            onChange={(e) => up('status', e.target.value as FormState['status'])}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 focus:outline-none"
          >
            <option value="published">Affiché</option>
            <option value="draft">Brouillon</option>
            <option value="private">Privé</option>
          </select>
          {isEdit && (
            <button type="button" onClick={duplicate} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-bold text-ink-900 hover:bg-ink-100">
              <Copy size={14} /> Dupliquer
            </button>
          )}
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-soft hover:bg-brand-600 disabled:opacity-50">
            <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </>
      }
    >
      {loading ? <p className="p-10 text-center text-ink-700">Chargement…</p> : (
        <div className="space-y-5">
          {/* Détails */}
          <section className="rounded-2xl border border-ink-200 bg-white">
            <header className="border-b border-ink-200 px-5 py-3">
              <h3 className="text-sm font-black uppercase tracking-wide text-ink-900">Détails</h3>
            </header>
            <div className="p-5">
              <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                {form.images.map((img) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => up('images', form.images.filter((i) => i.id !== img.id))}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md bg-white/90 text-red-500 opacity-0 transition group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                    <span className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-md bg-white/90 text-ink-700">
                      <GripVertical size={12} />
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("URL de l'image (collez l'URL d'une image WordPress) :");
                    if (!url) return;
                    const id = prompt("ID média WordPress (numéro) :");
                    if (!id) return;
                    up('images', [...form.images, { id, url }]);
                  }}
                  className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-100 text-xs font-bold text-ink-700 hover:border-brand-300 hover:bg-ink-200"
                >
                  <span>800 × 800</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Nom du produit" className="md:col-span-1"><input className="input" value={form.name} onChange={(e) => up('name', e.target.value)} /></Field>
                <Field label="SKU"><input className="input" value={form.sku} onChange={(e) => up('sku', e.target.value)} /></Field>
                <Field label="Catégories">
                  <select
                    multiple
                    value={form.categoryIds}
                    onChange={(e) => up('categoryIds', Array.from(e.target.selectedOptions).map((o) => o.value))}
                    className="input h-[42px]"
                  >
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-bold">
                <span className={`relative inline-block h-6 w-11 rounded-full transition ${form.manageStock ? 'bg-brand-500' : 'bg-ink-200'}`}>
                  <input
                    type="checkbox"
                    checked={form.manageStock}
                    onChange={(e) => up('manageStock', e.target.checked)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <span className={`absolute top-0.5 grid h-5 w-5 place-items-center rounded-full bg-white shadow transition ${form.manageStock ? 'left-5' : 'left-0.5'}`} />
                </span>
                Suivre le stock
              </label>
              {form.manageStock && (
                <Field label="Quantité en stock" className="mt-3 max-w-xs">
                  <input type="number" min={0} className="input" value={form.stockQuantity} onChange={(e) => up('stockQuantity', Number(e.target.value) || 0)} />
                </Field>
              )}
            </div>
          </section>

          {/* Détails du prix */}
          <section className="rounded-2xl border border-ink-200 bg-white">
            <header className="flex items-center justify-between border-b border-ink-200 px-5 py-3">
              <h3 className="text-sm font-black uppercase tracking-wide text-ink-900">Détails du prix</h3>
              <button type="button" className="text-xs font-bold text-brand-500 hover:underline">Appliquer à toutes les options</button>
            </header>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Field label="Prix avant remise"><input type="number" className="input" value={form.regularPrice} onChange={(e) => up('regularPrice', Number(e.target.value) || 0)} /></Field>
              <Field label="Prix"><input type="number" className="input" value={form.salePrice} onChange={(e) => up('salePrice', Number(e.target.value) || 0)} /></Field>
              <Field label="Coût"><input type="number" className="input" value={form.cost} onChange={(e) => up('cost', Number(e.target.value) || 0)} /></Field>
              <Field label="Frais de livraison"><input type="number" className="input" value={form.deliveryPrice} onChange={(e) => up('deliveryPrice', Number(e.target.value) || 0)} /></Field>
              <Field label="Coût de livraison"><input type="number" className="input" value={form.deliveryCost} onChange={(e) => up('deliveryCost', Number(e.target.value) || 0)} /></Field>
            </div>
          </section>

          {/* Tabs */}
          <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
            <nav className="flex flex-wrap gap-2 bg-brand-500 p-3">
              {([
                ['description', 'Description'],
                ['options', 'Options'],
                ['bundles', 'Bundles'],
                ['related', 'Produits associés'],
                ['reviews', 'Avis'],
              ] as [Tab, string][]).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === k ? 'bg-white text-brand-500' : 'bg-white/15 text-white hover:bg-white/25'}`}
                >
                  {lbl}
                </button>
              ))}
            </nav>

            <div className="p-5">
              {tab === 'description' && (
                <textarea rows={8} className="input" value={form.description} onChange={(e) => up('description', e.target.value)} placeholder="Description" />
              )}
              {tab === 'options' && (
                <OptionsTab options={form.options} onChange={(opts) => up('options', opts)} />
              )}
              {tab === 'bundles' && (
                <BundlesTab bundles={form.bundles} onChange={(b) => up('bundles', b)} />
              )}
              {tab === 'related' && (
                <p className="text-sm text-ink-700">Sélection multiple — UI à venir. Les IDs en cours: {form.upsellIds.join(', ') || 'aucun'}.</p>
              )}
              {tab === 'reviews' && (
                <p className="text-sm text-ink-700">Les avis client s&apos;afficheront ici une fois disponibles depuis l&apos;API.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </Drawer>
  );
}

function OptionsTab({ options, onChange }: { options: FormState['options']; onChange: (v: FormState['options']) => void }) {
  function update(i: number, patch: Partial<FormState['options'][number]>) {
    onChange(options.map((o, idx) => idx === i ? { ...o, ...patch } : o));
  }
  function remove(i: number) { onChange(options.filter((_, idx) => idx !== i)); }
  function add() { onChange([...options, { label: '', type: 'text', values: [] }]); }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">
          <Plus size={14} /> Ajouter une option
        </button>
      </div>

      {options.map((o, i) => (
        <div key={i} className="grid gap-3 rounded-xl border border-ink-200 p-4 md:grid-cols-[1fr_1fr_2fr_auto]">
          <Field label="Nom de l'option"><input className="input" value={o.label} onChange={(e) => update(i, { label: e.target.value })} /></Field>
          <Field label="Type">
            <select className="input" value={o.type} onChange={(e) => update(i, { type: e.target.value as 'text' | 'select' | 'radio' })}>
              <option value="text">Texte</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
            </select>
          </Field>
          <Field label="Valeurs">
            <ChipsInput values={o.values} onChange={(values) => update(i, { values })} />
          </Field>
          <button type="button" onClick={() => remove(i)} className="self-end rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
        </div>
      ))}

      {options.length === 0 && <p className="text-sm text-ink-700">Aucune option. Cliquez sur « Ajouter une option ».</p>}
    </div>
  );
}

function ChipsInput({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState('');
  function commit() {
    const v = text.trim();
    if (!v) return;
    if (values.includes(v)) { setText(''); return; }
    onChange([...values, v]);
    setText('');
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-1 text-xs font-bold text-brand-700">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-brand-700/70 hover:text-red-500"><X size={12} /></button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } }}
        onBlur={commit}
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
        placeholder="Écrivez ici"
      />
    </div>
  );
}

function BundlesTab({ bundles, onChange }: { bundles: ProductBundle[]; onChange: (v: ProductBundle[]) => void }) {
  function update(i: number, patch: Partial<ProductBundle>) {
    onChange(bundles.map((b, idx) => idx === i ? { ...b, ...patch } : b));
  }
  function remove(i: number) { onChange(bundles.filter((_, idx) => idx !== i)); }
  function add() {
    onChange([...bundles, {
      id: String(Date.now()),
      name: `Bundle ${bundles.length + 1}`,
      label: '',
      regularPrice: 0, price: 0, deliveryPrice: 0, quantity: 1,
      badgeColor: 'red', isDefault: false,
    }]);
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">
          <Plus size={14} /> Ajouter un bundle
        </button>
      </div>
      {bundles.map((b, i) => (
        <article key={b.id} className="rounded-xl border border-ink-200 p-4">
          <header className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-black text-ink-900">Bundle {i + 1}</h4>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-bold">
                <input type="checkbox" checked={b.isDefault} onChange={(e) => update(i, { isDefault: e.target.checked })} className="h-4 w-4 accent-brand-500" />
                Par défaut
              </label>
              <button type="button" onClick={() => remove(i)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-[1.4fr_140px]">
            <div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Nom"><input className="input" value={b.name} onChange={(e) => update(i, { name: e.target.value })} /></Field>
                <Field label="Libellé"><input className="input" value={b.label ?? ''} onChange={(e) => update(i, { label: e.target.value })} /></Field>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <Field label="Prix avant remise"><input type="number" className="input" value={b.regularPrice} onChange={(e) => update(i, { regularPrice: Number(e.target.value) || 0 })} /></Field>
                <Field label="Prix"><input type="number" className="input" value={b.price} onChange={(e) => update(i, { price: Number(e.target.value) || 0 })} /></Field>
                <Field label="Frais de livraison"><input type="number" className="input" value={b.deliveryPrice} onChange={(e) => update(i, { deliveryPrice: Number(e.target.value) || 0 })} /></Field>
                <Field label="Quantité"><input type="number" min={1} className="input" value={b.quantity} onChange={(e) => update(i, { quantity: Math.max(1, Number(e.target.value) || 1) })} /></Field>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold text-ink-700">Couleur de la marque de remise :</span>
                {(['red', 'green', 'blue', 'purple'] as const).map((c) => (
                  <label key={c} className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name={`badge-${b.id}`}
                      checked={b.badgeColor === c}
                      onChange={() => update(i, { badgeColor: c })}
                    />
                    <span className={`rounded px-2 py-0.5 text-[11px] font-black text-white ${c === 'red' ? 'bg-red-500' : c === 'green' ? 'bg-emerald-500' : c === 'blue' ? 'bg-blue-500' : 'bg-brand-500'}`}>
                      -{Math.max(0, Math.round(((b.regularPrice - b.price) / Math.max(1, b.regularPrice)) * 100))}% OFF
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-bold uppercase text-ink-700">Image</span>
              <button
                type="button"
                onClick={() => {
                  const url = prompt("URL de l'image du bundle :");
                  if (url) update(i, { imageUrl: url });
                }}
                className="grid h-32 w-full place-items-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-100 text-xs font-bold text-ink-700 hover:border-brand-300"
              >
                {b.imageUrl
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={b.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                  : <span>400 × 400</span>}
              </button>
            </div>
          </div>
        </article>
      ))}
      {bundles.length === 0 && <p className="text-sm text-ink-700">Aucun bundle. Cliquez sur « Ajouter un bundle ».</p>}
    </div>
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
