"use client";

import { useState } from "react";
import Link from "next/link";
import { Group } from "@mantine/core";
import LogoBrand from "@/components/layout/LogoBrand";
import SearchBar from "./SearchBar";
import UtilityNav from "./UtilityNav/UtilityNav";
import LoginPopup from "@/components/LoginPopup";


export default function Header() {
  const [searchValue, setSearchValue] = useState("");
  const [loginModalOpened, setLoginModalOpened] = useState(false);

  return (
    <Group
      component="header"
      h={{ base: 70, md: 100 }}
      px={{ base: "md", md: "xl" }}
      gap="md"
      wrap="nowrap"
      style={{ background: "#343C61", position: "sticky", top: 0, zIndex: 50 }}
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
      />

      <LoginPopup
        opened={loginModalOpened}
        onClose={() => setLoginModalOpened(false)}
      />
    </Group>
  );
}
