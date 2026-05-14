"use client";

import { usePathname } from "next/navigation";
import { shopConfig } from "@/config/shop";

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const shouldHide =
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/admin");

  if (shouldHide) {
    return null;
  }

  const whatsappHref = `https://wa.me/${shopConfig.whatsappSupportNumber}`;

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4 z-[35] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#25d366] text-white shadow-[0_12px_30px_rgba(0,0,0,0.32)] transition duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-[#1fbd5a] active:translate-y-0 active:scale-95 sm:bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:right-6 sm:h-11 sm:w-11"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M16.02 4.5c-6.28 0-11.39 5.08-11.39 11.33 0 2.13.6 4.2 1.73 6l-1.84 5.45 5.66-1.8a11.5 11.5 0 0 0 5.84 1.6c6.28 0 11.39-5.08 11.39-11.34S22.3 4.5 16.02 4.5Zm0 20.62c-1.82 0-3.58-.53-5.1-1.53l-.22-.14-3.25 1.03 1.05-3.12-.16-.25a9.24 9.24 0 0 1-1.75-5.38c0-5.17 4.23-9.38 9.43-9.38s9.43 4.2 9.43 9.38-4.23 9.39-9.43 9.39Zm5.18-7.02c-.28-.14-1.66-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.27-.73.9-.9 1.09-.16.18-.33.2-.61.06-.28-.14-1.18-.43-2.24-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.27-.02-.42.12-.56.13-.12.28-.32.42-.48.14-.16.19-.27.28-.46.1-.18.05-.34-.02-.48-.07-.14-.64-1.53-.87-2.1-.23-.55-.47-.48-.64-.49h-.54c-.19 0-.49.07-.75.34-.26.28-.99.97-.99 2.35s1.02 2.72 1.16 2.9c.14.19 2 3.04 4.85 4.26.68.29 1.21.47 1.62.6.68.21 1.3.18 1.79.11.55-.08 1.66-.67 1.9-1.32.23-.65.23-1.2.16-1.32-.07-.11-.26-.18-.54-.32Z" />
      </svg>
    </a>
  );
}
