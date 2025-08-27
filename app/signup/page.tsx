"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Using window.location for hash navigation since Next.js router doesn't handle hash navigation well
    window.location.href = "/#signup";
  }, []);
  
  // Return null or a loading state while redirecting
  return null;
}
