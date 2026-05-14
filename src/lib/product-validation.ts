import type {
  ProductCategory,
  ProductFinish,
  ProductStatus,
} from "@/data/products";
import type { ProductInput } from "@/lib/products-repository";

const allowedCategories: ProductCategory[] = [
  "singles",
  "bundles",
  "bulk",
  "accessories",
];

const allowedStatuses: ProductStatus[] = ["available", "sold"];
const allowedFinishes: ProductFinish[] = [
  "normal",
  "holofoil",
  "reverse-holofoil",
];

type ProductPayload = Partial<Record<keyof ProductInput, unknown>>;

export function parseProductPayload(payload: ProductPayload): ProductInput {
  const name = String(payload.name ?? "").trim();
  const setName = String(payload.setName ?? "").trim();
  const condition = String(payload.condition ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const category = payload.category;
  const finish = payload.finish ?? "normal";
  const status = payload.status;
  const quantity = Number(payload.quantity);
  const askingPriceZar = Number(payload.askingPriceZar);

  if (!name || !setName || !condition || !description) {
    throw new Error("Name, set name, condition, and description are required.");
  }

  if (!allowedCategories.includes(category as ProductCategory)) {
    throw new Error("Category is invalid.");
  }

  if (!allowedStatuses.includes(status as ProductStatus)) {
    throw new Error("Status is invalid.");
  }

  if (!allowedFinishes.includes(finish as ProductFinish)) {
    throw new Error("Finish is invalid.");
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Quantity must be a whole number of zero or more.");
  }

  if (!Number.isFinite(askingPriceZar) || askingPriceZar <= 0) {
    throw new Error("Price must be greater than zero.");
  }

  return {
    name,
    setName,
    cardNumber: String(payload.cardNumber ?? "").trim() || undefined,
    category: category as ProductCategory,
    finish: finish as ProductFinish,
    condition,
    quantity,
    askingPriceZar,
    status: status as ProductStatus,
    imageUrl: String(payload.imageUrl ?? "").trim() || undefined,
    imagePath: String(payload.imagePath ?? "").trim() || undefined,
    description,
  };
}
