import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Music2, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import { SITE } from '@/lib/site-config';

export default function Footer() {
  const { facebook, instagram, tiktok, whatsapp, email, phone } = SITE.contact;
  return (
    <footer className="mt-20 bg-brand-700 text-white/80">
      <div className="container-shop grid gap-10 py-12 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3 text-white">
            <Image src={SITE.logo} alt={SITE.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" unoptimized />
            <span className="text-lg font-black">{SITE.name}</span>
          </Link>
          <p className="mt-3 text-sm text-white/60">Prêt-à-porter et accessoires. Livraison COD partout en Tunisie en 24–48 h.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={facebook} target="_blank" rel="noopener" className="rounded-lg bg-white/10 p-2.5 transition hover:bg-[#1877F2]" aria-label="Facebook"><Facebook size={18} /></a>
            <a href={instagram} target="_blank" rel="noopener" className="rounded-lg bg-white/10 p-2.5 transition hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888]" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={tiktok} target="_blank" rel="noopener" className="rounded-lg bg-white/10 p-2.5 transition hover:bg-black" aria-label="TikTok"><Music2 size={18} /></a>
            <a href={`https://wa.me/216${whatsapp}`} target="_blank" rel="noopener" className="rounded-lg bg-white/10 p-2.5 transition hover:bg-[#25D366]" aria-label="WhatsApp"><MessageCircle size={18} /></a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Boutique</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Tous les produits</Link></li>
            <li><Link href="/categorie/nouveautes" className="hover:text-white">Nouveautés</Link></li>
            <li><Link href="/categorie/promotions" className="hover:text-white">Promotions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Aide</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/livraison" className="hover:text-white">Livraison &amp; retour</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/cgv" className="hover:text-white">CGV</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold text-white">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone size={16} /> <a href={`tel:${phone}`}>+216 {phone}</a></li>
            <li className="flex items-center gap-2"><MessageCircle size={16} /> <a href={`https://wa.me/216${whatsapp}`} target="_blank" rel="noopener">WhatsApp: {whatsapp}</a></li>
            <li className="flex items-center gap-2"><Mail size={16} /> <a href={`mailto:${email}`}>{email}</a></li>
            <li className="flex items-center gap-2"><MapPin size={16} /> Tunis, Tunisie</li>
          </ul>
        </div>
      </div>

      <a
        href={`https://wa.me/216${whatsapp}`}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-110"
      >
        <MessageCircle size={26} />
      </a>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {SITE.name}. Tous droits réservés.
      </div>
    </footer>
  );
}
