import type { Product, ProductCategory, ProductStatus } from "@/data/products";

export const localProductsStorageKey = "pokemon-market-local-products";

export type ProductFormValues = {
  name: string;
  setName: string;
  cardNumber: string;
  category: ProductCategory;
  condition: string;
  quantity: string;
  askingPriceZar: string;
  status: ProductStatus;
  image: string;
  uploadedImage: string;
  description: string;
};

export function createSlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `product-${Date.now()}`;
}

export function getProductImage(product: Product) {
  return product.uploadedImage || product.imageUrl || product.image;
}

export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedProducts = window.localStorage.getItem(localProductsStorageKey);
    if (!storedProducts) {
      return [];
    }

    const products = JSON.parse(storedProducts);
    if (!Array.isArray(products)) {
      return [];
    }

    return products.map((product) => ({
      ...product,
      category: product.category ?? "singles",
      image: product.uploadedImage || product.imageUrl || product.image,
    }));
  } catch {
    return [];
  }
}

export function saveLocalProducts(products: Product[]) {
  window.localStorage.setItem(localProductsStorageKey, JSON.stringify(products));
  window.dispatchEvent(new Event("local-products-updated"));
}

export function buildLocalProduct(
  values: ProductFormValues,
  existingProducts: Product[],
  productId?: string,
): Product {
  const baseSlug = createSlug(values.name);
  const existingSlugs = new Set(
    existingProducts
      .filter((product) => product.id !== productId)
      .map((product) => product.slug),
  );
  let slug = baseSlug;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
  }

  const imageUrl = values.image.trim();
  const uploadedImage = values.uploadedImage;
  const image = uploadedImage || imageUrl || "/images/card-gray.svg";

  return {
    id: productId ?? `local-${Date.now()}`,
    slug,
    name: values.name.trim(),
    setName: values.setName.trim(),
    cardNumber: values.cardNumber.trim() || undefined,
    category: values.category,
    condition: values.condition.trim(),
    quantity: Number(values.quantity),
    askingPriceZar: Number(values.askingPriceZar),
    status: values.status,
    image,
    imageUrl: imageUrl || undefined,
    uploadedImage: uploadedImage || undefined,
    description: values.description.trim(),
  };
}

export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    setName: product.setName,
    cardNumber: product.cardNumber ?? "",
    category: product.category ?? "singles",
    condition: product.condition,
    quantity: String(product.quantity),
    askingPriceZar: String(product.askingPriceZar),
    status: product.status,
    image: product.imageUrl ?? (product.uploadedImage ? "" : product.image),
    uploadedImage: product.uploadedImage ?? "",
    description: product.description,
  };
}
