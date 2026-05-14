import { cookies } from "next/headers";
import { CartView } from "@/components/CartView";
import { SiteHeader } from "@/components/SiteHeader";
import {
  parseServerCartCookie,
  serverCartCookieName,
} from "@/lib/server-cart";

export default async function CartPage() {
  const cookieStore = await cookies();
  const initialCartItems = parseServerCartCookie(
    cookieStore.get(serverCartCookieName)?.value,
  );

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
        <CartView initialCartItems={initialCartItems} />
      </main>
    </div>
  );
}
