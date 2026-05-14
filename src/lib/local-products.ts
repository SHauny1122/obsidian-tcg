import type {
  Product,
  ProductCategory,
  ProductFinish,
  ProductStatus,
} from "@/data/products";

export type ProductFormValues = {
  name: string;
  setName: string;
  cardNumber: string;
  category: ProductCategory;
  finish: ProductFinish;
  condition: string;
  quantity: string;
  askingPriceZar: string;
  status: ProductStatus;
  image: string;
  imagePath: string;
  description: string;
};

export function getProductImage(product: Product) {
  return product.imageUrl || product.uploadedImage || product.image;
}

export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    setName: product.setName,
    cardNumber: product.cardNumber ?? "",
    category: product.category ?? "singles",
    finish: product.finish ?? "normal",
    condition: product.condition,
    quantity: String(product.quantity),
    askingPriceZar: String(product.askingPriceZar),
    status: product.status,
    image: product.imageUrl ?? "",
    imagePath: product.imagePath ?? "",
    description: product.description,
  };
}
