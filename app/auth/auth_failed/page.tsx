// app/auth/auth_failed/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthFailedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/#signup");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "red", fontSize: "2rem" }}>Authentication Failed</h1>
      <p>Authentication failed. Redirecting to sign up…</p>
    </div>
  );
}
