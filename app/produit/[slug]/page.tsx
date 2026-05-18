import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import AddToCart from '@/components/site/AddToCart';
import ProductCard from '@/components/site/ProductCard';
import { productService, categoryService } from '@/services';
import { formatPrice } from '@/lib/site-config';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await productService.getBySlug(params.slug);
  if (!product) notFound();

  const [categories, related] = await Promise.all([
    categoryService.list({ hideEmpty: true }).catch(() => []),
    productService.getRelated(product.id, 4).catch(() => []),
  ]);

  const discount = product.onSale && product.regularPrice > product.price
    ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
    : 0;

  return (
    <>
      <Header categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />

      <main className="container-shop py-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            {product.images.slice(0, 4).map((img, i) => (
              <div
                key={img.id}
                className={`relative aspect-square overflow-hidden rounded-2xl bg-ink-100 ${i === 0 ? 'col-span-2 aspect-[4/3]' : ''}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || product.name}
                  fill
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500">
              {categories.find((c) => product.categoryIds.includes(c.id))?.name ?? 'Produit'}
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl text-ink-900">{product.name}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-brand-500">{formatPrice(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-ink-300 line-through">{formatPrice(product.regularPrice)}</span>
                  <span className="rounded-md bg-red-600 px-2 py-1 text-xs font-black text-white">-{discount}%</span>
                </>
              )}
            </div>

            {product.shortDescription && (
              <div
                className="prose prose-sm mt-6 max-w-none text-ink-700"
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
            )}

            <AddToCart product={product} />

            {product.description && (
              <details className="mt-8 rounded-2xl bg-white p-5 shadow-card">
                <summary className="cursor-pointer font-black text-ink-900">Description complète</summary>
                <div
                  className="prose prose-sm mt-3 max-w-none text-ink-700"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </details>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 text-2xl font-black uppercase tracking-tight text-ink-900">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
