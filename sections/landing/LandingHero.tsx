import Link from "next/link";
import Image from "next/image";

export default function LandingHero() {
  return (
    <section className="bg-linear-to-r from-[#edf4f2] to-[#f6f1e9]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-10 sm:px-6 sm:py-12 md:gap-12 lg:grid-cols-2 lg:px-10 lg:py-20">
        <div className="max-w-3xl text-center lg:text-left">
          <h1 className="font-serif text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#111827] sm:text-[42px] md:text-[48px] lg:text-[56px]">
            Fresh groceries,
            <br />
            <span className="text-[#2f8f83]">delivered</span> or ready for <span className="text-[#de922f]">pickup</span>
            <br />
          </h1>

          <p className="mx-auto mt-5 max-w-160 text-[15px] leading-7 text-[#667085] sm:mt-6 sm:text-[16px] sm:leading-8 lg:mx-0 lg:mt-7 lg:text-[17px]">
            Shop from your favorite local stores. Choose delivery to your
            door or pick up at a store near you.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start lg:mt-9">
            <Link href="/products">
              <button className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#1f5f56] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#277a6f] sm:w-auto sm:px-8 sm:py-3.5 sm:text-[16px] lg:px-9 lg:text-[17px]">
                Shop Now
                <span className="text-base sm:text-lg">→</span>
              </button>
            </Link>

            <Link href="/stores">
              <button className="w-full rounded-xl border border-[#d0d5dd] bg-[#f9fafb] px-6 py-3 text-[15px] font-semibold text-[#111827] transition hover:bg-[#de922f] hover:text-white sm:w-auto sm:px-8 sm:py-3.5 sm:text-[16px] lg:px-9 lg:text-[17px]">
                Browse Stores
              </button>
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-155 overflow-hidden rounded-[20px] border border-white/60 bg-white/40 p-2 shadow-[0_16px_40px_rgba(17,24,39,0.10)] backdrop-blur-sm sm:rounded-3xl sm:p-3 lg:rounded-4xl">
            <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-[#2f8f83]/15 blur-2xl sm:-left-6 sm:-top-6 sm:h-24 sm:w-24" />
            <div className="absolute -bottom-5 -right-5 h-20 w-20 rounded-full bg-[#de922f]/20 blur-2xl sm:-bottom-8 sm:-right-8 sm:h-28 sm:w-28" />

            <Image
              src="/img/landingpage.png"
              alt="Kompra ecommerce"
              width={900}
              height={700}
              className="relative z-10 h-auto w-full rounded-2xl object-cover sm:rounded-[20px] lg:rounded-3xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}