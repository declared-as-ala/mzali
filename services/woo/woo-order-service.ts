import type { CheckoutPayload, OrderResponse } from '@/types';
import type { OrderService, OrderListQuery, OrderListResult, OrderUpdate } from '../order-service';
import { wooClient } from './woo-client';
import type { WooOrderRaw } from './woo-types';
import { mapOrder } from './woo-mappers';

export class WooCommerceOrderService implements OrderService {
  async list(query: OrderListQuery = {}): Promise<OrderListResult> {
    const res = await wooClient.get<WooOrderRaw[]>('/orders', {
      page: query.page ?? 1,
      per_page: query.perPage ?? 50,
      status: query.status && query.status !== 'any' ? query.status : undefined,
      search: query.search || undefined,
      after: query.after || undefined,
      before: query.before || undefined,
    });
    return { items: res.data.map(mapOrder), total: res.total, totalPages: res.totalPages, page: query.page ?? 1 };
  }

  async create(payload: CheckoutPayload): Promise<OrderResponse> {
    const { customer, items, shipping, deliveryCompany, paymentMethod = 'cod' } = payload;
    // Status default. Tunisian COD plugins restrict this enum, so allow override via env.
    // For boutiqueahmedmzali.com the allowed values are: en-attente, confirme, annule, tentative, auto-draft, checkout-draft
    const defaultStatus = process.env.WC_DEFAULT_ORDER_STATUS || 'en-attente';
    const wcPayload: Record<string, unknown> = {
      payment_method: paymentMethod,
      payment_method_title: paymentMethod === 'cod' ? 'Paiement à la livraison' : 'Carte',
      set_paid: false,
      status: defaultStatus,
      billing: {
        first_name: customer.firstName,
        last_name: customer.lastName ?? '',
        phone: customer.phone,
        email: customer.email ?? '',
        address_1: customer.address,
        city: customer.city,
        country: 'TN',
      },
      shipping: {
        first_name: customer.firstName,
        last_name: customer.lastName ?? '',
        address_1: customer.address,
        city: customer.city,
        country: 'TN',
      },
      line_items: items.map((i) => ({ product_id: Number(i.productId), quantity: i.qty })),
      shipping_lines: shipping > 0 ? [{ method_id: 'flat_rate', method_title: deliveryCompany || 'Livraison', total: String(shipping) }] : [],
      customer_note: customer.note ?? '',
      meta_data: [
        ...(customer.phone2 ? [{ key: '_mzem_phone_2', value: customer.phone2 }] : []),
        ...(deliveryCompany ? [{ key: '_mzem_delivery_company', value: deliveryCompany }] : []),
        ...(payload.source ? [{ key: '_mzem_source', value: payload.source }] : []),
      ],
    };
    const res = await wooClient.post<WooOrderRaw>('/orders', wcPayload);
    return mapOrder(res.data);
  }

  async getById(id: string): Promise<OrderResponse | null> {
    try {
      const res = await wooClient.get<WooOrderRaw>(`/orders/${id}`);
      return res.data ? mapOrder(res.data) : null;
    } catch {
      return null;
    }
  }

  async update(id: string, patch: OrderUpdate): Promise<OrderResponse> {
    const body: Record<string, unknown> = {};
    // Only forward status if explicitly set — avoids 400s on custom-status plugins.
    if (patch.status && String(patch.status).trim() !== '') body.status = patch.status;
    if (patch.customer) {
      const c = patch.customer;
      body.billing = {
        first_name: c.firstName,
        last_name: c.lastName ?? '',
        phone: c.phone,
        email: c.email ?? '',
        address_1: c.address,
        city: c.city,
        country: 'TN',
      };
    }
    if (patch.items) {
      // Replace line items: WC needs to clear by sending {id, quantity:0} for existing first.
      // To avoid extra round trip we just send the new set; WC will create new + remove untouched.
      body.line_items = patch.items.map((i) => ({ product_id: Number(i.productId), quantity: i.qty }));
    }
    if (patch.shipping !== undefined) {
      body.shipping_lines = [{ method_id: 'flat_rate', method_title: patch.deliveryCompany || 'Livraison', total: String(patch.shipping) }];
    }
    const meta: { key: string; value: unknown }[] = [];
    if (patch.deliveryCompany !== undefined) meta.push({ key: '_mzem_delivery_company', value: patch.deliveryCompany });
    if (patch.exchange !== undefined) meta.push({ key: '_mzem_exchange', value: patch.exchange ? 'yes' : 'no' });
    if (patch.privateNote !== undefined) meta.push({ key: '_mzem_private_note', value: patch.privateNote });
    if (meta.length) body.meta_data = meta;

    const res = await wooClient.put<WooOrderRaw>(`/orders/${id}`, body);
    return mapOrder(res.data);
  }

  async remove(id: string): Promise<void> {
    await wooClient.del(`/orders/${id}`);
  }
}
