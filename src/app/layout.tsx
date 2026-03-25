import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quineo — Gestion de loto associatif',
  description: 'Application de gestion de loto pour les associations',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
