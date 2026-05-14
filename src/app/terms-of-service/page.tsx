import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { shopConfig } from "@/config/shop";

export const metadata = {
  title: `Terms of Service | ${shopConfig.name}`,
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="vault-panel rounded-lg p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold text-stone-950">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Last updated: 13 May 2026
          </p>

          <div className="mt-8 space-y-7 text-sm leading-6 text-stone-600">
            <section>
              <h2 className="text-xl font-bold text-stone-950">About These Terms</h2>
              <p className="mt-2">
                These terms apply when you browse or buy from {shopConfig.name}.
                By placing an order, you confirm that the order details you
                provide are accurate and that you agree to these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">Products</h2>
              <p className="mt-2">
                Products are Pokémon card singles and related collection items
                from personal or small-stock inventory. Card quantities are
                limited and availability may change. We aim to show accurate
                card names, set names, finishes, quantities, and prices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">Condition</h2>
              <p className="mt-2">
                Cards are listed with the condition shown on the product page.
                Minor differences in centering, print quality, surface marks, or
                packaging may exist, especially for trading cards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">Orders And Payment</h2>
              <p className="mt-2">
                Orders are only confirmed after Paystack reports a successful
                payment and the website verifies it server-side. If stock is no
                longer available at checkout, the order may be blocked or
                adjusted before payment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">Delivery</h2>
              <p className="mt-2">
                Delivery options are currently PUDO locker to locker at R50 or
                PUDO delivery to your address at R80. Delivery timing depends on
                PUDO, customer location, and the details supplied at checkout.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">
                Cancellations, Returns, And Refunds
              </h2>
              <p className="mt-2">
                If there is a problem with an order, contact us as soon as
                possible. Returns and refunds are handled in line with South
                African consumer protection requirements and the facts of the
                order, including whether the item was incorrect, damaged, or not
                as described.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">Not Affiliated</h2>
              <p className="mt-2">
                {shopConfig.name} is an independent card store and is not
                affiliated with, sponsored by, or endorsed by The Pokémon
                Company, Nintendo, Game Freak, Creatures, or any related brand
                owner.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">Contact</h2>
              <p className="mt-2">
                For order questions, use the customer details provided at
                checkout or the contact channel published on this website.
              </p>
            </section>
          </div>

          <Link
            href="/cards?category=singles"
            className="vault-button mt-8 inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold"
          >
            Back to shop
          </Link>
        </article>
      </main>
    </div>
  );
}
