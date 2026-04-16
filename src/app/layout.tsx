import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, Container, mantineHtmlProps } from '@mantine/core';
import { Alexandria, Roboto } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import '@mantine/core/styles.css';
import '../styles/globals.css'

const alexandria = Alexandria({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-alexandria',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-roboto',
});
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";

import { defaultTheme } from "@/themes/default";

export const metadata: Metadata = {
  title: "LLNL STEM Games",
  description: "Educational STEM games from Lawrence Livermore National Laboratory",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr" {...mantineHtmlProps} className={`${alexandria.variable} ${roboto.variable}`}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body
        suppressHydrationWarning
        className='antialiased min-h-screen'
        style={{ background: 'var(--app-bg-gradient)' }}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MantineProvider theme={defaultTheme} defaultColorScheme="dark">
            <Header />
            <Container mih="100vh">
              {children}
            </Container>
            <Footer />
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
