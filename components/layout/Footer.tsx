import Link from "next/link";


export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#d98b2b] text-xl leading-none">•</span>

              <img
                src="/img/green_logo.png"
                alt="Kompra.ph"
                className="h-5 w-auto sm:h-6"
              />

              <span className="text-gray-800 text-sm sm:text-base font-semibold tracking-tight">
                Kompra<span className="text-[#2f8f83]">.ph</span>
              </span>
            </div>

            <p className="mt-5 text-[15px] leading-8 text-[#667085]">
              Fresh groceries delivered to your door or ready for pickup at your
              nearest store.
            </p>
          </div>

          <div>
            <h3 className="text-[16px] font-semibold text-[#101828]">Shop</h3>
            <ul className="mt-5 space-y-4 text-[15px] text-[#667085]">
              <li>
                <Link href="/products" className="hover:text-[#101828] transition-colors">
                  All Products
                </Link>
              </li>

              <li>
                <Link href="/stores" className="hover:text-[#101828] transition-colors">
                  Stores
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[16px] font-semibold text-[#101828]">Help</h3>
            <ul className="mt-5 space-y-4 text-[15px] text-[#667085]">
              <li>
                <a href="#" className="hover:text-[#101828] transition-colors">
                  Order Tracking
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#101828] transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#101828] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[16px] font-semibold text-[#101828]">Contact</h3>
            <ul className="mt-5 space-y-4 text-[15px] text-[#667085]">
              <li>
                <a
                  href="mailto:support@kompra.ph"
                  className="hover:text-[#101828] transition-colors"
                >
                  support@kompra.ph
                </a>
              </li>
              <li>
                <a
                  href="tel:+15550000000"
                  className="hover:text-[#101828] transition-colors"
                >
                  +1 (555) 000-0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#e4e7ec] pt-8 text-center">
          <p className="text-[14px] text-[#667085]">
            © 2026 Kompra.ph. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}