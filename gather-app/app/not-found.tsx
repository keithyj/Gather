import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">This page is unavailable</h1>
      <p className="mt-4 text-base text-slate-600">
        The event or invitation you’re looking for might have expired or been removed.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Go home
        </Link>
        <Link
          href="/account"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Open your account
        </Link>
      </div>
    </main>
  );
}
