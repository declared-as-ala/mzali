import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles, Phone } from 'lucide-react';
import { SITE } from '@/lib/site-config';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white">
      {/* glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(255,255,255,.20),transparent_45%),radial-gradient(circle_at_88%_115%,rgba(34,191,89,.28),transparent_50%)]" />
      {/* soft grid */}
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="container-shop relative grid items-center gap-8 py-10 md:grid-cols-[1.1fr_1fr] md:gap-12 md:py-14 lg:py-16">
        {/* LEFT — copy */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur ring-1 ring-white/20">
            <Sparkles size={12} /> Collection 2026
          </span>

          <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-tight md:text-5xl lg:text-6xl">
            {SITE.name}
          </h1>

          <p className="mt-3 max-w-xl text-lg font-semibold text-white/90 md:text-xl">
            {SITE.hero.title}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="#produits" className="btn-cta shake-cta text-sm md:text-base">
              {SITE.cta.text} <ArrowRight size={18} />
            </Link>
            <a
              href={`tel:${SITE.contact.phone}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Phone size={16} /> {SITE.contact.phone}
            </a>
          </div>

          <div className="mt-6 grid max-w-md grid-cols-3 gap-3 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 text-white/90"><Truck size={15} className="text-cta" /> Livraison 24–48h</span>
            <span className="inline-flex items-center gap-1.5 text-white/90"><ShieldCheck size={15} className="text-cta" /> Paiement COD</span>
            <span className="inline-flex items-center gap-1.5 text-white/90"><RotateCcw size={15} className="text-cta" /> Échange facile</span>
          </div>
        </div>

        {/* RIGHT — big hero photo */}
        <div className="relative z-0 hidden md:block">
          {/* decorative blurs */}
          <div className="absolute -left-6 top-10 h-24 w-24 rounded-3xl bg-cta/40 blur-3xl" aria-hidden />
          <div className="absolute -right-4 bottom-6 h-32 w-32 rounded-full bg-white/30 blur-3xl" aria-hidden />
          <div className="absolute right-12 top-6 h-16 w-16 rounded-2xl bg-brand-300/60 blur-2xl" aria-hidden />

          {/* outer rotated frame for depth */}
          <div className="absolute inset-0 -m-2 rotate-2 rounded-[2rem] bg-white/10 ring-1 ring-white/20 backdrop-blur-sm" aria-hidden />

          {/* main image card */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/20 via-white/10 to-brand-700/40 shadow-2xl ring-1 ring-white/30 backdrop-blur md:aspect-[5/6] lg:aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE.logo}
              alt={SITE.name}
              className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 hover:scale-105"
            />
            {/* gradient overlay for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/55 via-transparent to-transparent" />

            {/* floating mini-stats */}
            <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-brand-700 shadow-lg">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-cta text-white">★</span>
              Top vente
            </div>

            <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-brand-700 shadow-lg">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cta" />
                Livraison toute la Tunisie
              </span>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cta px-3 py-1.5 text-xs font-black text-white shadow-cta">
                Paiement à la livraison ✓
              </span>
            </div>
          </div>
        </div>

        {/* MOBILE — compact hero image */}
        <div className="relative -mt-2 md:hidden">
          <div className="relative mx-auto aspect-[5/4] max-w-sm overflow-hidden rounded-3xl ring-1 ring-white/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logo} alt={SITE.name} className="absolute inset-0 h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
