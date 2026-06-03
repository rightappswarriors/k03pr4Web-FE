"use client";

import { use, useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import StoreHeader from "@/components/StoreHeader";
import StoreTabs from "@/components/StoreTabs";
import StoreHero from "@/components/StoreHero";
import ProductCategories from "@/components/ProductCategories";
import ProductSection from "@/components/ProductSection";
import LocationSection from "@/components/LocationSection";
import AboutSection from "@/components/AboutSection";
import CompanyProfile from "@/components/CompanyProfile";
import CertificateSection from "@/components/CertificateSection";
import ContactSection from "@/components/ContactSection";

import { Globe } from "lucide-react";

import type { ApiBranch, ApiOrganization } from "@/types/api-organization";
import type { ApiProduct } from "@/types/api-product";

const LANGUAGES = ["EN", "中文", "ES", "FR", "DE"];

export default function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  

  const [organization, setOrganization] =
    useState<ApiOrganization | null>(null);
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("home");
  const [search, setSearch] = useState("");
  const [following, setFollowing] = useState(false);
  const [language, setLanguage] = useState("EN");

  const [selectedCategory, setSelectedCategory] = useState("");

  const [orgCategories, setOrgCategories] = useState<any[]>([]);

  const isSearching = search.trim().length > 0;

  const [searchResults, setSearchResults] = useState<any>({
    products: [],
    stores: [],
    branches: [],
  });

  const handleSearch = async (value: string) => {
    setSearch(value);

    if (!value) {
      setSearchResults({
        products: [],
        stores: [],
        branches: [],
      });
      return;
    }

    if (!organization?.id) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(
        `${API_URL}/organization/${organization.id}/search?q=${value}`
      );

      const data = await res.json();

      setSearchResults(data);

      // ✅ AUTO SWITCH TAB BASED ON RESULT
      if (data.stores?.length > 0 || data.branches?.length > 0) {
        setActiveTab("locations");
      } else if (data.products?.length > 0) {
        setActiveTab("products");
      }


    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const loadData = async () => {
      try {
        const [orgRes, prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/organizations/slug/${slug}/`),
          fetch(`${API_URL}/products/`),
          fetch(`${API_URL}/categories/`), // ✅ FIX
        ]);

        if (!orgRes.ok || !prodRes.ok || !catRes.ok) {
          throw new Error("Failed to load seller data");
        }

        const orgData = await orgRes.json();
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        // ✅ SET STATE
        setOrganization(orgData);
        setAllProducts(Array.isArray(prodData) ? prodData : []);
        setOrgCategories(Array.isArray(catData) ? catData : []);

        

      } catch {
        setError("Failed to load organization");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const outletIds = useMemo(() => {
    const ids = new Set<number>();
    organization?.branches?.forEach((b) =>
      b.outlets?.forEach((o) => ids.add(o.id))
    );
    return ids;
  }, [organization]);

  const organizationProducts = useMemo(() => {
    return allProducts.filter((p) => outletIds.has(p.outlet_id));
  }, [allProducts, outletIds]);

  const filteredProducts = useMemo(() => {
    let result = organizationProducts;

    // ✅ Filter by category
    if (selectedCategory) {
      result = result.filter(
        (p: any) => p.category_name === selectedCategory
      );
    }

    return result;
  }, [organizationProducts, search, selectedCategory]);

  const storesForCard = useMemo(() => {
    if (!organization?.branches) return [];

    const result: any[] = [];

    organization.branches.forEach((branch: any) => {
      // ✅ BRANCH
      result.push({
        id: branch.id,
        name: branch.name,
        description: branch.address, // ✅ USE ADDRESS HERE
        image:
          branch.image ||
          "https://images.unsplash.com/photo-1542838132-92c53300491e",
        type: "branch",
        orgId: organization.id, // ✅ IMPORTANT for routing
        orgSlug: slug, 

      });

      // ✅ OUTLETS
      branch.outlets?.forEach((outlet: any) => {
        result.push({
          id: outlet.id,
          name: outlet.name,
          description:
            outlet.address || outlet.branch_address, // ✅ USE OUTLET ADDRESS
          image:
            outlet.bannerimage ||
            branch.image ||
            "https://images.unsplash.com/photo-1542838132-92c53300491e",
          type: "outlet",
          orgId: organization.id, // ✅ IMPORTANT
          orgSlug: slug, 
        });
      });
    });

    return result;
  }, [organization]);

  const categories = useMemo(() => {
    return orgCategories;
  }, [orgCategories]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-[#f6f4ee]">
        <Header />

        <section className="flex flex-1 items-center justify-center">
          <div className="rounded-2xl border border-[#ded8cc] bg-white px-6 py-5 text-center">
            <p className="text-sm font-bold text-[#66706b]">Loading store...</p>
          </div>
        </section>
      </main>
    );
  }
  if (error) return <p className="p-10">{error}</p>;
  if (!organization) return <p className="p-10">Not found</p>;

  return (
    <main className="min-h-screen flex flex-col bg-[#f6f4ee]">
      <Header />

      <div className="flex-1 flex flex-col">

        {/* 🌐 LANGUAGE BAR */}
        <div className="border-b border-[#ded8cc] bg-[#fbfaf6]">
          <div className="container-shell flex justify-between items-center py-2 text-xs">

            <div className="flex items-center gap-2 text-[#66706b]">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Choose language:</span>
            </div>

            <div className="flex gap-3 overflow-x-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded transition whitespace-nowrap ${
                    language === lang
                      ? "bg-[#2f8f83] text-white font-medium"
                      : "text-[#66706b] hover:text-[#2f8f83]"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* STORE HEADER */}
        <StoreHeader
          organization={organization}
          following={following}
          setFollowing={setFollowing}
        />

        {/* TABS */}
        <StoreTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          search={search}
          setSearch={handleSearch}
        />

        {/* CONTENT */}
        <div className="flex-1">

            <>
              {activeTab === "home" && (
                <>
                  <StoreHero organization={organization} />

                  <div className="container-shell space-y-10 py-10 md:space-y-12">
                    <ProductCategories
                      categories={categories}
                      products={organizationProducts}
                      setSearch={handleSearch}
                      setActiveTab={setActiveTab}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                    />

                    <CompanyProfile
                      organization={organization}
                      branchesCount={organization.branches?.length || 0}
                      outletsCount={
                        organization.branches?.reduce(
                          (acc: number, b: any) => acc + (b.outlets?.length || 0),
                          0
                        ) || 0
                      }
                    />
                    <CertificateSection />
                  </div>
                </>
              )}

              {activeTab === "contact" && (
                <ContactSection
                  organization={organization}
                  totalLocations={
                    (organization.branches?.length || 0) +
                    (organization.branches?.reduce(
                      (acc: number, b: any) => acc + (b.outlets?.length || 0),
                      0
                    ) || 0)
                  }
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "products" && (
                <div className="container-shell py-10">
                  <ProductSection
                    products={
                      search ? searchResults.products : filteredProducts
                    }
                    total={
                      search ? searchResults.products.length : filteredProducts.length
                    }
                  />
                </div>
              )}

              {activeTab === "locations" && (
                <div className="container-shell py-10">
                  <LocationSection
                    stores={
                      search
                        ? [
                            ...(searchResults.branches || []).map((b: any) => ({
                              id: b.id,
                              name: b.name,
                              description: b.address,
                              type: "branch",
                            })),
                            ...(searchResults.stores || []).map((s: any) => ({
                              id: s.id,
                              name: s.name,
                              description: s.address,
                              type: "outlet",
                            })),
                          ]
                        : storesForCard
                    }
                  />
                </div>
              )}

              {activeTab === "about" && (
                <div className="container-shell py-10">
                  <AboutSection
                    organization={organization}
                    totalProducts={organizationProducts.length}
                  />
                </div>
              )}
            </>
        

        </div>
      </div>
      

      <Footer />
    </main>
  );
}
