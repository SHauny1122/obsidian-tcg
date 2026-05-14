import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type PaidOrderItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type PaidOrderInput = {
  reference: string;
  buyer: Record<string, unknown>;
  cartItems: PaidOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paystackPayload: Record<string, unknown>;
  paidAt?: string;
};

export async function finalizePaidOrder(input: PaidOrderInput) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("complete_paid_order", {
    p_reference: input.reference,
    p_buyer: input.buyer,
    p_cart_items: input.cartItems,
    p_subtotal: input.subtotal,
    p_delivery_fee: input.deliveryFee,
    p_total: input.total,
    p_currency: input.currency,
    p_paystack_payload: input.paystackPayload,
    p_paid_at: input.paidAt ?? new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as { order_id?: string; already_processed?: boolean } | null;
}
