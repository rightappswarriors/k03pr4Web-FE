"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Sparkles, Send, ShoppingBasket, Store, Tag, TrendingUp } from "lucide-react";

const suggestions = [
  { icon: ShoppingBasket, text: "Find the cheapest rice near me" },
  { icon: Store, text: "Which stores have free delivery?" },
  { icon: Tag, text: "What products are on sale today?" },
  { icon: TrendingUp, text: "Best deals on snacks this week" },
];

export default function AIPage() {
  const [prompt, setPrompt] = useState("");

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Header />

      <section className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-8 pb-16 text-center sm:px-6 md:pb-24">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#dfeae6] px-4 py-2 text-[#2f8f83]">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">AI-Powered Search</span>
          </div>

          {/* Title */}
          <h1 className="mt-5 font-serif text-3xl font-bold text-brand-blue sm:text-4xl">
            Ask Kompra AI
          </h1>

          {/* Subtitle */}
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Find products, compare prices, and discover deals.
          </p>

          {/* Suggestions */}
          <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
            {suggestions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.text}
                  onClick={() => setPrompt(item.text)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition-all hover:border-[#2f8f83]"
                >
                  <Icon className="h-4 w-4 text-[#2f8f83]" />
                  <span className="text-sm font-medium text-slate-900">
                    {item.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Input (UPDATED SPACING HERE) */}
          <div className="mt-24 md:mt-28 lg:mt-32 flex w-full max-w-3xl items-center gap-2">
            <div className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask about products..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#9bcac3] text-white transition-all hover:bg-[#2f8f83]">
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}