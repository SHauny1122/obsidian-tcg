"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatZar } from "@/components/ProductCard";
import { shopConfig } from "@/config/shop";
import type { Product } from "@/data/products";
import { CartItem, getCartItems, getCartSubtotal } from "@/lib/cart";
import { getLocalProducts } from "@/lib/local-products";

const deliveryMethods = ["PUDO", "PostNet", "Courier", "Local pickup"];

type BuyerDetails = {
  fullName: string;
  email: string;
  phone: string;
  deliveryMethod: string;
  deliveryAddress: string;
};

const initialBuyerDetails: BuyerDetails = {
  fullName: "",
  email: "",
  phone: "",
  deliveryMethod: deliveryMethods[0],
  deliveryAddress: "",
};

export function CheckoutView({ mockProducts }: { mockProducts: Product[] }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [buyerDetails, setBuyerDetails] =
    useState<BuyerDetails>(initialBuyerDetails);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const loadCart = () => setCartItems(getCartItems());
    const loadProducts = () => setLocalProducts(getLocalProducts());

    loadCart();
    loadProducts();
    window.addEventListener("storage", loadCart);
    window.addEventListener("cart-updated", loadCart);
    window.addEventListener("local-products-updated", loadProducts);

    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("cart-updated", loadCart);
      window.removeEventListener("local-products-updated", loadProducts);
    };
  }, []);

  const subtotal = useMemo(() => getCartSubtotal(cartItems), [cartItems]);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const needsDeliveryAddress = buyerDetails.deliveryMethod !== "Local pickup";

  const productBySlug = useMemo(() => {
    return new Map(
      [...localProducts, ...mockProducts].map((product) => [
        product.slug,
        product,
      ]),
    );
  }, [localProducts, mockProducts]);

  const cartWarnings = useMemo(() => {
    return cartItems.flatMap((item) => {
      const product = productBySlug.get(item.slug);

      if (!product) {
        return [`${item.name} is no longer available.`];
      }

      if (product.status === "sold") {
        return [`${item.name} is now sold and must be removed from cart.`];
      }

      if (item.quantity < 1) {
        return [`${item.name} has an invalid quantity.`];
      }

      if (item.quantity > product.quantity) {
        return [
          `${item.name} only has ${product.quantity} available. Update the cart quantity.`,
        ];
      }

      return [];
    });
  }, [cartItems, productBySlug]);

  const errors = useMemo(() => {
    const nextErrors: Partial<Record<keyof BuyerDetails, string>> = {};

    if (!buyerDetails.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!buyerDetails.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerDetails.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!buyerDetails.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (!buyerDetails.deliveryMethod) {
      nextErrors.deliveryMethod = "Delivery method is required.";
    }

    if (needsDeliveryAddress && !buyerDetails.deliveryAddress.trim()) {
      nextErrors.deliveryAddress =
        "Delivery address is required for this delivery method.";
    }

    return nextErrors;
  }, [buyerDetails, needsDeliveryAddress]);

  const isFormValid = Object.keys(errors).length === 0;
  const isCartValid = cartItems.length > 0 && cartWarnings.length === 0;
  const canContinueToPayment = isFormValid && isCartValid;

  function updateBuyerDetails(field: keyof BuyerDetails, value: string) {
    setBuyerDetails((currentDetails) => ({
      ...currentDetails,
      [field]: value,
      ...(field === "deliveryMethod" && value === "Local pickup"
        ? { deliveryAddress: "" }
        : {}),
    }));
  }

  function fieldError(field: keyof BuyerDetails) {
    return errors[field];
  }

  async function handlePayWithPaystack() {
    if (!canContinueToPayment) {
      return;
    }

    setIsInitializingPayment(true);
    setPaymentError("");

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerDetails,
          cartItems,
          subtotal,
          deliveryFee,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.authorizationUrl) {
        throw new Error(data.error ?? "Could not start Paystack checkout.");
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Could not start Paystack checkout.",
      );
      setIsInitializingPayment(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <section className="vault-panel rounded-lg border-dashed p-8 text-center">
        <h1 className="text-3xl font-bold text-stone-950">
          No items to checkout
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Add cards to your cart before starting checkout.
        </p>
        <Link
          href="/cards"
          className="vault-button mt-6 inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold shadow-sm"
        >
          Browse cards
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <section className="vault-panel rounded-lg p-5 sm:p-6">
        <h2 className="text-2xl font-bold text-stone-950">Buyer details</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Payment will happen on the website through Paystack later. Orders are
          not saved yet.
        </p>

        {cartWarnings.length > 0 ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Cart needs attention</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {cartWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <Link
              href="/cart"
              className="mt-3 inline-flex font-semibold underline underline-offset-2"
            >
              Review cart
            </Link>
          </div>
        ) : null}

        <form className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Full name
            <input
              required
              value={buyerDetails.fullName}
              onChange={(event) =>
                updateBuyerDetails("fullName", event.target.value)
              }
              placeholder="Your full name"
              className={`min-h-11 rounded-md border px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 ${
                fieldError("fullName") ? "border-red-400" : "border-stone-300"
              }`}
            />
            {fieldError("fullName") ? (
              <span className="text-sm text-red-700">
                {fieldError("fullName")}
              </span>
            ) : null}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Email
              <input
                required
                inputMode="email"
                value={buyerDetails.email}
                onChange={(event) =>
                  updateBuyerDetails("email", event.target.value)
                }
                placeholder="you@example.com"
                className={`min-h-11 rounded-md border px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 ${
                  fieldError("email") ? "border-red-400" : "border-stone-300"
                }`}
              />
              {fieldError("email") ? (
                <span className="text-sm text-red-700">
                  {fieldError("email")}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Phone number
              <input
                required
                inputMode="tel"
                value={buyerDetails.phone}
                onChange={(event) =>
                  updateBuyerDetails("phone", event.target.value)
                }
                placeholder="082 123 4567"
                className={`min-h-11 rounded-md border px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 ${
                  fieldError("phone") ? "border-red-400" : "border-stone-300"
                }`}
              />
              {fieldError("phone") ? (
                <span className="text-sm text-red-700">
                  {fieldError("phone")}
                </span>
              ) : null}
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium text-stone-800">
            Delivery method
            <select
              value={buyerDetails.deliveryMethod}
              onChange={(event) =>
                updateBuyerDetails("deliveryMethod", event.target.value)
              }
              className={`min-h-11 rounded-md border px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 ${
                fieldError("deliveryMethod")
                  ? "border-red-400"
                  : "border-stone-300"
              }`}
            >
              {deliveryMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {fieldError("deliveryMethod") ? (
              <span className="text-sm text-red-700">
                {fieldError("deliveryMethod")}
              </span>
            ) : null}
          </label>

          {needsDeliveryAddress ? (
            <label className="grid gap-1.5 text-sm font-medium text-stone-800">
              Delivery address
              <textarea
                required
                rows={4}
                value={buyerDetails.deliveryAddress}
                onChange={(event) =>
                  updateBuyerDetails("deliveryAddress", event.target.value)
                }
                placeholder="Street address, suburb, city, province, postal code"
                className={`rounded-md border px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 ${
                  fieldError("deliveryAddress")
                    ? "border-red-400"
                    : "border-stone-300"
                }`}
              />
              {fieldError("deliveryAddress") ? (
                <span className="text-sm text-red-700">
                  {fieldError("deliveryAddress")}
                </span>
              ) : null}
            </label>
          ) : (
            <div className="rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
              Local pickup details will be confirmed after payment is available.
            </div>
          )}

          <section className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-lg font-bold text-stone-950">Review order</h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-stone-500">Buyer</dt>
                <dd className="font-semibold text-stone-950">
                  {buyerDetails.fullName || "Not entered yet"}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Contact</dt>
                <dd className="font-semibold text-stone-950">
                  {buyerDetails.email || "Email missing"}
                </dd>
                <dd className="text-stone-700">
                  {buyerDetails.phone || "Phone missing"}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Delivery method</dt>
                <dd className="font-semibold text-stone-950">
                  {buyerDetails.deliveryMethod}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Delivery address</dt>
                <dd className="font-semibold text-stone-950">
                  {needsDeliveryAddress
                    ? buyerDetails.deliveryAddress || "Not entered yet"
                    : "Local pickup"}
                </dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm">
              {cartItems.map((item) => (
                <div key={item.slug} className="flex justify-between gap-3">
                  <span className="text-stone-700">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold text-stone-950">
                    {formatZar(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-semibold">{formatZar(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Delivery placeholder</span>
                <span className="font-semibold">{formatZar(deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatZar(total)}</span>
              </div>
            </div>
          </section>

          <button
            type="button"
            disabled={!canContinueToPayment || isInitializingPayment}
            onClick={handlePayWithPaystack}
            className={`min-h-12 rounded-md px-5 py-3 text-sm font-semibold sm:w-fit ${
              canContinueToPayment
                ? "vault-button"
                : "cursor-not-allowed bg-stone-300 text-stone-600"
            }`}
          >
            {isInitializingPayment ? "Opening Paystack..." : "Pay with Paystack"}
          </button>
          {paymentError ? (
            <p className="rounded-md border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {paymentError}
            </p>
          ) : null}
          {!canContinueToPayment ? (
            <p className="text-sm text-stone-600">
              Complete the required fields and fix any cart warnings before
              payment is enabled.
            </p>
          ) : null}
        </form>
      </section>

      <aside className="vault-panel rounded-lg p-5">
        <h2 className="text-xl font-bold text-stone-950">Order summary</h2>
        <div className="mt-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item.slug} className="flex gap-3">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={`${item.name} checkout item`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-950">{item.name}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {item.quantity} x {formatZar(item.price)}
                </p>
              </div>
              <p className="text-sm font-bold text-amber-200">
                {formatZar(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-3 border-t border-stone-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-600">Subtotal</dt>
            <dd className="font-semibold text-stone-950">
              {formatZar(subtotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-600">Delivery fee placeholder</dt>
            <dd className="font-semibold text-stone-950">
              {formatZar(deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base">
            <dt className="font-bold text-stone-950">Total</dt>
            <dd className="font-bold text-amber-200">{formatZar(total)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-5 text-stone-500">
          TODO: After successful Paystack payment, send the seller an order
          summary notification via WhatsApp or email based on{" "}
          {shopConfig.sellerNotificationPreference}.
        </p>
      </aside>
    </div>
  );
}
