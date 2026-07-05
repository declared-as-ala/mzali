import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { orderService } from '@/services';
import { wooClient } from '@/services/woo/woo-client';
import type { WooOrderRaw } from '@/services/woo/woo-types';
import { navex, navexConfigured, buildNavexDesignation } from '@/lib/navex';
import { alreadySentResponse, withDeliveryLock } from '@/lib/delivery-idempotency';

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!navexConfigured) return NextResponse.json({ error: 'Navex non configuré (env)' }, { status: 400 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  return withDeliveryLock(`navex:${orderId}`, async () => {
    const order = await orderService.getById(String(orderId));
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const existingTracking = String((order.meta?._navex_tracking as string) ?? '').trim();
    if (existingTracking || order.meta?._navex_status === 'sent') {
      return NextResponse.json(alreadySentResponse(existingTracking), { status: 200 });
    }

    const codAmount = order.total;
    const { designation: productLabel, nbArticle: itemsCount } = buildNavexDesignation(order.items);

    const result = await navex.createShipment({
      reference: `#${order.number || order.id}`,
      receiverName: order.customer.firstName + (order.customer.lastName ? ' ' + order.customer.lastName : ''),
      receiverPhone: order.customer.phone,
      receiverGov: order.customer.city,
      receiverCity: order.customer.city,
      receiverAddress: order.customer.address,
      codAmount,
      itemsCount,
      productLabel,
    });

    // Write result back to the WC order
    const meta: { key: string; value: unknown }[] = [
      { key: '_navex_status', value: result.ok ? 'sent' : 'failed' },
      { key: '_navex_response', value: typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw ?? null) },
    ];
    if (result.barcode) meta.push({ key: '_navex_tracking', value: result.barcode });
    if (result.error) meta.push({ key: '_navex_error', value: result.error });
    try { await wooClient.put<WooOrderRaw>(`/orders/${order.id}`, { meta_data: meta }); } catch {}

    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  });
}
