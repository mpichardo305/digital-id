// app/auth/verification-failed/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerificationFailedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/#signup");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "red", fontSize: "2rem" }}>Verification Failed</h1>
      <p>Your verification link has expired or is invalid. Redirecting to sign up…</p>
    </div>
  );
}
