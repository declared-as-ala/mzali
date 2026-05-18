import type { CartItem } from './cart';

export type CheckoutCustomer = {
  firstName: string;
  lastName?: string;
  phone: string;
  phone2?: string;
  email?: string;
  city: string;
  address: string;
  note?: string;
};

export type CheckoutPayload = {
  customer: CheckoutCustomer;
  items: CartItem[];
  shipping: number;     // delivery cost
  deliveryCompany?: string;
  paymentMethod?: 'cod' | 'card';
  source?: string;      // utm/source for analytics
};

// Standard WooCommerce statuses + any custom slug (e.g. Tunisian COD plugins:
// "en-attente", "confirme", "annule", "tentative", "auto-draft", "checkout-draft", etc.)
export type StandardOrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed';
export type OrderStatus = StandardOrderStatus | (string & {});

export type OrderLineItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
};

export type OrderResponse = {
  id: string;
  number: string;
  status: OrderStatus;
  currency: string;
  total: number;
  createdAt: string;       // ISO
  customer: CheckoutCustomer;
  items: OrderLineItem[];
  shipping: number;
  meta?: Record<string, unknown>;
};
