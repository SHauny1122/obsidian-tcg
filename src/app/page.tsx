import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { shopConfig } from "@/config/shop";
import { productCategories } from "@/data/products";
import { listProducts } from "@/lib/products-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listProducts();
  const homepageCategories = productCategories.filter((category) =>
    ["singles", "accessories"].includes(category.value),
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
          <div className="mx-auto flex max-w-6xl justify-center px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="mb-8 flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shopConfig.logoPath}
                  alt={`${shopConfig.name} logo`}
                  className="h-24 w-24 rounded-full object-contain shadow-[0_0_44px_rgba(234,179,8,0.22)] sm:h-28 sm:w-28"
                />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
                  {shopConfig.name}
                </p>
              </div>
              <h1 className="mt-4 text-center text-4xl font-bold tracking-tight text-stone-950 sm:text-6xl">
                Pokémon cards
                <br />
                for Africa
              </h1>
              <div className="mt-7 flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
                <Link
                  href="/cards"
                  className="vault-button inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold shadow-sm"
                >
                  Browse cards
                </Link>
                <Link
                  href="/cart"
                  className="vault-button-secondary inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold"
                >
                  View cart
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-950">
              Browse by category
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Stock is small and added manually as cards become available.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homepageCategories.map((category) => (
              <Link
                key={category.value}
                href={`/cards?category=${category.value}`}
                className="vault-panel rounded-lg p-5 transition hover:border-cyan-300/50 hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-stone-950">
                  {category.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-950">
              Latest listings
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              No placeholder stock is shown here. Only cards added through admin
              appear in the shop.
            </p>
          </div>
          <ProductGrid initialProducts={products} featuredOnly />
        </section>
      </main>
    </div>
  );
}
