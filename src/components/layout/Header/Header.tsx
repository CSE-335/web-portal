"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header
      className="sticky top-0 z-50 flex h-[70px] w-full items-center gap-4 px-4 md:h-[100px] md:px-8"
      style={{ background: "#343C61" }}
    >
      <Link href="/" className="flex shrink-0 items-center gap-3">
        <img
          src="/images/llnl-stem-logo.png"
          alt="LLNL Logo"
          className="h-9 w-10 rounded-sm object-contain md:h-[52px] md:w-[60px]"
        />
        <span
          className="hidden text-center text-sm font-extrabold leading-tight text-white sm:block md:text-[20px]"
          style={{ textShadow: "0 2px 2px rgba(37, 61, 107, 0.72)" }}
        >
          LLNL STEM
          <br />
          Games
        </span>
      </Link>

      <div className="relative mx-auto hidden max-w-xl flex-1 items-center md:flex">
        <input
          type="text"
          placeholder="Search STEM games..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-[52px] w-full rounded-[20px] px-5 pr-12 text-sm font-normal text-white placeholder-gray-400 outline-none"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
        <button className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-colors hover:text-white">
          🔍
        </button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <button className="text-gray-300 transition-colors hover:text-white md:hidden">
          🔍
        </button>

        <button
          className="flex h-[44px] w-[44px] items-center justify-center rounded-full transition-opacity hover:opacity-80 md:h-[52px] md:w-[53px]"
          style={{ background: "#585D92" }}
          aria-label="Favorites"
        >
          ♡
        </button>

        <Link
          href="/login"
          className="rounded-[20px] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 md:px-6 md:text-base"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, #1B41FF 0%, #217AFF 13.94%, #0054F0 100%)",
          }}
        >
          Log in
        </Link>
      </div>
    </header>
  );
}