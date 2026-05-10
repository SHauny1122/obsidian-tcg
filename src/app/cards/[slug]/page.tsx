import { ProductDetail } from "@/components/ProductDetail";
import { SiteHeader } from "@/components/SiteHeader";
import { getProductBySlug, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(props: PageProps<"/cards/[slug]">) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);

  return {
    title: product ? `${product.name} | Obsidian TCG` : "Card not found",
  };
}

export default async function CardDetailPage(props: PageProps<"/cards/[slug]">) {
  const { slug } = await props.params;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <ProductDetail slug={slug} mockProducts={products} />
    </div>
  );
}
