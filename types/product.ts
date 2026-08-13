export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;

  price: number;
  discountPercent: number;
  rating: number;

  categoryId: string;
  storeId: string;
  stock: number;

  // ✅ ADD THESE
  badge?: string;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
};