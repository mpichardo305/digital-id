"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Shield, Zap, Key, Mail, Download, User, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useEmailValidation } from "@/hooks/use-email-validation";
import { useRouter } from "next/navigation";


export default function HomePage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { email, isValid, isCorporate, error, submitted, setSubmitted, handleEmailChange } =
  useEmailValidation("");
  const showError = submitted && Boolean(error);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);

    if (!isValid || !isCorporate || submitting) return;

    try {
      setSubmitting(true);
      // await for Resend api shows successful 
      router.push(`/check-email`);
    } catch (err: any) {
      setFormError(err?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
          className="sticky top-0 z-50 w-full bg-gray-50 px-4 sm:px-4 md:px-6 py-12 md:static md:top-auto md:z-auto"
        >
      <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl bg-white ring-1 ring-gray-200 px-3 sm:px-3 md:px-3 py-3 md:bg-transparent md:ring-0 md:rounded-none">
          {/* Logo */}
          <div className="flex flex-col items-start">
            <Link href="#">
              <Image src="/digital-id-logo.png" alt="Digital ID" width={48} height={48} priority />
            </Link>
            <span className="mt-1 text-sm font-bold text-black">Digital ID</span>
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-50 bg-black/30 transition-opacity md:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <nav
            id="mobile-menu"
            className={`fixed top-0 right-0 z-[60] h-full w-80 max-w-[85%] bg-white shadow-2xl ring-1 ring-gray-200 transition-transform md:hidden
            ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex items-center justify-between p-4">
              <span className="text-base font-semibold">Digital ID</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 ring-1 ring-gray-200 bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 py-2 space-y-2">
              <a href="#why-use" onClick={() => setMobileOpen(false)}className="block rounded-lg px-3 py-2 hover:bg-gray-50">Why use Digital IDs</a>
              <a href="#benefits" onClick={() => setMobileOpen(false)}className="block rounded-lg px-3 py-2 hover:bg-gray-50">Benefits</a>
              <a href="#signup" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-gray-50">Try Digital ID</a>
              <a href="#" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-gray-50">Check my status</a>
            </div>
          </nav>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 py-3 px-6 bg-gray-50/10 backdrop-blur-md rounded-full fixed top-16 right-[max(1rem,calc((100vw-80rem)/2))] z-50">
            <a href="#why-use" className="text-black hover:text-gray-600 font-medium">
                Why use Digital IDs
              </a>
              <a href="#benefits" className="text-black hover:text-gray-600 font-medium">
                Benefits
              </a>
              <a href="#signup" className="text-black hover:text-gray-600 font-medium">
                Try Digital ID
              </a>
              <a href="#" className="text-black hover:text-gray-600 font-medium">
                Check my status
              </a>
          </nav>
        </div>
      </header>

    <section className="hero-section w-full py-10 relative pt-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left Content - More breathing room */}
            <div className="space-y-6 md:space-y-10 relative z-10 pl-4 md:pl-8 order-1 lg:order-1">
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
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-4 flex items-center justify-between shadow-sm">
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
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-4 flex items-center justify-between shadow-sm">
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
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-4 flex items-center justify-between shadow-sm">
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
                className="bg-black text-white text-base font-medium hover:bg-gray-800 transition-colors shadow-lg w-[184px] h-[52px] rounded-[36px] py-[14px] px-4"
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
              className="flex justify-center lg:justify-center relative z-10 order-2 lg:order-2"
              style={{
                filter: "drop-shadow(0 0 25px rgba(147, 51, 234, 0.06))",
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

          <div className="text-left mt-16 md:mt-20 pt-12 md:pt-16 relative z-10 px-4 md:px-6">
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
      <section id="why-use" className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-left mb-8 md:mb-16">
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
        </div>

        <div className="space-y-8 md:grid md:grid-cols-3 md:gap-12 md:space-y-0 mb-12 md:mb-16">
          {/* Unified Access Card */}
          <div className="text-left space-y-4 md:space-y-6 border-b border-gray-100 pb-8 md:border-b-0 md:pb-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center">
              <Key className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
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
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
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
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
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

        {/* CTA Button */}
        <div className="text-center">
          <Button
            className="bg-black text-white text-base font-medium hover:bg-gray-800 transition-colors py-6 w-[202px] h-[56px] rounded-[36px] p-4 opacity-100"
          >
            Try Digital ID
          </Button>
        </div>
      </section>

      {/* Digital Transformation Section */}
      <section
        id="benefits"
        className="px-4 md:px-6 py-12 md:py-20"
        style={{ backgroundColor: "#F9FAFB" }}
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
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Content - Order 2 on mobile, 1 on desktop */}
            <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
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
                  className="w-[550px] h-[385px] md:h-[480px] object-cover object-top"
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
        <div className="max-w-2xl mx-auto">
          {/* White Modal Container */}
          <div
            className="bg-white rounded-2xl p-8 md:p-12"
            style={{
              filter: "drop-shadow(0 0 25px rgba(147, 51, 234, 0.06))",
            }}
          >
            <div className="text-center space-y-8">
            <h2 className="text-black whitespace-nowrap text-xl">
              Get your first Digital ID for FREE
            </h2>

          {/* Horizontal Progress Steps */}
          <div className="grid grid-cols-5 items-start py-8 max-w-md mx-auto">
            {/* Step 1 - Completed */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center relative z-10">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
                Verify email address
              </div>
            </div>

            {/* Horizontal connector line */}
            <div className="flex items-center -mx-6">
              <div className="h-px bg-gray-300 w-full mt-4"></div>
            </div>

            {/* Step 2 - Current with pulse animation */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative flex items-center justify-center">
                {/* Black filled center circle */}
                <div className="w-8 h-8 bg-white border border-black rounded-full z-20 relative flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
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
              <div className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
                Upload photo & ID
              </div>
            </div>

            {/* Horizontal connector line */}
            <div className="flex items-center -mx-6">
              <div className="h-px bg-gray-300 w-full mt-4"></div>
            </div>

            {/* Step 3 - Pending with pulse animation */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative flex items-center justify-center">
                {/* circle */}
                <div className="w-8 h-8 bg-white border border-black rounded-full z-20 relative flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
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
              <div className="text-xs font-medium text-gray-700 text-center min-h-[1rem] whitespace-nowrap">
                Download ID
              </div>
            </div>
          </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-md w-full mx-auto">
                <div className="space-y-3">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium"
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
                    className={`w-full px-6 py-4 text-medium rounded-full bg-white focus:ring-2 focus:ring-purple-300 transition-all duration-200 ${
                      showError ? "ring-1 ring-red-500 focus:ring-red-500" : ""
                    }`}
                    style={{ border: "1px solid #4F378A" }}
                  />

                  <p className="text-xs mt-2" style={{ color: "#485057" }}>
                    Make sure it's your work email
                  </p>
                  {submitted && error && (
                    <p id="email-error" className="text-sm text-red-600">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white py-6 text-base font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {submitting ? "Validating…" : "Validate email"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 mt-12 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col items-center space-y-4">
        {/* Center Logo */}
            <div className="flex flex-col items-start">
            <Link href="#">
              <Image src="/digital-id-logo.png" alt="Digital ID" width={48} height={48} priority />
            </Link>
            </div>

            {/* Copyright */}
            <div className="text-xs md:text-sm text-gray-500">
              © 2025 Digital ID. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
