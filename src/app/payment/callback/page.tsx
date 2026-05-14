import { PaymentCallbackView } from "@/components/PaymentCallbackView";
import { SiteHeader } from "@/components/SiteHeader";

export default async function PaymentCallbackPage(
  props: PageProps<"/payment/callback">,
) {
  const searchParams = await props.searchParams;
  const reference =
    typeof searchParams.reference === "string"
      ? searchParams.reference
      : typeof searchParams.trxref === "string"
        ? searchParams.trxref
      : undefined;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <PaymentCallbackView reference={reference} />
      </main>
    </div>
  );
}
