import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { CheckCircle2 } from 'lucide-react';

export default function Merci({ searchParams }: { searchParams: { id?: string } }) {
  return (
    <>
      <Header categories={[]} />
      <main className="mx-auto max-w-2xl px-4 py-20 text-center lg:px-8">
        <CheckCircle2 className="mx-auto text-green-500" size={64} />
        <h1 className="mt-4 text-3xl font-black">Merci pour votre commande !</h1>
        <p className="mt-3 text-slate-600">Votre commande <strong>#{searchParams.id ?? '—'}</strong> a été reçue. Nous vous appellerons sous peu pour confirmer.</p>
        <a href="/" className="btn-primary mt-6">Retour à l'accueil</a>
      </main>
      <Footer />
    </>
  );
}
