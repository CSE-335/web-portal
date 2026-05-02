"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "@mantine/hooks";
import { Group, Burger, Drawer, Stack, Box, Button, Divider } from "@mantine/core";
import LogoBrand from "@/components/layout/LogoBrand";
import UtilityNav from "./UtilityNav/UtilityNav";
import LoginPopup from "@/components/LoginPopup";
import { supabase } from "@/lib/supabase/client";
import { ensureUserProfile, signOutUser } from "@/lib/supabase/auth";
import type { User } from "@supabase/supabase-js";

const MOBILE_MENU_LINKS = [
  { key: "aboutUs" as const, href: "/about" },
  { key: "contactUs" as const, href: "/contact" },
  { key: "privacy" as const, href: "/privacy" },
  { key: "feedback" as const, href: "/feedback" },
];

export default function Header() {
  const tFooter = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tProfile = useTranslations("profile");
  const [loginModalOpened, setLoginModalOpened] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mobileNavOpened, setMobileNavOpened] = useState(false);
  /**
   * Mobile-first default: `useMediaQuery` otherwise starts false until the effect runs,
   * which forces desktop-sized nav on phones and breaks the logged-in bar (xl icons + avatar).
   * Align with Mantine `hiddenFrom="md"` (62em).
   */
  const isBelowMd = useMediaQuery("(max-width: 61.99em)", true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUser(data.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          ensureUserProfile();
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Group
        component="header"
        h={{ base: 56, md: 72 }}
        px={{ base: "md", md: "xl" }}
        gap="md"
        wrap="nowrap"
        justify="space-between"
        className="site-header"
        style={{ background: "var(--surface-header)", position: "sticky", top: 0, zIndex: 50 }}
      >
        <Link href="/" style={{ display: "inline-flex", flexShrink: 0 }}>
          <LogoBrand>
            LLNL STEM
            <br />
            Games
          </LogoBrand>
        </Link>

        <Group
          gap="sm"
          wrap="nowrap"
          align="center"
          justify="flex-end"
          flex={1}
          miw={0}
          style={{ minWidth: 0 }}
        >
          <UtilityNav
            loginModalOpened={loginModalOpened}
            setLoginModalOpened={setLoginModalOpened}
            user={user}
            density={isBelowMd ? "mobile" : "desktop"}
          />

          <Box hiddenFrom="md" style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
            <Burger
              opened={mobileNavOpened}
              onClick={() => setMobileNavOpened((opened) => !opened)}
              aria-label="Toggle navigation"
              color="white"
              size="md"
            />
          </Box>
        </Group>
      </Group>

      <Drawer
        opened={mobileNavOpened}
        onClose={() => setMobileNavOpened(false)}
        title="Menu"
        position="right"
        padding="md"
        size="100%"
        hiddenFrom="md"
      >
        <Stack component="nav" gap="sm" aria-label="Site">
          {MOBILE_MENU_LINKS.map((link) => (
            <Button
              key={link.key}
              component={Link}
              href={link.href}
              variant="default"
              fullWidth
              size="md"
              onClick={() => setMobileNavOpened(false)}
              styles={{
                root: {
                  background: "var(--surface-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                },
              }}
            >
              {tFooter(`links.${link.key}`)}
            </Button>
          ))}

          <Divider my="xs" color="var(--border-color)" />

          {user ? (
            <>
              <Button
                component={Link}
                href="/profile"
                variant="default"
                fullWidth
                size="md"
                onClick={() => setMobileNavOpened(false)}
                styles={{
                  root: {
                    background: "var(--surface-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  },
                }}
              >
                {tProfile("menuProfile")}
              </Button>
              <Button
                component={Link}
                href="/profile?tab=liked"
                variant="default"
                fullWidth
                size="md"
                onClick={() => setMobileNavOpened(false)}
                styles={{
                  root: {
                    background: "var(--surface-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  },
                }}
              >
                {tNav("favorites")}
              </Button>
              <Button
                fullWidth
                size="md"
                variant="light"
                color="red"
                onClick={async () => {
                  await signOutUser();
                  setMobileNavOpened(false);
                }}
              >
                {tProfile("menuLogOut")}
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              size="md"
              onClick={() => {
                setMobileNavOpened(false);
                setLoginModalOpened(true);
              }}
              styles={{
                root: {
                  background: "var(--surface-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                },
              }}
            >
              {tNav("logIn")}
            </Button>
          )}
        </Stack>
      </Drawer>

      <LoginPopup
        opened={loginModalOpened}
        onClose={() => setLoginModalOpened(false)}
      />
    </>
  );
}
