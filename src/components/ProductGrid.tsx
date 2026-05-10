"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import {
  productCategories,
  type Product,
  type ProductCategory,
  type ProductStatus,
} from "@/data/products";
import { getLocalProducts } from "@/lib/local-products";

type SortOption = "newest" | "price-asc" | "price-desc";
type StatusFilter = "all" | ProductStatus;
type CategoryFilter = "all" | ProductCategory;

export function ProductGrid({
  mockProducts,
  featuredOnly = false,
  initialCategory = "all",
}: {
  mockProducts: Product[];
  featuredOnly?: boolean;
  initialCategory?: CategoryFilter;
}) {
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [condition, setCondition] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    const loadProducts = () => setLocalProducts(getLocalProducts());

    loadProducts();
    window.addEventListener("storage", loadProducts);
    window.addEventListener("local-products-updated", loadProducts);

    return () => {
      window.removeEventListener("storage", loadProducts);
      window.removeEventListener("local-products-updated", loadProducts);
    };
  }, []);

  const products = useMemo(() => {
    const combinedProducts = [...localProducts, ...mockProducts];
    const visibleProducts = combinedProducts
      .filter((product) =>
        featuredOnly ? product.status === "available" : true,
      )
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      )
      .filter((product) =>
        category === "all" ? true : product.category === category,
      )
      .filter((product) =>
        condition === "all" ? true : product.condition === condition,
      )
      .filter((product) =>
        status === "all" ? true : product.status === status,
      )
      .sort((firstProduct, secondProduct) => {
        if (sort === "price-asc") {
          return firstProduct.askingPriceZar - secondProduct.askingPriceZar;
        }

        if (sort === "price-desc") {
          return secondProduct.askingPriceZar - firstProduct.askingPriceZar;
        }

        return 0;
      });

    return featuredOnly ? visibleProducts.slice(0, 4) : visibleProducts;
  }, [
    category,
    condition,
    featuredOnly,
    localProducts,
    mockProducts,
    searchTerm,
    sort,
    status,
  ]);

  const conditions = useMemo(
    () =>
      Array.from(
        new Set([...localProducts, ...mockProducts].map((product) => product.condition)),
      ).sort(),
    [localProducts, mockProducts],
  );

  const emptyState = (
    <div className="vault-panel mt-6 rounded-lg border-dashed p-8 text-center">
      <h3 className="text-base font-semibold text-stone-950">
        No cards listed yet. New stock coming soon.
      </h3>
      <p className="mt-2 text-sm text-stone-600">
        {featuredOnly
          ? "Check back soon or browse the categories below."
          : "Try changing the filters, or check back soon for new listings."}
      </p>
    </div>
  );

  if (products.length === 0 && featuredOnly) {
    return emptyState;
  }

  return (
    <>
      {!featuredOnly ? (
        <section className="vault-panel mt-6 rounded-lg p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-stone-800">
              Search
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by card name"
                className="min-h-11 w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-stone-800">
              Category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as CategoryFilter)
                }
                className="min-h-11 w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All categories</option>
                {productCategories.map((categoryOption) => (
                  <option key={categoryOption.value} value={categoryOption.value}>
                    {categoryOption.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-stone-800">
              Condition
              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="min-h-11 w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All conditions</option>
                {conditions.map((conditionOption) => (
                  <option key={conditionOption} value={conditionOption}>
                    {conditionOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-stone-800">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
                className="min-h-11 w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </label>
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-stone-800">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="min-h-11 w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price low-high</option>
                <option value="price-desc">Price high-low</option>
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {products.length === 0 ? (
        emptyState
      ) : (
        <div
          className={`mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 ${
            featuredOnly ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
