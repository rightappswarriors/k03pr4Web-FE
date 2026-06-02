import ProductCard from "@/components/ui/ProductCard";

export default function ProductSection({ products, total }: any) {
  return (
    <div className="flex flex-col min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-6">
        Products ({total})
      </h2>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product: any) => (
            <ProductCard
              key={product.inventory_item_id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-500">
          No products available
        </div>
      )}
    </div>
  );
}