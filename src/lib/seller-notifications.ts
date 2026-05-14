import "server-only";
import nodemailer from "nodemailer";
import type { PaidOrderItem } from "@/lib/orders-repository";

export type SellerNotificationOrder = {
  orderId?: string;
  reference: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
  cartItems?: PaidOrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  currency?: string;
  total: number;
};

function isEmailNotificationConfigured() {
  return Boolean(
    process.env.ORDER_NOTIFICATION_EMAIL_TO &&
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

function formatCurrency(amount: number, currency = "ZAR") {
  return `${currency} ${amount.toFixed(2)}`;
}

function buildOrderEmail(order: SellerNotificationOrder) {
  const currency = order.currency ?? "ZAR";
  const items = order.cartItems ?? [];
  const lines = [
    "New paid order received.",
    "",
    `Reference: ${order.reference}`,
    order.orderId ? `Order ID: ${order.orderId}` : undefined,
    "",
    "Customer:",
    `Name: ${order.buyerName || "Not supplied"}`,
    `Email: ${order.buyerEmail || "Not supplied"}`,
    `Phone: ${order.buyerPhone || "Not supplied"}`,
    "",
    "Delivery:",
    `Method: ${order.deliveryMethod || "Not supplied"}`,
    `Address: ${order.deliveryAddress || "Not supplied"}`,
    "",
    "Items:",
    ...items.map(
      (item) =>
        `- ${item.name} x${item.quantity} @ ${formatCurrency(
          item.price,
          currency,
        )} = ${formatCurrency(item.lineTotal, currency)}`,
    ),
    items.length === 0 ? "- No item details supplied." : undefined,
    "",
    "Totals:",
    `Subtotal: ${formatCurrency(order.subtotal ?? order.total, currency)}`,
    `Delivery: ${formatCurrency(order.deliveryFee ?? 0, currency)}`,
    `Total: ${formatCurrency(order.total, currency)}`,
  ].filter(Boolean);

  return lines.join("\n");
}

export async function queueSellerNotification(order: SellerNotificationOrder) {
  if (!isEmailNotificationConfigured()) {
    return { queued: false, provider: "none" as const };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from:
      process.env.ORDER_NOTIFICATION_EMAIL_FROM ??
      `"CollectIQ Orders" <${process.env.SMTP_USER}>`,
    to: process.env.ORDER_NOTIFICATION_EMAIL_TO,
    replyTo: order.buyerEmail,
    subject: `New paid CollectIQ order - ${formatCurrency(
      order.total,
      order.currency,
    )}`,
    text: buildOrderEmail(order),
  });

  return { queued: true, provider: "email" as const };
}
