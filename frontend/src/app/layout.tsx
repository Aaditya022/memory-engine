import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Memory Engine — The Organizational Brain for Enterprise AI',
  description:
    'Memory Engine is the category-defining Enterprise Memory Platform. Powered by Cognee, it transforms every source of organizational knowledge into a connected, searchable, permanently accessible intelligence layer.',
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'Memory Engine — The Organizational Brain for Enterprise AI',
    description:
      'Every decision, conversation, and document becomes permanently queryable. The brain your enterprise never had.',
    type: 'website',
  },
}

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('theme') || 'dark';
    var d = document.documentElement;
    if (t === 'dark') d.classList.add('dark');
    else d.classList.remove('dark');
    d.style.colorScheme = t;
  } catch(e){}
})()
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
