import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { shopConfig } from "@/config/shop";

export const metadata = {
  title: `Privacy Policy | ${shopConfig.name}`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="vault-panel rounded-lg p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold text-stone-950">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Last updated: 13 May 2026
          </p>

          <div className="mt-8 space-y-7 text-sm leading-6 text-stone-600">
            <section>
              <h2 className="text-xl font-bold text-stone-950">Who We Are</h2>
              <p className="mt-2">
                {shopConfig.name} is a South African online store for Pokémon
                card singles and related collection items. This policy explains
                how we collect and use personal information when you browse,
                place an order, or contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">
                Information We Collect
              </h2>
              <p className="mt-2">
                We collect the information needed to process your order,
                including your name, email address, phone number, delivery
                method, delivery address, cart contents, payment reference, and
                order status. We may also collect basic technical information
                needed to run and protect the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">
                How We Use Information
              </h2>
              <p className="mt-2">
                We use personal information to process payments, confirm and
                fulfil orders, manage stock, respond to customer questions,
                prevent fraud, keep business records, and comply with South
                African legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">
                Payments And Service Providers
              </h2>
              <p className="mt-2">
                Payments are processed by Paystack. We do not store your full
                card details on this website. Paystack may process payment
                information under its own terms and privacy practices. We also
                use Supabase to store product, order, and inventory records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">
                POPIA Rights
              </h2>
              <p className="mt-2">
                Under South Africa&apos;s Protection of Personal Information Act
                (POPIA), you may request access to your personal information,
                ask for correction or deletion where legally allowed, object to
                certain processing, and lodge a complaint with the Information
                Regulator South Africa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">
                Security And Retention
              </h2>
              <p className="mt-2">
                We use reasonable technical and organisational safeguards to
                protect personal information. We keep order information for as
                long as needed for order support, accounting, legal compliance,
                and fraud prevention.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-950">Contact</h2>
              <p className="mt-2">
                For privacy questions or customer support, contact us through
                the order details you used at checkout or the contact channel
                published on this website.
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
