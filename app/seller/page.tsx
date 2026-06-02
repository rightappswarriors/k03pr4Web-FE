import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SellerPage() {
  return (
    <main>
      <Header />
      <section className="container-shell py-8">
        <h1 className="text-3xl font-bold text-brand-blue">Seller Dashboard</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Products", "48"],
            ["Orders", "126"],
            ["Pending Delivery", "12"],
            ["Pending Pickup", "8"],
          ].map(([title, value]) => (
            <div key={title} className="card p-5">
              <p className="text-sm text-slate-500">{title}</p>
              <p className="mt-2 text-3xl font-bold text-brand-blue">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}