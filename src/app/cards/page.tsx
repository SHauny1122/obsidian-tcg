import { ProductGrid } from "@/components/ProductGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { products, type ProductCategory } from "@/data/products";

const allowedCategories: ProductCategory[] = [
  "singles",
  "bundles",
  "bulk",
  "accessories",
];

export default async function CardsPage(props: PageProps<"/cards">) {
  const searchParams = await props.searchParams;
  const categoryParam = searchParams.category;
  const initialCategory =
    typeof categoryParam === "string" &&
    allowedCategories.includes(categoryParam as ProductCategory)
      ? (categoryParam as ProductCategory)
      : "all";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Archive inventory
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
            Available cards and products
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Browse the cards, bundles, bulk lots, and extras currently listed
            from my personal collection.
          </p>
        </div>

        <ProductGrid
          key={initialCategory}
          mockProducts={products}
          initialCategory={initialCategory}
        />
      </main>
    </div>
  );
}
