"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { saveCartItems } from "@/lib/cart";

type VerificationState =
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "failed"; message: string };

export function PaymentCallbackView({ reference }: { reference?: string }) {
  const [paymentReference, setPaymentReference] = useState(reference);
  const [verification, setVerification] = useState<VerificationState>(() =>
    reference
      ? {
          status: "loading",
          message: "Verifying your payment...",
        }
      : {
          status: "failed",
          message: "No payment reference was provided.",
        },
  );

  useEffect(() => {
    if (paymentReference) {
      return;
    }

    const pendingReference = window.sessionStorage.getItem(
      "pokemon-market-pending-payment-reference",
    );

    if (pendingReference) {
      setPaymentReference(pendingReference);
      setVerification({
        status: "loading",
        message: "Verifying your payment...",
      });
    }
  }, [paymentReference]);

  useEffect(() => {
    if (!paymentReference) {
      return;
    }

    let isMounted = true;
    const referenceToVerify = paymentReference;

    async function verifyPayment() {
      try {
        const response = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(referenceToVerify)}`,
        );
        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          throw new Error(data.error ?? "Payment verification failed.");
        }

        if (data.success) {
          window.sessionStorage.removeItem(
            "pokemon-market-pending-payment-reference",
          );
          saveCartItems([]);
          setVerification({
            status: "success",
            message: "Payment successful. Your cart has been cleared.",
          });
          return;
        }

        setVerification({
          status: "failed",
          message: `Payment status: ${data.status ?? "not successful"}.`,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setVerification({
          status: "failed",
          message:
            error instanceof Error
              ? error.message
              : "Payment verification failed.",
        });
      }
    }

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [paymentReference]);

  const isSuccess = verification.status === "success";

  return (
    <section className="vault-panel mx-auto max-w-2xl rounded-lg p-6 text-center sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
        Payment callback
      </p>
      <h1 className="mt-3 text-3xl font-bold text-stone-950">
        {isSuccess ? "Payment successful" : "Payment verification"}
      </h1>
      <p className="mt-4 text-sm leading-6 text-stone-600">
        {verification.message}
      </p>
      {paymentReference ? (
        <p className="mt-3 break-all text-xs text-stone-500">
          Reference: {paymentReference}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/cards?category=singles"
          className="vault-button inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold shadow-sm"
        >
          Browse cards
        </Link>
        <Link
          href="/cart"
          className="vault-button-secondary inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold"
        >
          View cart
        </Link>
      </div>
    </section>
  );
}
