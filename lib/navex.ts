/**
 * Navex (Nourexpress) API client — server-side only.
 * Adjust the field names below to match the exact fields your Navex account expects.
 * Docs: ask Navex support for `POST /shipments` schema. The keys here cover the common shape.
 */
const BASE = (process.env.NAVEX_API_BASE ?? 'https://api.navex.tn/v1').replace(/\/$/, '');
const TOKEN = process.env.NAVEX_API_TOKEN ?? '';

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Navex ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export type NavexShipment = {
  reference: string;       // your order number
  receiver_name: string;
  receiver_phone: string;
  receiver_phone_2?: string;
  receiver_address: string;
  receiver_city: string;
  cod_amount: number;      // cash to collect (TND)
  weight_kg?: number;
  notes?: string;
  product_name?: string;
};

export type NavexResponse = {
  tracking_number: string;
  label_url?: string;
};

export const navex = {
  createShipment: (s: NavexShipment) => call<NavexResponse>('POST', '/shipments', s),
  getTracking:    (tn: string)       => call<{ status: string; events: { date: string; label: string }[] }>('GET', `/shipments/${tn}`),
  cancelShipment: (tn: string)       => call<{ ok: true }>('DELETE', `/shipments/${tn}`),
};
