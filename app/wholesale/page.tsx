import type { Metadata } from "next";
import WholesaleMarketplace from "@/components/wholesale/WholesaleMarketplace";

export const metadata: Metadata = { title: "Wholesale Marketplace | Kompra.ph", 
    description: "Source wholesale products from verified Philippine suppliers." };
export default function WholesalePage() { return <WholesaleMarketplace />; }
