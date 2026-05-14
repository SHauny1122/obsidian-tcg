export const shopConfig = {
  name: "CollectIQ",
  logoPath: "/images/collectiq.png",
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supportEmail: "",
  whatsappSupportNumber: "",
  currency: "ZAR",
  sellerLocation: "South Africa",
  sellerNotificationPreference: "whatsapp-or-email-after-payment",
  temporaryAdminPassword: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "vault-dev",
};
