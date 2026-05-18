'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, Menu, X, Phone } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { SITE } from '@/lib/site-config';
import { useState } from 'react';

export default function Header({ categories }: { categories: { name: string; slug: string }[] }) {
  const items = useCart((s) => s.items);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="announce-bar py-2 text-center text-xs sm:text-sm">
        {SITE.announcementBar}
      </div>
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur">
        <div className="container-shop flex items-center gap-4 py-3">
          <button className="lg:hidden text-ink-900" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/" className="flex items-center gap-3">
            <Image src={SITE.logo} alt={SITE.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" unoptimized />
            <span className="hidden text-lg font-black tracking-tight text-ink-900 sm:block">
              {SITE.name}
            </span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-900 hover:bg-ink-100">Accueil</Link>
            {categories.slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/categorie/${c.slug}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-900 hover:bg-ink-100">{c.name}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a href={`tel:${SITE.contact.phone}`} className="hidden items-center gap-2 rounded-lg bg-cta/10 px-3 py-2 text-sm font-bold text-cta-dark hover:bg-cta/20 sm:inline-flex">
              <Phone size={14} />
              {SITE.contact.phone}
            </a>
            <button className="rounded-lg p-2 text-ink-900 hover:bg-ink-100" aria-label="Recherche"><Search size={20} /></button>
            <Link href="/panier" className="relative rounded-lg p-2 text-ink-900 hover:bg-ink-100" aria-label="Panier">
              <ShoppingBag size={20} />
              {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-cta text-[10px] font-black text-white">{count}</span>}
            </Link>
          </div>
        </div>
        {open && (
          <nav className="border-t border-ink-200 bg-white p-3 lg:hidden">
            <Link href="/" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-semibold text-ink-900">Accueil</Link>
            {categories.map((c) => (
              <Link key={c.slug} href={`/categorie/${c.slug}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-semibold text-ink-900">{c.name}</Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
