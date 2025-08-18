import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"

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
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}