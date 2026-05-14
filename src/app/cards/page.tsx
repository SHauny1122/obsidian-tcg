import { ProductGrid } from "@/components/ProductGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { type ProductCategory } from "@/data/products";
import { listProducts } from "@/lib/products-repository";

const allowedCategories: ProductCategory[] = [
  "singles",
  "bundles",
  "bulk",
  "accessories",
];

export const dynamic = "force-dynamic";

export default async function CardsPage(props: PageProps<"/cards">) {
  const searchParams = await props.searchParams;
  const products = await listProducts();
  const categoryParam = searchParams.category;
  const setParam = searchParams.set;
  const initialCategory =
    typeof categoryParam === "string" &&
    allowedCategories.includes(categoryParam as ProductCategory)
      ? (categoryParam as ProductCategory)
      : "singles";
  const initialSet = typeof setParam === "string" ? setParam : undefined;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Archive inventory
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
            Available cards and products
          </h1>
        </div>

        <ProductGrid
          key={`${initialCategory}-${initialSet ?? "all-sets"}`}
          initialProducts={products}
          initialCategory={initialCategory}
          initialSet={initialSet}
        />
      </main>
    </div>
  );
}
