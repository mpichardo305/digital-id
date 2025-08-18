// components/site-header.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

type NavItem = { href: string; label: string };

type Props = {
  logoSrc?: string;
  logoAlt?: string;
  brand?: string;
  nav?: NavItem[];
  className?: string;
};

export default function SiteHeader({
  logoSrc = "/digital-id-logo.png",
  logoAlt = "Digital ID",
  brand = "Digital ID",
  nav = [
    { href: "#why-use", label: "Why use Digital IDs" },
    { href: "#benefits", label: "Benefits" },
    { href: "#signup", label: "Try Digital ID" },
    { href: "#", label: "Check my status" },
  ],
  className = "",
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => setMobileOpen(v => !v), []);
  const close = useCallback(() => setMobileOpen(false), []);

  // Close on route / query changes
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search?.toString()]);

  // ESC to close
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, close]);

  // Prevent background scroll when open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <header className={`sticky top-0 z-50 w-full bg-gray-50 px-4 sm:px-4 md:px-6 py-12 md:static md:top-auto md:z-auto ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl bg-white ring-1 ring-gray-200 px-3 sm:px-3 md:px-3 py-3 md:bg-transparent md:ring-0 md:rounded-none">
          {/* Logo + brand */}
          <div className="flex flex-col items-start">
            <Link href="/">
              <Image src={logoSrc} alt={logoAlt} width={48} height={48} priority />
            </Link>
            <span className="mt-1 text-sm font-bold text-black">{brand}</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8 py-3 px-6 bg-gray-50/10 backdrop-blur-md rounded-full">
            {nav.map(item => (
              <Link key={item.href} href={item.href} className="text-black hover:text-gray-600 font-medium">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors z-[70]"
            onClick={toggle}
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/30 transition-opacity md:hidden"
          onClick={close}
        />
      )}

      {/* Mobile panel */}
      <nav
        id="mobile-menu"
        className={`fixed top-0 right-0 z-[60] h-full w-80 max-w-[85%] bg-white shadow-2xl ring-1 ring-gray-200 transition-transform md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-base font-semibold">{brand}</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="rounded-lg p-2 ring-1 ring-gray-200 bg-white hover:bg-gray-50 transition-colors z-[70]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-2 space-y-2">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="block rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}