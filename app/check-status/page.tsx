"use client";

import { Button } from "../../components/ui/button.tsx";
import { Input } from "../../components/ui/input.tsx";
import { useState, useEffect } from "react";
import { useEmailValidation } from "../../hooks/use-email-validation.ts";
import { createClient } from "../../utils/supabase/client.ts";
import { getOnboardingEmailUrl } from '../../lib/utils.ts'; // adjust path if needed
import { Loader } from "lucide-react";

export default function CheckStatusPage() {
  const { email, isValid, isCorporate, error, submitted, setSubmitted, handleEmailChange } =
    useEmailValidation("");
  const showError = submitted && Boolean(error);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLimitLabel, setEmailLimitLabel] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Only run in the browser
    if (typeof window !== "undefined") {
      const lastSent = window.localStorage.getItem(`emailSent:${email}`);
      if (lastSent && Date.now() - Number(lastSent) < 60 * 1000) {
        setEmailLimitLabel(true);
      } else {
        setEmailLimitLabel(false);
      }
    }
  }, [email]);

  // useEffect to clear the label after 60 seconds
  useEffect(() => {
    if (emailLimitLabel) {
      const timeout = setTimeout(() => {
        setEmailLimitLabel(false);
      }, 60 * 1000); // 60 seconds

      // Cleanup on unmount or if label changes
      return () => clearTimeout(timeout);
    }
  }, [emailLimitLabel]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    const setEmailLimit = () => {
      setEmailLimitLabel(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`emailSent:${email}`, Date.now().toString());
      }
    };
    if (!isValid || !isCorporate || submitting) return;
    setSubmitting(true);
    try {
      // Check if email exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('onboarding_step')
        .eq('email', email)
        .single();

      if (userData) {
        console.log('onboarding_step:', userData.onboarding_step);

        if (userData.onboarding_step === 2) {
          // Generate the token and URL for completing the profile
          const token_hash = crypto.randomUUID();
          
          // Use the utility to get the correct URL for completing profile
          const { url, type } = getOnboardingEmailUrl({
            onboarding_step: userData.onboarding_step,
            token_hash,
            appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
          });
          
          // Send complete profile email with the generated URL
          await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              template: 'complete_profile',
              email: email,
              onboarding_step: userData.onboarding_step,
              url: url,
              token_hash: token_hash,
            }),
          });
          setSubmitting(false);
          return;
        }

        if (userData.onboarding_step === 1) {
          // Re-trigger the magic link flow (send a new verification email)
          const token_hash = crypto.randomUUID();
          const nowNotIso = new Date();
          const now = nowNotIso.toISOString();
          const expiresAt = new Date(nowNotIso.getTime() + 60 * 60 * 1000).toISOString();

          // Insert a new verification record
          await supabase
            .from('email_verifications')
            .insert({
              email: email,
              expires_at: expiresAt,
              used: false,
              created_at: now,
            });

          // Use the utility to get the correct URL
          const { url } = getOnboardingEmailUrl({
            onboarding_step: userData.onboarding_step,
            token_hash,
            appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
          });

          // Send the magic link
          const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
              emailRedirectTo: url,
              shouldCreateUser: false, // user already exists
            }
          });

          if (error) throw error;
          if (typeof window !== "undefined") {
            localStorage.setItem(`emailSent:${email}`, Date.now().toString());
          }
          setEmailSent(true);
          setSubmitting(false);
          return;
        }

        setSubmitting(false);
        return;
      }

      // --- Custom Supabase logic for onboarding and email_verifications for new users ---
      const token_hash = crypto.randomUUID();
      const nowNotIso = new Date();
      const now = nowNotIso.toISOString();
      const expiresAt = new Date(nowNotIso.getTime() + 60 * 60 * 1000).toISOString();
      await supabase
        .from('email_verifications')
        .insert({
          email: email,
          expires_at: expiresAt,
          used: false,
          created_at: now,
        });
      await supabase
        .from('users')
        .insert({
          email: email,
          onboarding_step: 1,
          created_at: now,
          onboarding_completed: false,
        });

      // Use the utility to get the correct URL
      const { url } = getOnboardingEmailUrl({
        onboarding_step: 1, // new user always starts at step 1
        token_hash,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
      });

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: url,
          shouldCreateUser: true,
        }
      });
      if (error) throw error;
      if (typeof window !== "undefined") {
        localStorage.setItem(`emailSent:${email}`, Date.now().toString());
      }
      setEmailSent(true);
    } catch (error) {
      setFormError('Failed to send verification email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-[#FAFAFA] px-4 md:px-0">
      <div
        className="bg-white p-8 md:p-12 w-full max-w-lg rounded-2xl shadow-lg"
        style={{
          filter: "drop-shadow(0 0 25px rgba(147, 51, 234, 0.06))",
        }}
      >
        <h2 className="text-[#625B71] text-center text-lg md:text-xl font-grey mb-8">
          Type your email to check your ID’s status
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-8 mb-30">
            <label
              htmlFor="email"
              className="block text-base font-normal mb-2"
              style={{ color: "#625B71" }}
            >
              Corporate email address <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="E-mail"
              value={email}
              onChange={handleEmailChange}
              aria-invalid={showError}
              aria-describedby="email-error"
              required
              className={`w-full px-6 text-medium rounded-full bg-white focus:ring-2 focus:ring-purple-300 transition-all duration-200 ${showError ? "ring-1 ring-red-500 focus:ring-red-500" : ""}`}
              style={{ border: "1px solid #4F378A", height: "54px", fontSize: "18px" }}
            />
            <p className="text-xs mt-2 text-gray-500">Make sure it’s your work email</p>
            {submitted && error && (
              <p id="email-error" className="text-sm text-red-600">{error}</p>
            )}
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
            {emailSent && (
              <p>We've sent a verification link to {email}</p>
            )}
            {emailLimitLabel && (
              <p>You must wait at least 1 minute before resubmitting for {email}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={submitting || emailLimitLabel}
            className="w-full bg-black text-white py-6 text-base font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader className="animate-spin mr-2" /> Checking...
              </>
            ) : (
              "Check status"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
