import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-semibold tracking-tight text-ink"
      aria-label="Gather home"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-[11px] bg-ink text-sm text-paper"
      >
        G
      </span>
      Gather
    </Link>
  );
}
