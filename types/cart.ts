export type CartItem = {
  productId: string;
  name: string;
  price: number;       // unit price actually paid (may include bundle discount)
  qty: number;
  image: string;
  variation?: Record<string, string>; // e.g. { Couleur: "Rouge", Taille: "M" }
  bundleId?: string;
  meta?: Record<string, unknown>;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};
