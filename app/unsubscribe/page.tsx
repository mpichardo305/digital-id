// app/unsubscribe/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnsubscribePage() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Replace with actual logic to get the user's email
    const userEmail = "user@example.com";

    // Call the API to notify admin
    fetch("/api/unsubscribe-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });

    const timer = setTimeout(() => {
      router.replace("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "green", fontSize: "2rem" }}>Sorry to see you go!</h1>
      <p>You have been unsubscribed from our emails. Redirecting to home page…</p>
    </div>
  );
}
