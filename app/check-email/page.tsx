// app/check-email/page.tsx
import Link from "next/link";

export const dynamic = 'force-dynamic'

export default function CheckEmail() {
  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
      <p className="text-gray-600 mb-8">
        We sent a verification link to your inbox.
      </p>

      <div className="space-y-4">
        <Link
          href="/#signup"
          className="inline-flex items-center justify-center w-full rounded-full bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
        >
          Enter a new email
        </Link>

        <p className="text-sm text-gray-500">
          Didn't get it? Check spam, or{" "}
          <Link href="/#signup" className="underline">
            try a different address
          </Link>
          .
        </p>
      </div>
    </main>
  );
}