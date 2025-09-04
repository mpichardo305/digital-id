import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOnboardingEmailUrl({
  onboarding_step,
  token_hash,
  appUrl,
}: {
  onboarding_step: number;
  token_hash: string;
  appUrl: string;
}) {
  if (onboarding_step === 1) {
    // Needs to verify email
    return {
      type: "verify",
      url: `${appUrl}/auth/callback?token_hash=${token_hash}&type=signup&next=/onboarding/step-2`
    };
  }
  if (onboarding_step === 2) {
    // Needs to complete profile (step 2)
    return {
      type: "complete_profile",
      url: `${appUrl}/onboarding/step-${onboarding_step}?token_hash=${token_hash}`
    };
  }
  // Add more steps as needed
  // Default fallback
  return {
    type: "verify",
    url: `${appUrl}/auth/callback?token_hash=${token_hash}&type=signup&next=/onboarding/step-2`
  };
}
