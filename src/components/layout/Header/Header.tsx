"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Group } from "@mantine/core";
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
    <Group
      component="header"
      h={{ base: 56, md: 72 }}
      px={{ base: "md", md: "xl" }}
      gap="md"
      wrap="nowrap"
      className="site-header"
      style={{ background: "var(--surface-header)", position: "sticky", top: 0, zIndex: 50 }}
    >
      <Link href="/">
        <LogoBrand>
          LLNL STEM
          <br />
          Games
        </LogoBrand>
      </Link>

      <SearchBar
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      <UtilityNav
        loginModalOpened={loginModalOpened}
        setLoginModalOpened={setLoginModalOpened}
        user={user}
      />

      <LoginPopup
        opened={loginModalOpened}
        onClose={() => setLoginModalOpened(false)}
      />
    </Group>
  );
}
