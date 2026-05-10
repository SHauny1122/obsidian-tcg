export const shopConfig = {
  name: "Obsidian TCG",
  whatsappSupportNumber: "",
  currency: "ZAR",
  sellerLocation: "South Africa",
  sellerNotificationPreference: "whatsapp-or-email-after-payment",
  temporaryAdminPassword: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "vault-dev",
};
