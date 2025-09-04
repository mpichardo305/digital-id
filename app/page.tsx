"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Shield, Zap, Key, Mail, Download, User, Check } from "lucide-react";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useEmailValidation } from "@/hooks/use-email-validation";
import { useRouter } from "next/navigation";
import { createClient } from '@/utils/supabase/client'
import { useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { getOnboardingEmailUrl } from '@/lib/utils';


export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  // const [mobileOpen, setMobileOpen] = useState(false);
  const { email, isValid, isCorporate, error, submitted, setSubmitted, handleEmailChange } =
  useEmailValidation("");
  const showError = submitted && Boolean(error);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailLimitLabel, setEmailLimitLabel] = useState(false);
  
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

    // Check localStorage for recent submission
    // When you set the limit (e.g., after submit)
    const setEmailLimit = () => {
      setEmailLimitLabel(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`emailSent:${email}`, Date.now().toString());
      }
    };

    if (!isValid || !isCorporate || submitting) return;

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
         // Send incomplete profile email
         await fetch('/api/send', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             template: 'incomplete_profile',
             email: email,
             onboarding_step: userData.onboarding_step,
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

         const { url } = getOnboardingEmailUrl({
           onboarding_step: userData.onboarding_step,
           token_hash,
           appUrl: process.env.NEXT_PUBLIC_APP_URL
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
      // Generate a token_hash (for demo, use crypto.randomUUID())
      const token_hash = crypto.randomUUID();
      const nowNotIso = new Date();
      const now = nowNotIso.toISOString();
      const expiresAt = new Date(nowNotIso.getTime() + 60 * 60 * 1000).toISOString();

      // 1. Insert into email_verifications
      await supabase
        .from('email_verifications')
        .insert({
          email: email,
          expires_at: expiresAt,
          used: false,
          created_at: now,
        });

      // 2. Update users table (set onboarding_step=1, created_at=now)
      await supabase
        .from('users')
        .insert({
          email: email,
          onboarding_step: 1,
          created_at: now,
          onboarding_completed: false,

        });
      // --- End custom logic ---
      // This triggers Supabase Auth which triggers the Auth Hook
      const { url } = getOnboardingEmailUrl({
        onboarding_step: 1,
        token_hash,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      });
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: url,
          shouldCreateUser: true,
        }
      })
      
      if (error) throw error
      if (typeof window !== "undefined") {
        localStorage.setItem(`emailSent:${email}`, Date.now().toString());
      }
      // Success! The Auth Hook will handle sending the custom email
      setEmailSent(true)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send verification email')
    } finally {
      setIsLoading(false)
    }
  }

  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  return (
    <div className="min-h-screen">
      {/* Error Message Banner */}
      {errorParam === 'verification_failed' && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-4 z-50">
          Your verification link has expired or is invalid. Please request a new one.
        </div>
      )}
      {errorParam === 'auth_failed' && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-4 z-50">
          Authentication failed. Please try again.
        </div>
      )}
      {/* Header */}
    <section className="hero-section w-full py-10 relative pt-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left Content - More breathing room */}
            <div className="space-y-6 md:space-y-10 relative z-10 order-1 lg:order-1">
              <div className="space-y-3 md:space-y-6">
                <h1 className="text-4xl md:text-6xl font-semibold text-black leading-[1.1] tracking-tight">
                  Turn your badge
                  <br />
                  into a Digital ID
                </h1>
                <p className="text-base md:text-lg text-black font-normal">
                  How it works:
                </p>
              </div>

              {/* Feature Pill-shaped Containers */}
              <div
                className="space-y-4"
                style={{
                  filter: `
                drop-shadow(0 0 25px rgba(147, 51, 234, 0.06))
                drop-shadow(0 0 50px rgba(147, 51, 234, 0.04))
              `,
                }}
              >
                {/* Step 1 - Clickable */}
                <div className="bg-white backdrop-blur-sm rounded-full flex items-center gap-4 px-5 md:px-6 w-full max-w-[380px] md:max-w-[500px] h-14 md:h-16">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <a
                      href="#signup"
                      className="text-gray-700 text-left hover:text-black transition-colors no-underline"
                    >
                      1. Complete the form and verify your email
                    </a>
                  </div>
                </div>

                {/* Step 2 - Plain styling */}
                <div className="bg-white backdrop-blur-sm rounded-full flex items-center gap-4 px-5 md:px-6 w-full max-w-[380px] md:max-w-[500px] h-14 md:h-16">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <Download className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <span className="text-gray-700">
                      2. Download Digital ID
                    </span>
                  </div>
                </div>

                {/* Step 3 - Plain text */}
                <div className="bg-white backdrop-blur-sm rounded-full flex items-center gap-4 px-5 md:px-6 w-full max-w-[380px] md:max-w-[500px] h-14 md:h-16">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <span className="text-gray-700">
                      3. Start using your digital ID
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}

              <Button
                className="bg-black text-white text-base font-medium hover:bg-gray-800 transition-colors shadow-lg w-[184px] h-[52px] rounded-[36px] py-[14px] px-4 cursor-pointer"
                onClick={() =>
                  document
                    .getElementById("signup")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Try Digital ID
              </Button>
            </div>

            <div
              className="flex justify-center lg:justify-center relative z-10 order-2 lg:order-2 backdrop-blur-sm"
              style={{
                filter: `
                  drop-shadow(0 0 25px rgba(147, 51, 234, 0.06))
                  drop-shadow(0 0 50px rgba(147, 51, 234, 0.04))
                `
              }}
            >
              <video
                  src="/iPhone_ID_to_Apple_Wallet.mp4"
                  className="object-cover rounded-[40px] aspect-[805.33/453]"
                  style={{
                    maxWidth: "120%",
                    height: "auto"
                  }}
                  controls
                  preload="metadata"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
            </div>
          </div>

          <div className="text-left mt-16 md:mt-20 pt-12 md:pt-16 relative z-10 px-4 md:px-6 mb-14">
            <p className="text-xs md:text-sm text-gray-400 font-medium mb-8 md:mb-12 tracking-wider text-left">
              TRUSTED BY
            </p>
          <div className="flex flex-wrap items-center justify-start gap-10 md:gap-20">
            <div className="flex items-center">
                <img
                  src="/quicknode-logo.png"
                  alt="QuickNode"
                  className="h-8 md:h-10 w-auto opacity-100 hover:opacity-60 transition-opacity "
                />
              </div>
              <div className="flex items-center">
                <img
                  src="/omnitech-logo.png"
                  alt="OMNITEC"
                  className="h-8 md:h-10 w-auto opacity-100 hover:opacity-60 transition-opacity "
                />
              </div>
              {/* <div className="flex items-center space-x-6 md:space-x-12 hidden md:flex"> */}
                <div className="flex items-center hidden md:flex">
                  <img
                    src="/cross-court-logo.png"
                    alt="CrossCourt"
                    className="h-14 md:h-14 w-auto opacity-100 hover:opacity-60 transition-opacity "
                  />
                </div>
                <div className="flex items-center hidden md:flex">
                  <img
                    src="/goldman-properties-logo.png"
                    alt="Goldman Properties"
                    className="h-10 md:h-12 w-auto opacity-100 hover:opacity-60 transition-opacity "
                  />
                </div>
                <div className="flex items-center hidden md:flex">
                  <img
                    src="/quicknode-logo.png"
                    alt="QuickNode"
                    className="h-8 md:h-10 w-auto opacity-100 hover:opacity-60 transition-opacity "
                  />
                </div>
              {/* </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="why-use" className="w-full py-12 md:py-20" style={{backgroundColor:"#FFFFFF"}}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 ">
          <p
            className="text-xs md:text-sm text-gray-400 mb-6 md:mb-8 tracking-wider"
            style={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "30px",
              letterSpacing: "0%",
              color: "black",
            }}
          >
            WHY USE DIGITAL IDS
          </p>
       

        <div className="space-y-8 md:grid md:grid-cols-3 md:gap-12 md:space-y-0 mb-12 md:mb-16">
          {/* Unified Access Card */}
          <div className="text-left space-y-4 md:space-y-6 border-b border-gray-100 pb-8 md:border-b-0 md:pb-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center">
              <Key className="w-6 h-6 md:w-8 md:h-8 text-black" />
            </div>
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-black">
                Unified Access, One Credential
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Digital IDs replace physical badges and passwords with a single,
                secure digital credential that works across all your systems and
                locations.
              </p>
            </div>
          </div>

          {/* Smarter Security Card */}
          <div className="text-left space-y-4 md:space-y-6 border-b border-gray-100 pb-8 md:border-b-0 md:pb-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-black" />
            </div>
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-black">
                Smarter, Stronger Security
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Digital IDs prevent unauthorized access and reduce the risk of
                losing or cloning credentials theft.
              </p>
            </div>
          </div>

          {/* Eco-friendly Card */}
          <div className="text-left space-y-4 md:space-y-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-black" />
            </div>
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-black">
                Eco-friendly
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Drastically reduce waste. No more plastic IDs, printed badges,
                and physical credentials.
              </p>
            </div>
          </div>
        

        
        </div>
        </div>
        {/* CTA Button */}
        <div className="text-center">
          <Button
            className="bg-black text-white text-base font-medium hover:bg-gray-800 transition-colors py-6 w-[202px] h-[56px] rounded-[36px] p-4 opacity-100 cursor-pointer"
            onClick={() =>
              document
                .getElementById("signup")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Try Digital ID
          </Button>
        </div>
      </section>

      {/* Digital Transformation Section */}
      <section
        id="benefits"
        className="px-4 md:px-6 py-12 md:py-20"
        style={{ backgroundColor: "#F5F5F5" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-16 lg:space-y-0 items-center">
            {/* Left Content - Phone without Blue Border */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div
                  className="p-4 md:p-8 bg-grey rounded-xl md:rounded-2xl overflow-hidden"
                  style={{
                    objectPosition: "50% 50%",
                  }}
                >
                  <img
                    src="/cornerstone-dig-transf.png"
                    alt="Digital ID Phone"
                    className="w-[502px] h-[502px] object-cover"
                    style={{
                      height: '350px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-5xl font-semibold text-black leading-tight">
                Digital IDs are a cornerstone of digital transformation
              </h2>
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed">
                They enable seamless access to digital services and
                applications, reducing administrative overhead and improving
                user experience. Digital IDs also enhance security by reducing
                the risk of credential theft and unauthorized access, while
                supporting regulatory compliance and audit requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cybersecurity Section */}
      <section 
        className="px-4 md:px-6 py-12 md:py-20"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Content - Order 2 on mobile, 1 on desktop */}
            <div className="space-y-4 md:space-y-6 order-2 lg:order-1 mt-24">
              <h2 className="text-3xl md:text-5xl font-semibold text-black leading-tight">
                Reduce your risks of cyberattacks
              </h2>
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed">
                Protect your organization with identity-first security. Digital
                IDs ensure that only verified users can access critical systems
                and spaces—eliminating shared credentials, weak passwords, and
                unauthorized entry points. With built-in encryption, adaptive
                authentication, and real-time control, you stay one step ahead of
                cyber threats while keeping access effortless for your team.
              </p>
            </div>

            {/* Right Content - Order 1 on mobile, 2 on desktop */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="pt-4 px-4 pb-0 md:p-8 bg-grey rounded-xl md:rounded-2xl overflow-hidden">
                <img
                  src="/cybershield.png"
                  alt="Cybersecurity Shield"
                  className="w-[400px] md:w-[550px] h-[300px] md:h-[385px] lg:h-[480px] object-cover object-top"
                  style={{ backgroundColor: "#F0F4F8" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="signup"
        className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20"
      >
        <div className="max-w-2xl mx-auto md:pt-24">
          {/* White Modal Container */}
          <div
            className="bg-white p-8 md:p-12"
            style={{
              filter: "drop-shadow(0 0 25px rgba(147, 51, 234, 0.06))",
              maxWidth: "572px",
              minHeight: "502px",
              borderRadius: "16px",
              margin: "0 auto"
            }}
          >
            <div className="mx-auto max-w-[640px] px-2 pt-4">
            <h2 className="text-[#625B71] whitespace-nowrap text-xl leading-9">
              Get your first Digital ID for FREE
            </h2>

          {/* Horizontal Progress Steps */}
          <div className="grid grid-cols-5 items-start py-12 max-w-md mx-auto">
            {/* Step 1 - Completed */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center relative z-10">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div className="text-[10px] font-medium text-[#6F6F6F] text-center whitespace-nowrap">
                Verify email address
              </div>
            </div>

            {/* Horizontal connector line */}
            <div className="flex items-center -mx-6" style={{ position: 'relative', height: '24px' }}>
              <div className="h-px bg-gray-300 w-full" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}></div>
            </div>

            {/* Step 2 - Current with pulse animation */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative flex items-center justify-center">
                {/* Black filled center circle */}
                <div className="w-6 h-6 bg-white border border-black rounded-full z-20 relative flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  {/* Pulse rings - expanding from black center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="absolute rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(37, 99, 235) 0%, rgb(96, 165, 250) 100%)",
                      animation:
                        "pulseRing2-1 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="absolute rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(96, 165, 250) 0%, rgb(147, 197, 253) 100%)",
                      animation:
                        "pulseRing2-2 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      animationDelay: "0.5s",
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="absolute rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(147, 197, 253) 0%, rgb(219, 234, 254) 100%)",
                      animation:
                        "pulseRing2-3 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      animationDelay: "1s",
                    }}
                  ></div>
                </div>
                </div>
              </div>
              <div className="text-[10px] font-medium text-[#6F6F6F] text-center whitespace-nowrap">
                Upload photo & ID
              </div>
            </div>

            {/* Horizontal connector line */}
            <div className="flex items-center -mx-6" style={{ position: 'relative', height: '24px' }}>
              <div className="h-px bg-gray-300 w-full" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}></div>
            </div>

            {/* Step 3 - Pending with pulse animation */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative flex items-center justify-center">
                {/* circle */}
                <div className="w-6 h-6 bg-white border border-black rounded-full z-20 relative flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  {/* Pulse rings - expanding from black center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="absolute rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(37, 99, 235) 0%, rgb(96, 165, 250) 100%)",
                      animation:
                        "pulseRing3-1 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="absolute rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(96, 165, 250) 0%, rgb(147, 197, 253) 100%)",
                      animation:
                        "pulseRing3-2 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      animationDelay: "0.5s",
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="absolute rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgb(147, 197, 253) 0%, rgb(219, 234, 254) 100%)",
                      animation:
                        "pulseRing3-3 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      animationDelay: "1s",
                    }}
                  ></div>
                </div>
                </div>  
              </div>
              <div className="text-[10px] font-medium text-[#6F6F6F] text-center min-h-[1rem] whitespace-nowrap">
                Download ID
              </div>
            </div>
          </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-md w-full mx-auto">
                <div className="space-y-3 mb-22">
                  <label
                    htmlFor="email"
                    className="block text-sm font-400"
                    style={{ color: "#625B71" }}
                  >
                    Corporate email address{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={handleEmailChange}
                    aria-invalid={showError}
                    aria-describedby="email-error"
                    required
                    className={`w-full px-6 text-medium rounded-full bg-white focus:ring-2 focus:ring-purple-300 transition-all duration-200 ${
                      showError ? "ring-1 ring-red-500 focus:ring-red-500" : ""
                    }`}
                    style={{ border: "1px solid #4F378A", height: "54px" }}
                  />

                  <p className="text-xs mt-2 text-gray-500">
                    Make sure it's your work email
                  </p>
                  {submitted && error && (
                    <p id="email-error" className="text-sm text-red-600">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting || emailLimitLabel}
                  className="w-full bg-black text-white py-6 text-base font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin mr-2" /> Validating…
                    </>
                  ) : (
                    "Validate email"
                  )}
                </Button>
                {emailSent && (
                  <p>We've sent a verification link to {email}</p>
                )}
                {emailLimitLabel && (
                  <p>You must wait at least 1 minute before resubmitting for {email}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
