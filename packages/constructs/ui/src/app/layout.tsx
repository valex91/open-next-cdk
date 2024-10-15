import type { Metadata } from 'next'
import './globals.css'

import { Roboto, Montserrat } from 'next/font/google';
import { getServerSession } from 'next-auth';
import NextAuthProvider from './_lib/components/NextAuthProvider';
import { authOptions } from '@/authOptions';

const roboto = Roboto({
  weight: ['100', '400', '700'],
  subsets: ['latin'],
  variable: '--font-roboto'
});

const monserrat = Montserrat({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-monserrat'
})

export const metadata: Metadata = {
  title: 'test',
  description: 'description',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);


  return (
    <html lang="en" className='dark'>
      <body className={`${roboto.variable} ${monserrat.variable} bg-gradient-to-r from-jade-300 via-jade-200 to-jade-300`}>
        <NextAuthProvider session={session}>
          {children}
        </NextAuthProvider>
        </body>
    </html>
  )
}
