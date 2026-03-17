"use client";

import Image from "next/image";
import Link from "next/link";
import { Stack, Group, Text } from "@mantine/core";

const footerLinks = [
  { label: "ALL GAMES", href: "/games" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT US", href: "/contact" },
  { label: "PRIVACY", href: "/privacy" },
  { label: "FEEDBACK", href: "/feedback" },
];

export default function Footer() {
  return (
    <Stack
      component="footer"
      align="center"
      gap="md"
      px="md"
      pt={40}
      pb={32}
      style={{ background: "#343C61" }}
    >
      <Image
        src="/images/llnl-stem-logo.png"
        alt="LLNL STEM Games Logo"
        width={100}
        height={100}
        className="h-auto object-contain"
      />

      {/*footer links*/}
      <Group component="nav" justify="center" gap="lg">
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm font-medium text-[#FBE7E7] no-underline transition-colors hover:text-white md:text-base"
          >
            {link.label}
          </Link>
        ))}
      </Group>

      <Text
        ta="center"
        maw={896}
        fz={{ base: 13, md: 15 }}
        lh={1.6}
      >
        Welcome to Lawrence Livermore National Laboratory STEM game web portal.
        Enjoy our library of educational STEM games which could be played on
        phones, tablets, and PC with no downloads necessary. If you&apos;re
        struggling with the concepts, ensure to use the AI features for
        assistance.
      </Text>
    </Stack>
  );
}
