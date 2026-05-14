import Link from "next/link";
import { shopConfig } from "@/config/shop";

export function SiteFooter() {
  return (
    <footer className="border-t border-cyan-300/15 bg-[#020606]/95">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold text-stone-950">{shopConfig.name}</p>
          <p className="mt-1">
            Pokémon card singles and collection stock in {shopConfig.sellerLocation}.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <Link href="/privacy-policy" className="hover:text-cyan-200">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-cyan-200">
            Terms of Service
          </Link>
          <Link href="/cards?category=singles" className="hover:text-cyan-200">
            Shop cards
          </Link>
        </nav>
      </div>
    </footer>
  );
}
