/**
 * Service factory.
 * THIS is the only place that knows which backend powers the storefront.
 * Phase 2: replace these instantiations with Prisma-backed services.
 */
import type { ProductService } from './product-service';
import type { CategoryService } from './category-service';
import type { OrderService } from './order-service';
import type { EmployeeService } from './employee-service';
import { WooCommerceProductService } from './woo/woo-product-service';
import { WooCommerceCategoryService } from './woo/woo-category-service';
import { WooCommerceOrderService } from './woo/woo-order-service';
import { FileEmployeeService } from './employees/file-employee-service';

export const productService: ProductService = new WooCommerceProductService();
export const categoryService: CategoryService = new WooCommerceCategoryService();
export const orderService: OrderService = new WooCommerceOrderService();
export const employeeService: EmployeeService = new FileEmployeeService();

export type { ProductService } from './product-service';
export type { CategoryService } from './category-service';
export type { OrderService } from './order-service';
export type { EmployeeService, Employee } from './employee-service';
