import { CartView } from "@/components/CartView";
import { SiteHeader } from "@/components/SiteHeader";

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Vault basket
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-950">
            Cart
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Review your cards before sending a WhatsApp enquiry.
          </p>
        </div>
        <CartView />
      </main>
    </div>
  );
}
