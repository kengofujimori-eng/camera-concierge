import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import PageTransition from '@/components/PageTransition'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Camera Concierge | カメラ・レンズ相談',
  description: 'AIがあなたの撮影シーンに最適なカメラ・レンズをご提案します',
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
