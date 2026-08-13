import type { WholesaleBanner } from "@/types/wholesale";

export type { WholesaleBanner };

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const banners: WholesaleBanner[] = [
  { id: "bulk", eyebrow: "Wholesale Deals", title: "Exclusive deals for bulk buyers", copy: "Save more when you buy directly from verified suppliers.", image: image("photo-1586864387967-d02ef85d93e8") },
  { id: "seasonal", eyebrow: "Seasonal sourcing", title: "Stock up for the rainy season", copy: "Construction, home and packaging essentials at bulk prices.", image: image("photo-1504307651254-35680f356dfd") },
  { id: "supplier-campaign", eyebrow: "Supplier spotlight", title: "New partners this month", copy: "Meet our latest verified suppliers ready to fulfill your orders.", image: image("photo-1521791136064-7986c2925834") },
];