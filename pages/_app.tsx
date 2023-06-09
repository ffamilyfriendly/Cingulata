import { Client } from '@/lib/api/client'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import { Inter } from 'next/font/google'
import { Dock } from '.'
const inter = Inter({ subsets: ['latin'] })

const client = new Client()

export { client }

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <Component {...pageProps} />
      <Dock items={ [
        { icon: "home", href: "/", label: "Home", selected: true },
        { icon: "search", href: "/search", label: "search" },
        { icon: "cog", href: "/settings", label: "Settings" }
      ] } />
    </div>
  )
}
