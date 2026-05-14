"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import {
  productCategories,
  type Product,
  type ProductCategory,
  type ProductStatus,
} from "@/data/products";

type SortOption = "newest" | "price-asc" | "price-desc";
type StatusFilter = "all" | ProductStatus;
type CategoryFilter = "all" | ProductCategory;
type SetSummary = {
  name: string;
  image: string;
  listingCount: number;
  totalQuantity: number;
};

const knownSetImages: Record<string, string> = {
  "Mega Evolution": "/images/sets/mega-evolution.webp",
  "Phantasmal Flames": "/images/sets/phantasmal-flames.webp",
  "Prismatic Evolutions": "/images/sets/prismatic-evolutions.webp",
};

function fallbackSetImage(setName: string) {
  const hue = Array.from(setName).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return `/images/card-${["blue", "green", "purple", "red", "yellow"][hue % 5]}.svg`;
}

function getCardsHref(category: CategoryFilter, setName?: string) {
  const params = new URLSearchParams();

  if (category === "all") {
    params.delete("category");
  } else {
    params.set("category", category);
  }

  if (setName) {
    params.set("set", setName);
  } else {
    params.delete("set");
  }

  const queryString = params.toString();
  return queryString ? `/cards?${queryString}` : "/cards";
}

function updateCardsUrl(category: CategoryFilter, setName?: string) {
  window.history.pushState(null, "", getCardsHref(category, setName));
}

export function ProductGrid({
  initialProducts,
  featuredOnly = false,
  initialCategory = "all",
  initialSet,
}: {
  initialProducts: Product[];
  featuredOnly?: boolean;
  initialCategory?: CategoryFilter;
  initialSet?: string;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [selectedSet, setSelectedSet] = useState(initialSet ?? "");
  const [condition, setCondition] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      const response = await fetch("/api/products");
      const data = await response.json();

      if (isMounted && response.ok && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    }

    loadProducts();
    window.addEventListener("products-updated", loadProducts);

    return () => {
      isMounted = false;
      window.removeEventListener("products-updated", loadProducts);
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const filteredProducts = products
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
        selectedSet ? product.setName === selectedSet : true,
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

    return featuredOnly ? filteredProducts.slice(0, 4) : filteredProducts;
  }, [
    category,
    condition,
    featuredOnly,
    products,
    searchTerm,
    selectedSet,
    sort,
    status,
  ]);

  const setSummaries = useMemo<SetSummary[]>(() => {
    const summaries = new Map<string, SetSummary>();

    for (const product of products) {
      if (product.category !== "singles") {
        continue;
      }

      const currentSummary = summaries.get(product.setName) ?? {
        name: product.setName,
        image: knownSetImages[product.setName] ?? fallbackSetImage(product.setName),
        listingCount: 0,
        totalQuantity: 0,
      };

      currentSummary.listingCount += 1;
      currentSummary.totalQuantity += product.quantity;
      summaries.set(product.setName, currentSummary);
    }

    return Array.from(summaries.values()).sort((firstSet, secondSet) =>
      firstSet.name.localeCompare(secondSet.name),
    );
  }, [products]);

  const conditions = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.condition)),
      ).sort(),
    [products],
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

  const shouldShowSetPicker =
    !featuredOnly && category === "singles" && !selectedSet;

  function handleCategoryChange(nextCategory: CategoryFilter) {
    setCategory(nextCategory);
    setSelectedSet("");
    updateCardsUrl(nextCategory);
  }

  if (visibleProducts.length === 0 && featuredOnly) {
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
                  handleCategoryChange(event.target.value as CategoryFilter)
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

      {shouldShowSetPicker ? (
        <section className="mt-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {setSummaries.map((setSummary) => (
              <Link
                key={setSummary.name}
                href={getCardsHref("singles", setSummary.name)}
                className="vault-panel group overflow-hidden rounded-lg text-left transition hover:border-cyan-300/70"
              >
                <div className="flex min-h-48 items-center justify-center border-b border-stone-200 bg-black/25 p-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setSummary.image}
                    alt={`${setSummary.name} set logo`}
                    className="max-h-28 w-full object-contain transition duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-end justify-between gap-4 p-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-950">
                      {setSummary.name}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {setSummary.listingCount} listings
                    </p>
                  </div>
                  <span className="vault-badge-gold rounded-full px-3 py-1 text-sm font-semibold">
                    {setSummary.totalQuantity} cards
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : visibleProducts.length === 0 ? (
        emptyState
      ) : (
        <>
          {!featuredOnly && category === "singles" && selectedSet ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {selectedSet}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  Showing singles from this set.
                </p>
              </div>
              <Link
                href={getCardsHref("singles")}
                className="vault-button-secondary rounded-md px-4 py-2 text-sm font-semibold"
              >
                Back to sets
              </Link>
            </div>
          ) : null}

          <div
            className={`mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 ${
              featuredOnly ? "lg:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
