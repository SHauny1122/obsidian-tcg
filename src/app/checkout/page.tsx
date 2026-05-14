import { cookies } from "next/headers";
import { CheckoutView } from "@/components/CheckoutView";
import { SiteHeader } from "@/components/SiteHeader";
import { listProducts } from "@/lib/products-repository";
import {
  parseServerCartCookie,
  serverCartCookieName,
} from "@/lib/server-cart";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const initialCartItems = parseServerCartCookie(
    cookieStore.get(serverCartCookieName)?.value,
  );
  const products = await listProducts();

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
            Complete buyer details here before continuing to Paystack.
          </p>
        </div>
        <CheckoutView
          initialProducts={products}
          initialCartItems={initialCartItems}
        />
      </main>
    </div>
  );
}
