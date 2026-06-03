import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#ded8cc] bg-[#fbfaf6]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img
                src="/img/green_logo.png"
                alt="Kompra.ph"
                className="h-9 w-auto"
              />

              <div>
                <span className="text-lg font-black tracking-tight text-[#10231f]">
                  Kompra<span className="text-[#2f8f83]">.ph</span>
                </span>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a938c]">
                  Local marketplace
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-[#66706b]">
              Products, stores, and branch availability in one calm shopping
              experience.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black text-[#10231f]">Shop</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#66706b]">
              <li>
                <Link href="/products" className="transition hover:text-[#2f8f83]">
                  All Products
                </Link>
              </li>

              <li>
                <Link href="/stores" className="transition hover:text-[#2f8f83]">
                  Stores
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black text-[#10231f]">Help</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#66706b]">
              <li>
                <a href="#" className="transition hover:text-[#2f8f83]">
                  Order Tracking
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#2f8f83]">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[#2f8f83]">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black text-[#10231f]">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#66706b]">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2f8f83]" />
                <a href="mailto:support@kompra.ph" className="transition hover:text-[#2f8f83]">
                  support@kompra.ph
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#2f8f83]" />
                <a href="tel:+15550000000" className="transition hover:text-[#2f8f83]">
                  +1 (555) 000-0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#ded8cc] pt-6 text-sm text-[#8a938c]">
          © 2026 Kompra.ph. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
