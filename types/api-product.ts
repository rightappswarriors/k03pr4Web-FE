export type ApiProduct = {
  inventory_item_id: number;
  product_id: number;
  name: string;
  image: string | null;
  description: string | null;
  category: string | null;
  brand: string | null;
  price: number;
  quantity: number;
  outlet_id: number;
  outlet_name: string;
  outlet_address: string;
  outlet_phone?: string | null;
  branch_name?: string | null;
  branch_address?: string | null;
  branch_phone?: string | null;
};