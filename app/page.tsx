import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import Hero from '@/components/site/Hero';
import ProductCard from '@/components/site/ProductCard';
import { productService, categoryService } from '@/services';
import { SITE } from '@/lib/site-config';
import { Truck, ShieldCheck, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

export default async function Home() {
  const [productsResult, categories] = await Promise.all([
    productService.list({ perPage: 16, orderBy: 'date' }).catch(() => ({ items: [], total: 0, totalPages: 0, page: 1 })),
    categoryService.list({ hideEmpty: true }).catch(() => []),
  ]);
  const products = productsResult.items;

  return (
    <>
      <Header categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
      <Hero />

      {/* Trust strip just under the hero */}
      <section className="border-b border-ink-200 bg-white">
        <div className="container-shop flex flex-wrap items-center justify-around gap-y-3 py-3 text-xs font-bold text-ink-700 sm:text-sm">
          <span className="inline-flex items-center gap-2"><Truck size={16} className="text-brand-500" /> Livraison toute la Tunisie</span>
          <span className="hidden h-4 w-px bg-ink-200 sm:block" />
          <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-cta" /> Paiement à la livraison</span>
          <span className="hidden h-4 w-px bg-ink-200 sm:block" />
          <a href={`tel:${SITE.contact.phone}`} className="inline-flex items-center gap-2 hover:text-brand-500"><Phone size={16} /> {SITE.contact.phone}</a>
          <span className="hidden h-4 w-px bg-ink-200 sm:block" />
          <a href={`https://wa.me/216${SITE.contact.whatsapp}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-[#25D366]"><MessageCircle size={16} /> WhatsApp</a>
        </div>
      </section>

      <main className="container-shop">
        <section id="produits" className="pb-12 pt-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-500">Notre sélection</p>
              <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-ink-900 md:text-3xl">
                {SITE.productsTitle}
              </h2>
            </div>
            <Link href="/shop" className="hidden text-sm font-bold text-brand-500 hover:underline sm:inline">
              Tout voir →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Link href="/shop" className="btn-ghost">Voir tous les produits →</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
