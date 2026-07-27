import Link from "next/link";
import { Brand } from "./brand";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Brand />
      <Link
        href="/create"
        className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-moss focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2"
      >
        Create a gathering
      </Link>
    </header>
  );
}
