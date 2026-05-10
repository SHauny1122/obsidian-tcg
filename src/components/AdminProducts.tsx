"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatZar } from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { productCategories } from "@/data/products";
import {
  buildLocalProduct,
  getLocalProducts,
  getProductImage,
  ProductFormValues,
  productToFormValues,
  saveLocalProducts,
} from "@/lib/local-products";

const initialFormValues: ProductFormValues = {
  name: "",
  setName: "",
  cardNumber: "",
  category: "singles",
  condition: "Near mint",
  quantity: "1",
  askingPriceZar: "",
  status: "available",
  image: "",
  uploadedImage: "",
  description: "",
};

export function AdminProducts({ mockProducts }: { mockProducts: Product[] }) {
  const [formValues, setFormValues] =
    useState<ProductFormValues>(initialFormValues);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

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

  function updateField(field: keyof ProductFormValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function resetForm() {
    setFormValues(initialFormValues);
    setEditingProductId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const existingProducts = [...localProducts, ...mockProducts];
    const product = buildLocalProduct(
      formValues,
      existingProducts,
      editingProductId ?? undefined,
    );
    const updatedProducts = editingProductId
      ? localProducts.map((localProduct) =>
          localProduct.id === editingProductId ? product : localProduct,
        )
      : [product, ...localProducts];

    saveLocalProducts(updatedProducts);
    setLocalProducts(updatedProducts);
    resetForm();
    setSuccessMessage(
      editingProductId
        ? `${product.name} was updated.`
        : `${product.name} was added to local browser storage.`,
    );
  }

  function handleDelete(productId: string) {
    const updatedProducts = localProducts.filter(
      (product) => product.id !== productId,
    );

    saveLocalProducts(updatedProducts);
    setLocalProducts(updatedProducts);
    if (editingProductId === productId) {
      resetForm();
    }
    setSuccessMessage("Local product deleted.");
  }

  function handleEdit(product: Product) {
    setFormValues(productToFormValues(product));
    setEditingProductId(product.id);
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        updateField("uploadedImage", reader.result);
      }
    });
    reader.readAsDataURL(file);
  }

  const imagePreview = formValues.uploadedImage || formValues.image;
  const isEditing = editingProductId !== null;

  return (
    <div className="space-y-8">
      <section className="vault-panel rounded-lg p-5 sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Vault admin
          </p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">
            {isEditing ? "Edit card/product" : "Add card/product"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Products saved here live in this browser only. Prices are manual
            seller asking prices.
          </p>
        </div>

        {successMessage ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {successMessage}
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Name <span className="text-red-700">*</span>
            <input
              required
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Pikachu bulk lot"
              className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Set name <span className="text-red-700">*</span>
            <input
              required
              value={formValues.setName}
              onChange={(event) => updateField("setName", event.target.value)}
              placeholder="Scarlet & Violet, assorted modern sets, etc."
              className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Category <span className="text-red-700">*</span>
            <select
              required
              value={formValues.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              {productCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Card number
              <input
                value={formValues.cardNumber}
                onChange={(event) =>
                  updateField("cardNumber", event.target.value)
                }
                placeholder="Optional, e.g. 025/198"
                className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Condition <span className="text-red-700">*</span>
              <input
                required
                value={formValues.condition}
                onChange={(event) =>
                  updateField("condition", event.target.value)
                }
                placeholder="Near mint, lightly played, played"
                className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Quantity <span className="text-red-700">*</span>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]+"
                value={formValues.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                placeholder="1"
                className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Price in ZAR <span className="text-red-700">*</span>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]+"
                value={formValues.askingPriceZar}
                onChange={(event) =>
                  updateField("askingPriceZar", event.target.value)
                }
                placeholder="120"
                className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Status
              <select
                value={formValues.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="available">available</option>
                <option value="sold">sold</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Image URL
            <input
              type="url"
              value={formValues.image}
              onChange={(event) => updateField("image", event.target.value)}
              placeholder="https://example.com/card-photo.jpg"
              className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Upload image from device
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImageUpload(event.target.files?.[0])}
              className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-stone-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </label>

          {imagePreview ? (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-sm font-medium text-stone-800">
                Image preview
              </p>
              <div className="mt-3 aspect-[4/5] max-w-56 overflow-hidden rounded-md border border-stone-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                />
              </div>
              {formValues.uploadedImage ? (
                <button
                  type="button"
                  onClick={() => updateField("uploadedImage", "")}
                  className="mt-3 text-sm font-semibold text-red-700 hover:text-red-800"
                >
                  Remove uploaded image
                </button>
              ) : null}
            </div>
          ) : null}

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Description <span className="text-red-700">*</span>
            <textarea
              required
              rows={4}
              value={formValues.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Short seller note about the card, bundle, or condition."
              className="rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="vault-button min-h-12 rounded-md px-5 py-3 text-sm font-semibold shadow-sm sm:w-fit"
            >
              {isEditing ? "Update product" : "Add product"}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="vault-button-secondary min-h-12 rounded-md px-5 py-3 text-sm font-semibold sm:w-fit"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="vault-panel rounded-lg p-5 sm:p-6">
        <h2 className="text-2xl font-bold text-stone-950">Manage Products</h2>
        <p className="mt-2 text-sm text-stone-600">
          These are the products added in this browser.
        </p>

        {localProducts.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
            No local products added yet.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {localProducts.map((product) => (
              <article
                key={product.id}
                className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-stone-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getProductImage(product)}
                      alt={`${product.name} thumbnail`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-950">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">
                      {product.setName} · {product.category} · {product.condition} ·{" "}
                      {formatZar(product.askingPriceZar)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase text-stone-500">
                      {product.status}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="vault-button-secondary min-h-11 rounded-md px-4 py-2 text-sm font-semibold sm:w-fit"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="min-h-11 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 sm:w-fit"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
