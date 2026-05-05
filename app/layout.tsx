import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Nimboo — Il libro giusto per come ti senti',
  description:
    'Nimboo ti raccomanda un solo libro in base a come ti senti adesso. Non generi, non liste — solo il libro giusto per te, in questo momento.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-ink font-body min-h-screen flex flex-col">
          {children}
          <Footer />
        </body>
    </html>
  )
}
