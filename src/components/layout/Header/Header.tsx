"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Group, Burger, Drawer, Stack, Box } from "@mantine/core";
import LogoBrand from "@/components/layout/LogoBrand";
import SearchBar from "./SearchBar";
import UtilityNav from "./UtilityNav/UtilityNav";
import LoginPopup from "@/components/LoginPopup";
import { supabase } from "@/lib/supabase/client";
import { ensureUserProfile } from "@/lib/supabase/auth";
import type { User } from "@supabase/supabase-js";


export default function Header() {
  const [searchValue, setSearchValue] = useState("");
  const [loginModalOpened, setLoginModalOpened] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mobileNavOpened, setMobileNavOpened] = useState(false);

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

        <Box hiddenFrom="md" style={{ position: "relative", zIndex: 2, pointerEvents: "auto" }}>
          <Burger
            opened={mobileNavOpened}
            onClick={() => setMobileNavOpened((opened) => !opened)}
            aria-label="Toggle navigation"
            color="white"
            size="md"
          />
        </Box>

        <Group visibleFrom="md" flex={1} wrap="nowrap" gap="md">
          <SearchBar
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSelect={() => setSearchValue("")}
          />

          <UtilityNav
            loginModalOpened={loginModalOpened}
            setLoginModalOpened={setLoginModalOpened}
            user={user}
          />
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
        <Stack gap="md">
          <SearchBar
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSelect={() => {
              setSearchValue("");
              setMobileNavOpened(false);
            }}
          />
          <UtilityNav
            loginModalOpened={loginModalOpened}
            setLoginModalOpened={setLoginModalOpened}
            user={user}
            compact
          />
        </Stack>
      </Drawer>

      <LoginPopup
        opened={loginModalOpened}
        onClose={() => setLoginModalOpened(false)}
      />
    </>
  );
}
