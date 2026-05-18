import { NextResponse } from 'next/server';
import { orderService } from '@/services';
import type { CheckoutPayload } from '@/types';

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as CheckoutPayload;

    if (!payload?.customer?.phone || !payload?.customer?.firstName) {
      return NextResponse.json({ error: 'Nom et téléphone obligatoires.' }, { status: 400 });
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ error: 'Panier vide.' }, { status: 400 });
    }

    const order = await orderService.create(payload);
    return NextResponse.json({ id: order.id, number: order.number, total: order.total });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'order creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
