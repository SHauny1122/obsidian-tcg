import { CheckoutView } from "@/components/CheckoutView";
import { SiteHeader } from "@/components/SiteHeader";
import { products } from "@/data/products";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Secure checkout preview
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-950">
            Checkout
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Complete buyer details here. Paystack payment will be connected
            later.
          </p>
        </div>
        <CheckoutView mockProducts={products} />
      </main>
    </div>
  );
}
