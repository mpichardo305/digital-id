import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOnboardingEmailUrl({ onboarding_step, token_hash, appUrl }) {
  if (onboarding_step === 1 ) {
    // Needs to verify email
    return {
      type: "verify",
      url: `${appUrl}/auth/callback?token_hash=${token_hash}&type=verify`
    };
  }
  if (onboarding_step === 2) {
    // Needs to complete profile (step 2)
    return {
      type: "complete_profile",
      url: `${appUrl}/onboarding/step-2?token_hash=${token_hash}`
    };
  }
  // Add more steps as needed
  // Default fallback
  return {
    type: "verify",
    url: `${appUrl}/auth/callback?token_hash=${token_hash}&type=verify`
  };
}
