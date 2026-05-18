import { notFound } from 'next/navigation';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import ProductCard from '@/components/site/ProductCard';
import { productService, categoryService } from '@/services';

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [cat, categories] = await Promise.all([
    categoryService.getBySlug(params.slug),
    categoryService.list({ hideEmpty: true }),
  ]);
  if (!cat) notFound();

  const result = await productService.list({ categoryId: cat.id, perPage: 48 }).catch(() => ({
    items: [], total: 0, totalPages: 0, page: 1,
  }));

  return (
    <>
      <Header categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
      <main className="container-shop py-10">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500">Catégorie</p>
          <h1 className="mt-2 text-4xl font-black text-ink-900">{cat.name}</h1>
          <p className="mt-1 text-ink-700">{result.total || result.items.length} articles</p>
          {cat.description && (
            <div className="prose prose-sm mt-4 max-w-none text-ink-700" dangerouslySetInnerHTML={{ __html: cat.description }} />
          )}
        </header>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {!result.items.length && (
          <p className="py-20 text-center text-ink-700">Aucun produit dans cette catégorie.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
