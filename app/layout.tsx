import ErrorBoundary from '@/components/ErrorBoundary'
import { Navigation } from '@/components/Navigation'
import { Toaster } from '@/components/ui/toaster'
import ConvexClerkProvider from '@/providers/ConvexClerkProvider'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Auto Detail SaaS',
  description: 'Dynamic pricing and self-assessment for auto detailing businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConvexClerkProvider>
      <script src="https://cdn.amplitude.com/script/process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY.js" />
      <head>
        <div>
          <html lang="en" className="h-full bg-gray-100">
            <ClerkProvider>
              <body className="h-full">
                <ErrorBoundary>
                  <div className="min-h-full">
                    <div className="bg-gray-800 pb-32">
                      <header />
                      <Navigation />
                    </div>
                    <main className="-mt-32">
                      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
                          {children}
                        </div>
                      </div>
                    </main>
                  </div>
                  <Toaster />
                </ErrorBoundary>
              </body>
            </ClerkProvider>
          </html>
        </div>
      </head>
    </ConvexClerkProvider >
  )
}
