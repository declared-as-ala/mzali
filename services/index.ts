/**
 * Service factory.
 * THIS is the only place that knows which backend powers the storefront.
 * Phase 2: replace these instantiations with PrismaProductService etc., and nothing else changes.
 */
import type { ProductService } from './product-service';
import type { CategoryService } from './category-service';
import type { OrderService } from './order-service';
import { WooCommerceProductService } from './woo/woo-product-service';
import { WooCommerceCategoryService } from './woo/woo-category-service';
import { WooCommerceOrderService } from './woo/woo-order-service';

export const productService: ProductService = new WooCommerceProductService();
export const categoryService: CategoryService = new WooCommerceCategoryService();
export const orderService: OrderService = new WooCommerceOrderService();

// Re-export interfaces for typed consumers
export type { ProductService } from './product-service';
export type { CategoryService } from './category-service';
export type { OrderService } from './order-service';
