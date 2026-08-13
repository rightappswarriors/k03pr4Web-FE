"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <main>
      <Header />
      <section className="container-shell py-8">
        <h1 className="text-3xl font-bold text-brand-blue">Admin Dashboard</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            ["Users", "250"],
            ["Stores", "18"],
            ["Products", "650"],
            ["Orders", "1200"],
            ["Inventory Alerts", "14"],
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