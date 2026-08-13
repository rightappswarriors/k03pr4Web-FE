import { useState, useEffect } from "react";
import { wholesaleApi } from "@/services/wholesale.service";
import type { WholesaleBanner, WholesaleCategory, WholesaleProduct, WholesaleSupplier } from "@/types/wholesale";

interface WholesaleData {
  products: WholesaleProduct[];
  suppliers: WholesaleSupplier[];
  categories: WholesaleCategory[];
  banners: WholesaleBanner[];
  isLoading: boolean;
}

export function useWholesaleData(): WholesaleData {
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [suppliers, setSuppliers] = useState<WholesaleSupplier[]>([]);
  const [categories, setCategories] = useState<WholesaleCategory[]>([]);
  const [banners, setBanners] = useState<WholesaleBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      wholesaleApi.getProducts().catch(() => [] as WholesaleProduct[]),
      wholesaleApi.getSuppliers().catch(() => [] as WholesaleSupplier[]),
      wholesaleApi.getCategories().catch(() => [] as WholesaleCategory[]),
      wholesaleApi.getBanners(),
    ])
      .then(([productData, supplierData, categoryData, bannerData]) => {
        setProducts(productData);
        setSuppliers(supplierData);
        setCategories(categoryData);
        setBanners(bannerData);
      })
      .catch(() => {
        /* all errors already caught per-call above */
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { products, suppliers, categories, banners, isLoading };
}