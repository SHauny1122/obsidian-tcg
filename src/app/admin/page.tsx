import { AdminGate } from "@/components/AdminGate";
import { AdminProducts } from "@/components/AdminProducts";
import { SiteHeader } from "@/components/SiteHeader";
import { products } from "@/data/products";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminGate>
          <AdminProducts mockProducts={products} />
        </AdminGate>
      </main>
    </div>
  );
}
