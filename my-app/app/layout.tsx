import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Energy Consumption - US City Energy Optimizer",
  description:
    "Explore and optimize energy consumption patterns across US cities with interactive data visualizations and insights.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} antialiased`}
        style={{
          fontFamily:
            '-apple-system, system-ui, "SF Pro Display", "SF Pro Text", Inter, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
