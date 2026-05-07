'use client';
import { useTranslations } from 'next-intl';
import Image from "next/image";
import Link from "next/link";
import { Stack, Group, Text } from "@mantine/core";

export default function Footer() {
  const t = useTranslations('footer');

  const footerLinks = [
    { key: 'allGames' as const, href: "/" },
    { key: 'aboutUs' as const, href: "/about" },
    { key: 'contactUs' as const, href: "/contact" },
    { key: 'privacy' as const, href: "/privacy" },
    { key: 'feedback' as const, href: "/feedback" },
  ];

  return (
    <Stack
      component="footer"
      className="site-footer"
      align="center"
      gap="xs"
      px="md"
      pt={20}
      pb={16}
      style={{ background: "var(--surface-header)" }}
    >
      <Image
        src="/images/llnl-stem-logo.png"
        alt="LLNL STEM Games Logo"
        width={64}
        height={64}
        className="h-auto object-contain"
      />

      <Group component="nav" justify="center" gap="md" wrap="wrap">
        {footerLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="text-xs font-medium no-underline transition-colors md:text-sm"
            style={{ color: "var(--text-footer-link)" }}
          >
            {t(`links.${link.key}`)}
          </Link>
        ))}
      </Group>

      <Text
        ta="center"
        maw={720}
        fz={{ base: 11, md: 13 }}
        lh={1.5}
        c="var(--text-secondary)"
      >
        {t('description')}
      </Text>
    </Stack>
  );
}
