import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Lead Generator Dashboard',
  description: 'Automatisch leads genereren voor Webdesign & SEO diensten',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="ml-60 flex-1 p-6 min-h-screen bg-slate-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
