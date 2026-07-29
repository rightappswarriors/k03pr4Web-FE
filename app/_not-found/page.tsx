import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f4ee]">
      <div className="text-center">
        <h1 className="text-6xl font-black text-[#10231f]">404</h1>
        <p className="mt-4 text-lg text-[#66706b]">Page not found</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#2f8f83] px-6 py-3 font-bold text-white transition hover:bg-[#26776d]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}