import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';
import { orderService, productService } from '@/services';
import { formatPrice } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [orders, products] = await Promise.all([
    orderService.list({ perPage: 100 }).catch(() => ({ items: [], total: 0, totalPages: 0, page: 1 })),
    productService.list({ perPage: 1 }).catch(() => ({ items: [], total: 0, totalPages: 0, page: 1 })),
  ]);

  const orderList = orders.items;
  const revenue = orderList.reduce((s, o) => s + o.total, 0);
  const completed = orderList.filter((o) => o.status === 'completed').length;
  const completion = orderList.length ? Math.round((completed / orderList.length) * 100) : 0;
  const aov = orderList.length ? revenue / orderList.length : 0;

  const kpis = [
    { label: 'Revenu', value: formatPrice(revenue), icon: DollarSign, color: 'from-emerald-500 to-emerald-700' },
    { label: 'Commandes', value: orderList.length, icon: ShoppingCart, color: 'from-brand-500 to-brand-700' },
    { label: 'Panier moyen', value: formatPrice(aov), icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
    { label: 'Taux complet.', value: `${completion}%`, icon: Package, color: 'from-rose-500 to-pink-600' },
  ];

  const statusCounts: Record<string, number> = {};
  for (const o of orderList) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

  const top = new Map<string, number>();
  for (const o of orderList) {
    for (const li of o.items) top.set(li.name, (top.get(li.name) ?? 0) + li.quantity);
  }
  const topProducts = [...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-500">Mzali Store</p>
        <h1 className="text-3xl font-black">Dashboard</h1>
      </header>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${k.color} p-6 text-white shadow-card`}>
            <k.icon size={28} className="opacity-30" />
            <p className="mt-4 text-3xl font-black">{k.value}</p>
            <p className="text-sm opacity-90">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-4 font-bold">Statuts des commandes</h2>
          <ul className="space-y-2">
            {Object.entries(statusCounts).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between rounded-lg bg-ink-100 px-4 py-3">
                <span className="font-semibold capitalize">{k}</span>
                <span className="font-black text-brand-500">{v}</span>
              </li>
            ))}
            {!Object.keys(statusCounts).length && <p className="text-ink-700">Pas encore de commandes.</p>}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-bold">Top produits</h2>
          <ul className="space-y-2">
            {topProducts.map(([name, qty]) => (
              <li key={name} className="flex items-center justify-between rounded-lg bg-ink-100 px-4 py-3">
                <span className="line-clamp-1 font-semibold">{name}</span>
                <span className="font-black text-brand-500">×{qty}</span>
              </li>
            ))}
            {!topProducts.length && <p className="text-ink-700">{products.total} produits en catalogue.</p>}
          </ul>
        </section>
      </div>
    </div>
  );
}
