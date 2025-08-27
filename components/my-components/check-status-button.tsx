"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CheckStatusButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export default function CheckStatusButton({
  variant = "default",
  size = "default",
  className = "",
  children = "Check Status"
}: CheckStatusButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckStatus = async () => {
    try {
      setIsLoading(true);
      
      // Call the API route to check user status
      const response = await fetch('/api/check-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Redirect to the appropriate page
        if (data.redirectTo) {
          router.push(data.redirectTo);
        } else {
          // Fallback if no redirect is specified
          router.push('/onboarding/step-2');
        }
      } else {
        console.error('Error checking status:', data.error);
        // Handle error, possibly redirect to signup
        router.push('/#signup');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      router.push('/#signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCheckStatus}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  );
}
