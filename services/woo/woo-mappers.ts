import type { Category, Product, ProductBundle, OrderResponse, OrderStatus } from '@/types';
import type { WooCategoryRaw, WooOrderRaw, WooProductRaw } from './woo-types';

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_CODE ?? 'TND';

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function mapCategory(c: WooCategoryRaw): Category {
  return {
    id: String(c.id),
    parentId: c.parent ? String(c.parent) : null,
    name: c.name,
    slug: c.slug,
    description: c.description || undefined,
    imageUrl: c.image?.src,
    productCount: c.count,
  };
}

function extractBundles(meta: WooProductRaw['meta_data']): ProductBundle[] {
  const raw = meta.find((m) => m.key === '_mzem_bundles')?.value;
  if (!Array.isArray(raw)) return [];
  return raw.map((b: any, i: number) => ({
    id: String(i),
    name: String(b.name ?? ''),
    label: b.label ? String(b.label) : undefined,
    regularPrice: num(b.regular_price),
    price: num(b.price),
    deliveryPrice: num(b.delivery_price),
    quantity: Number(b.quantity ?? 1) || 1,
    badgeColor: (['red', 'green', 'blue', 'purple'].includes(b.badge_color) ? b.badge_color : 'purple') as ProductBundle['badgeColor'],
    imageUrl: b.image_url || undefined,
    isDefault: !!b.default,
  }));
}

export function mapProduct(p: WooProductRaw): Product {
  const meta: Record<string, unknown> = {};
  for (const m of p.meta_data ?? []) meta[m.key] = m.value;

  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name,
    status: p.status === 'publish' ? 'published' : p.status === 'private' ? 'private' : 'draft',
    description: p.description ?? '',
    shortDescription: p.short_description ?? '',
    price: num(p.price),
    regularPrice: num(p.regular_price || p.price),
    salePrice: p.sale_price ? num(p.sale_price) : null,
    onSale: !!p.on_sale,
    currency: CURRENCY,
    inStock: p.stock_status === 'instock',
    stockQuantity: p.stock_quantity,
    images: (p.images ?? []).map((img) => ({ id: String(img.id), url: img.src, alt: img.alt })),
    categoryIds: (p.categories ?? []).map((c) => String(c.id)),
    categorySlugs: (p.categories ?? []).map((c) => c.slug),
    attributes: (p.attributes ?? []).map((a) => ({ name: a.name, options: a.options, variation: a.variation })),
    bundles: extractBundles(p.meta_data ?? []),
    upsellIds: (p.upsell_ids ?? []).map(String),
    crossSellIds: (p.cross_sell_ids ?? []).map(String),
    meta,
  };
}

export function mapOrder(o: WooOrderRaw): OrderResponse {
  const shippingTotal = (o.shipping_lines ?? []).reduce((s, l) => s + num(l.total), 0);
  // Pass the raw slug through — admin UI shows it as-is so custom-status plugins work.
  const status = (o.status ?? 'pending') as OrderStatus;
  return {
    id: String(o.id),
    number: o.number,
    status,
    currency: o.currency || CURRENCY,
    total: num(o.total),
    createdAt: o.date_created,
    customer: {
      firstName: o.billing.first_name,
      lastName: o.billing.last_name,
      phone: o.billing.phone,
      email: o.billing.email,
      city: o.billing.city,
      address: o.billing.address_1,
    },
    items: (o.line_items ?? []).map((li) => ({
      productId: String(li.product_id),
      name: li.name,
      quantity: li.quantity,
      price: num(li.price),
      total: num(li.total),
      imageUrl: li.image?.src,
    })),
    shipping: shippingTotal,
    meta: Object.fromEntries((o.meta_data ?? []).map((m) => [m.key, m.value])),
  };
}
