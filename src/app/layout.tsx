import type { Metadata, Viewport } from "next";
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
import FriendsPresenceSync from "@/components/FriendsPresenceSync";

import { defaultTheme } from "@/themes/default";

export const metadata: Metadata = {
  title: "LLNL STEM Games",
  description: "Educational STEM games from Lawrence Livermore National Laboratory",
  applicationName: "LLNL STEM Games",
  appleWebApp: {
    capable: true,
    title: "LLNL STEM Games",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [{ url: "/images/llnl-stem-logo.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#23233a" },
    { media: "(prefers-color-scheme: light)", color: "#003087" },
  ],
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
            <FriendsPresenceSync />
            <Header />
            <Container mih="100dvh" px={{ base: "xs", sm: "md" }} py={{ base: "sm", md: "md" }}>
              {children}
            </Container>
            <Footer />
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
