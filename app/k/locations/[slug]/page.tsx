import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/ui/ProductGrid";
import StoreMap from "@/components/ui/StoreMap";
import StoreImageSlider from "@/components/ui/StoreImageSlider";
import { MapPin, Phone, Clock, Building2 } from "lucide-react";
import type { ApiProduct } from "@/types/api-product";

export default async function LocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
    searchParams: Promise<{
    type?: string;
    org?: string;
    from?: string;
    q?: string;
  }>;
}) {
  const { slug } = await params;

  const id = slug.split("-")[0];

  const { type, org, from, q } = await searchParams;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const isBranch = type === "branch";

  const locationUrl = `${API_URL}/${isBranch ? "branches" : "outlets"}/${id}/`;
  const productsUrl = `${API_URL}/products/?outlet=${id}`;

  const [locationRes, productsRes] = await Promise.all([
    fetch(locationUrl, { cache: "no-store" }),
    fetch(productsUrl, { cache: "no-store" }),
  ]);

  if (!locationRes.ok || !productsRes.ok) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] flex flex-col">
        <Header />
        <section className="container-shell flex-1 px-4 py-8 md:px-0">
          <div className="space-y-2 text-center">
            <p className="font-bold">Failed to load location</p>
            <p className="text-sm text-slate-500">
              Location status: {locationRes.status}
            </p>
            <p className="text-sm text-slate-500">
              Products status: {productsRes.status}
            </p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const location: any = await locationRes.json();
  const storeProducts: ApiProduct[] = await productsRes.json();

  const lat = location.latitude || 10.3157;
  const lng = location.longitude || 123.8854;

  const galleryImages = location.bannerimage
    ? [location.bannerimage]
    : [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop",
      ];

  const backHref =
    from === "search" && q
      ? `/search?q=${q}`
      : org && org !== "undefined"
      ? `/k/${org}`
      : `/search`;

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header />

      <section className="container-shell px-4 py-8 md:px-0">
        <Link
          href={backHref}
          className="mb-6 inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back
        </Link>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-55 sm:h-65 md:h-75 lg:h-85 xl:h-90">
              <StoreImageSlider images={galleryImages} alt={location.name} />
            </div>
          </div>

          <div>
            <span className="inline-block rounded-full bg-[#f3eee7] px-3 py-1 text-xs font-semibold uppercase text-slate-700">
              {isBranch ? "Branch" : "Outlet"}
            </span>

            <h1 className="mt-3 text-2xl font-bold text-brand-blue md:text-3xl">
              {location.name}
            </h1>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-600">
                  {location.org_name || "Organization"}
                  {location.branch_name && ` • ${location.branch_name}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-600">
                  {location.address || "No address available"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <Phone className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-600">
                  {location.phone || "No contact available"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <Clock className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-600">8:00 AM - 9:00 PM</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl">
              <StoreMap lat={lat} lng={lng} label={location.name} />
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
            Available Products
          </h2>

          <div className="mt-8">
            <ProductGrid items={storeProducts} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}