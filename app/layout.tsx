import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import SiteHeader from "@/components/my-components/site-header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import SiteFooter from "@/components/my-components/site-footer"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-poppins",
})


const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === 'production'
    ? 'https://digital-id-app.vercel.app' // Update this to your actual domain
    : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Digital ID",
  description: "Your home for digitizing your workforce access control keys",
  openGraph: {
    title: "Digital ID",
    description: "Your home for digitizing your workforce access control keys",
    url: baseUrl,
    images: [
      {
        url: "/cornerstone-dig-transf.png", // Create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: "Digital ID",
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital ID",
    description: "Your home for digitizing your workforce access control keys",
    images: ["/cornerstone-dig-transf.png"],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-gray-50"> {/* Add your preferred background color */}
      <div className="relative min-h-screen flex flex-col">
          {/* ✅ Reusable header on every page */}
          <SiteHeader
            rightSlot={
              <Link href="#signup">
                <Button className="bg-black text-white rounded-full px-4 py-2 hover:bg-gray-800">
                  Try Digital ID
                </Button>
              </Link>
            }
          />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}