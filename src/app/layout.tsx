import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import PageTransition from '@/components/PageTransition'

const inter = Inter({ subsets: ['latin'] })
const siteDescription = '撮りたいもの・カメラ・予算から、あなたに合うレンズを案内します。'

export const metadata: Metadata = {
  metadataBase: new URL('https://lensnavi.app'),
  title: {
    default: 'Lens Navi | レンズ選びのAIナビ',
    template: '%s | Lens Navi',
  },
  description: siteDescription,
  applicationName: 'Lens Navi',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lens Navi | レンズ選びのAIナビ',
    description: siteDescription,
    url: 'https://lensnavi.app',
    siteName: 'Lens Navi',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Lens Navi | レンズ選びのAIナビ',
    description: siteDescription,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  )
}
