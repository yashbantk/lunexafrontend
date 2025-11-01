import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ApolloProviderWrapper } from '@/components/providers/ApolloProviderWrapper'
import ScrollPositionProvider from '@/components/ScrollPositionProvider'
import { Navigation } from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deyor - Premium Travel Proposals',
  description: 'Create stunning travel proposals and itineraries for your clients with our premium platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ApolloProviderWrapper>
            <AuthProvider>
              <ScrollPositionProvider>
                <Navigation />
                {children}
              </ScrollPositionProvider>
            </AuthProvider>
          </ApolloProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  )
}
