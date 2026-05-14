import { AdminGate } from "@/components/AdminGate";
import { AdminProducts } from "@/components/AdminProducts";
import { SiteHeader } from "@/components/SiteHeader";
import { listProducts } from "@/lib/products-repository";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await listProducts();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminGate>
          <AdminProducts initialProducts={products} />
        </AdminGate>
      </main>
    </div>
  );
}
