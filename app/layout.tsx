import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '問題集計システム',
  description: '選択式問題の集計システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
