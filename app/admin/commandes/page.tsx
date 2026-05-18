import { orderService } from '@/services';
import CommandesView from '@/components/admin/CommandesView';

export const dynamic = 'force-dynamic';

export default async function Commandes() {
  const result = await orderService.list({ perPage: 100 }).catch(() => ({
    items: [], total: 0, totalPages: 0, page: 1,
  }));

  // Count orders per phone so we can flag "Client régulier" without N round-trips.
  const counts: Record<string, number> = {};
  for (const o of result.items) {
    const p = (o.customer.phone || '').replace(/\s/g, '');
    if (!p) continue;
    counts[p] = (counts[p] ?? 0) + 1;
  }

  return <CommandesView initialOrders={result.items} total={result.total} repeatCounts={counts} />;
}
