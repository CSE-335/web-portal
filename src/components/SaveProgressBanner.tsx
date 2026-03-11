"use client";

import { useState } from "react";
import Link from "next/link";

export default function SaveProgressBanner() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="p-3 pb-0">
      <div className="flex flex-col items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#234BFF_0%,#238BFF_100%)] px-4 py-3 text-center text-sm font-semibold text-white sm:flex-row">
        <span>Don&apos;t lose your progress</span>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex rounded-full border border-white/70 bg-transparent px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Log in
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#1F4DCC] transition hover:bg-white/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}