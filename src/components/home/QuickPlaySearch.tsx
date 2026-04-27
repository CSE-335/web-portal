'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Paper, Text, TextInput, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

type QuickPlayGame = {
  slug: string;
  title: string;
  thumbnailSrc: string;
};

type QuickPlaySearchProps = {
  games: QuickPlayGame[];
};

export default function QuickPlaySearch({ games }: QuickPlaySearchProps) {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const tNav = useTranslations("nav");
  const tHome = useTranslations("home");

  const query = value.trim().toLowerCase();
  const results = useMemo(
    () =>
      query
        ? games
            .filter((game) => game.title.toLowerCase().includes(query))
            .slice(0, 6)
        : [],
    [games, query],
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleSelect(slug: string) {
    setValue("");
    setIsOpen(false);
    router.push(`/games/${slug}`);
  }

  function handleSubmitSearch() {
    const exactMatch = results.find((game) => game.title.toLowerCase() === query);

    if (exactMatch) {
      handleSelect(exactMatch.slug);
      return;
    }

    setIsOpen(Boolean(query));
  }

  return (
    <Paper
      component="section"
      mb="lg"
      p={{ base: "md", md: "lg" }}
      radius={20}
      ref={rootRef}
      style={{
        background: "var(--surface-card-game)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-card)",
        position: "relative",
      }}
    >
      <Title order={2} fz={{ base: "xl", md: "h2" }} c="white">
        {tHome("quickPlayTitle")}
      </Title>
      <Text mt={4} mb="md" c="var(--text-body)">
        {tHome("quickPlayDescription")}
      </Text>

      <div style={{ position: "relative" }}>
        <TextInput
          placeholder={tNav("searchPlaceholder")}
          value={value}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(Boolean(query))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmitSearch();
            }
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          radius="xl"
          size="md"
          rightSection={<img src="/images/search.svg" alt="" aria-hidden width={20} height={20} style={{ filter: "var(--icon-filter)" }} />}
          styles={{
            input: {
              background: "var(--overlay-bg)",
              border: "1px solid var(--overlay-border)",
              color: "white",
            },
          }}
        />

        {isOpen && query && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 6,
              background: "#2a2f4e",
              border: "1px solid var(--overlay-border)",
              borderRadius: 12,
              overflow: "hidden",
              zIndex: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {results.length > 0 ? (
              results.map((game) => (
                <button
                  key={game.slug}
                  onClick={() => handleSelect(game.slug)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    width: "100%",
                    padding: "14px 20px",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                  onMouseEnter={(event) => (event.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={(event) => (event.currentTarget.style.background = "transparent")}
                >
                  <Image
                    src={game.thumbnailSrc}
                    alt={game.title}
                    width={80}
                    height={52}
                    style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                  />
                  {game.title}
                </button>
              ))
            ) : (
              <Text px="md" py="sm" c="white">
                {tHome("quickPlayNoResults")}
              </Text>
            )}
          </div>
        )}
      </div>
    </Paper>
  );
}
