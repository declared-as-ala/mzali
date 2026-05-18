import type { CheckoutPayload, OrderResponse, OrderStatus } from '@/types';

export type OrderListQuery = {
  page?: number;
  perPage?: number;
  status?: OrderStatus | 'any';
  search?: string;
  after?: string;
  before?: string;
};

export type OrderListResult = {
  items: OrderResponse[];
  total: number;
  totalPages: number;
  page: number;
};

export type OrderUpdate = {
  status?: OrderStatus;
  customer?: Partial<CheckoutPayload['customer']>;
  shipping?: number;
  deliveryCompany?: string;
  exchange?: boolean;
  privateNote?: string;
  items?: { productId: string; qty: number; unitPrice?: number }[];
};

export interface OrderService {
  create(payload: CheckoutPayload): Promise<OrderResponse>;
  getById(id: string): Promise<OrderResponse | null>;
  list(query?: OrderListQuery): Promise<OrderListResult>;
  update(id: string, patch: OrderUpdate): Promise<OrderResponse>;
  remove(id: string): Promise<void>;
}
