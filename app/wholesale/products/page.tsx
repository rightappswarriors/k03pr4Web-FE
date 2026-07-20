import Header from "@/components/layout/Header";
import WholesaleProductCard from "@/components/wholesale/WholesaleProductCard";
import { wholesaleApi } from "@/services/wholesale.service";

async function getWholesaleProducts() {
  return wholesaleApi.getProducts();
}

export default async function WholesaleProductsPage() {
  const products = await getWholesaleProducts();

  return (
    <>
      <Header wholesale />
      <main className="min-h-screen bg-[#f7f7f5] py-8">
        <div className="container-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <WholesaleProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </>
  );
}