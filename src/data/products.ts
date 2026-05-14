export type ProductStatus = "available" | "sold";
export type ProductCategory = "singles" | "bundles" | "bulk" | "accessories";
export type ProductFinish = "normal" | "holofoil" | "reverse-holofoil";

export const productFinishes: Array<{
  value: ProductFinish;
  label: string;
}> = [
  {
    value: "normal",
    label: "Normal",
  },
  {
    value: "holofoil",
    label: "Holofoil",
  },
  {
    value: "reverse-holofoil",
    label: "Reverse Holofoil",
  },
];

export const productCategories: Array<{
  value: ProductCategory;
  label: string;
  description: string;
}> = [
  {
    value: "singles",
    label: "Singles",
    description: "Individual cards from my personal collection.",
  },
  {
    value: "bundles",
    label: "Bundles",
    description: "Small themed groups and mixed card sets.",
  },
  {
    value: "bulk",
    label: "Bulk lots",
    description: "Larger lots for binders, sorting, or play.",
  },
  {
    value: "accessories",
    label: "Accessories / sleeves / extras",
    description: "Sleeves, extras, and related collection items.",
  },
];

export type Product = {
  id: string;
  slug: string;
  name: string;
  setName: string;
  cardNumber?: string;
  category: ProductCategory;
  finish: ProductFinish;
  condition: string;
  quantity: number;
  askingPriceZar: number;
  status: ProductStatus;
  image: string;
  imageUrl?: string;
  imagePath?: string;
  uploadedImage?: string;
  description: string;
};

export const products: Product[] = [];

export function getAvailableProducts() {
  return products.filter((product) => product.status === "available");
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
