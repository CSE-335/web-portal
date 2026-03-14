import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, Container, mantineHtmlProps } from '@mantine/core';
import '@mantine/core/styles.css';
import '../styles/globals.css'
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { ALT_PAGE_BACKGROUND_GRADIENT } from "@/constants/layout";
import { defaultTheme } from "@/themes/default";

export const metadata: Metadata = {
  title: "LLNL STEM Games",
  description: "Educational STEM games from Lawrence Livermore National Laboratory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="dark" />
      </head>
      <body
        className='antialiased min-h-screen'
        style={{ background: ALT_PAGE_BACKGROUND_GRADIENT }}
      >
        <MantineProvider theme={defaultTheme} forceColorScheme="dark">
          <Header />
          <Container mih="100vh">
            {children}
          </Container>
          <Footer />
        </MantineProvider>
      </body>
    </html>
  );
}
