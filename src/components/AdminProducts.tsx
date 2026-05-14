"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatZar } from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { productCategories, productFinishes } from "@/data/products";
import {
  getProductImage,
  ProductFormValues,
  productToFormValues,
} from "@/lib/local-products";

const initialFormValues: ProductFormValues = {
  name: "",
  setName: "",
  cardNumber: "",
  category: "singles",
  finish: "normal",
  condition: "Near mint",
  quantity: "1",
  askingPriceZar: "",
  status: "available",
  image: "",
  imagePath: "",
  description: "",
};

const adminSessionPasswordKey = "pokemon-market-admin-password";
const newSetValue = "__new_set__";

function adminPassword() {
  return (
    window.sessionStorage.getItem(adminSessionPasswordKey) ??
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ??
    "vault-dev"
  );
}

async function compressImageForUpload(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read image."));
      image.src = objectUrl;
    });

    const maxDimension = 1400;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );

    if (!blob) {
      return file;
    }

    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function AdminProducts({ initialProducts }: { initialProducts: Product[] }) {
  const [formValues, setFormValues] =
    useState<ProductFormValues>(initialFormValues);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    void loadProducts();
  }, []);

  async function loadProducts() {
    const response = await fetch("/api/admin/products", {
      headers: { "x-admin-password": adminPassword() },
    });
    const data = await response.json();

    if (response.ok && Array.isArray(data.products)) {
      setProducts(data.products);
    } else if (data.error) {
      setErrorMessage(data.error);
    }
  }

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

  function productPayload() {
    return {
      name: formValues.name,
      setName: formValues.setName,
      cardNumber: formValues.cardNumber,
      category: formValues.category,
      finish: formValues.finish,
      condition: formValues.condition,
      quantity: Number(formValues.quantity),
      askingPriceZar: Number(formValues.askingPriceZar),
      status: formValues.status,
      imageUrl: formValues.image,
      imagePath: formValues.imagePath,
      description: formValues.description,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        editingProductId
          ? `/api/admin/products/${editingProductId}`
          : "/api/admin/products",
        {
          method: editingProductId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": adminPassword(),
          },
          body: JSON.stringify(productPayload()),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.product) {
        throw new Error(data.error ?? "Could not save product.");
      }

      await loadProducts();
      window.dispatchEvent(new Event("products-updated"));
      resetForm();
      setSuccessMessage(
        editingProductId
          ? `${data.product.name} was updated.`
          : `${data.product.name} was added to the shared store.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword() },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete product.");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      );
      window.dispatchEvent(new Event("products-updated"));
      if (editingProductId === productId) {
        resetForm();
      }
      setSuccessMessage("Product deleted from the shared store.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete product.",
      );
    }
  }

  function handleEdit(product: Product) {
    setFormValues(productToFormValues(product));
    setEditingProductId(product.id);
    setSuccessMessage("");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const optimizedFile = await compressImageForUpload(file);
      const formData = new FormData();

      formData.append("file", optimizedFile);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        headers: { "x-admin-password": adminPassword() },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.publicUrl) {
        throw new Error(data.error ?? "Could not upload image.");
      }

      updateField("image", data.publicUrl);
      updateField("imagePath", data.path ?? "");
      setSuccessMessage("Image uploaded to Supabase Storage.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  const imagePreview = formValues.image;
  const isEditing = editingProductId !== null;
  const availableSetNames = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.setName.trim())
            .filter((setName) => setName.length > 0),
        ),
      ).sort((firstSet, secondSet) => firstSet.localeCompare(secondSet)),
    [products],
  );
  const selectedSetOption = availableSetNames.includes(formValues.setName)
    ? formValues.setName
    : newSetValue;

  function handleSetOptionChange(value: string) {
    if (value === newSetValue) {
      updateField("setName", "");
      return;
    }

    updateField("setName", value);
  }

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
            Products saved here now go into the shared Supabase database.
          </p>
        </div>

        {successMessage ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {successMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="mt-5 rounded-md border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {errorMessage}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Existing set
              <select
                value={selectedSetOption}
                onChange={(event) => handleSetOptionChange(event.target.value)}
                className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                {availableSetNames.map((setName) => (
                  <option key={setName} value={setName}>
                    {setName}
                  </option>
                ))}
                <option value={newSetValue}>Add a new set...</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Set name <span className="text-red-700">*</span>
              <input
                required
                value={formValues.setName}
                onChange={(event) => updateField("setName", event.target.value)}
                placeholder="Mega Evolution, Phantasmal Flames, etc."
                className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

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

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Finish <span className="text-red-700">*</span>
            <select
              required
              value={formValues.finish}
              onChange={(event) => updateField("finish", event.target.value)}
              className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              {productFinishes.map((finish) => (
                <option key={finish.value} value={finish.value}>
                  {finish.label}
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
              onChange={(event) => {
                updateField("image", event.target.value);
                updateField("imagePath", "");
              }}
              placeholder="https://example.com/card-photo.jpg"
              className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Upload image from device
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
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
              <button
                type="button"
                onClick={() => {
                  updateField("image", "");
                  updateField("imagePath", "");
                }}
                className="mt-3 text-sm font-semibold text-red-700 hover:text-red-800"
              >
                Remove image
              </button>
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
              disabled={isSaving || isUploading}
              className="vault-button min-h-12 rounded-md px-5 py-3 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
            >
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Update product"
                  : "Add product"}
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
          These are the products currently saved in Supabase.
        </p>

        {products.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
            No shared products added yet.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {products.map((product) => (
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
                    {(() => {
                      const finishLabel =
                        productFinishes.find(
                          (finish) => finish.value === product.finish,
                        )?.label ?? "Normal";

                      return (
                        <>
                          <h3 className="font-semibold text-stone-950">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-sm text-stone-600">
                            {product.setName} · {product.category} ·{" "}
                            {product.condition} · {finishLabel} ·{" "}
                            {formatZar(product.askingPriceZar)}
                          </p>
                        </>
                      );
                    })()}
                    <p className="mt-1 text-xs font-semibold uppercase text-stone-500">
                      {product.status} · Qty {product.quantity}
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
