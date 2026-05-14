import { ProductDetail } from "@/components/ProductDetail";
import { SiteHeader } from "@/components/SiteHeader";
import { shopConfig } from "@/config/shop";
import {
  getProductBySlugFromDatabase,
  listProducts,
} from "@/lib/products-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/cards/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlugFromDatabase(slug);

  return {
    title: product ? `${product.name} | ${shopConfig.name}` : "Card not found",
  };
}

export default async function CardDetailPage(props: PageProps<"/cards/[slug]">) {
  const { slug } = await props.params;
  const products = await listProducts();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <ProductDetail slug={slug} initialProducts={products} />
    </div>
  );
}
