import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * Returns the statuses an employee can apply to an order.
 * Admin-only / destructive statuses (refunded, etc.) are intentionally absent.
 */
const ALLOWED = [
  'pending', 'en-attente',
  'processing', 'confirme',
  'on-hold', 'tentative',
  'completed',
  'cancelled', 'annule',
];

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'employee') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json(ALLOWED);
}
