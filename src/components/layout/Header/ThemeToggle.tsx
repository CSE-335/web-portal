'use client';
import { useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { useTranslations } from "next-intl";

function SunIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#f59e0b" : "rgba(255,255,255,0.4)"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "stroke 0.3s ease" }}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={active ? "rgba(180,195,230,0.6)" : "none"}
      stroke={active ? "#a0b4d8" : "#9ca3af"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "stroke 0.3s ease, fill 0.3s ease" }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const t = useTranslations("nav");
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", { getInitialValueInEffect: true });
  const isDark = computedColorScheme === "dark";
  const label = t("toggleTheme");

  return (
    <span className="nav-tooltip" data-tooltip={label}>
      <button
        onClick={() => setColorScheme(isDark ? "light" : "dark")}
        aria-label={label}
        style={{
          position: "relative",
          width: "68px",
          height: "34px",
          borderRadius: "17px",
          border: "none",
          cursor: "pointer",
          padding: 0,
          background: isDark
            ? "rgba(0,0,0,0.35)"
            : "rgba(0,0,0,0.2)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)",
          transition: "background 0.3s ease",
          flexShrink: 0,
        }}
      >
      {/* Sun icon */}
      <span style={{
        position: "absolute",
        left: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      }}>
        <SunIcon active={!isDark} />
      </span>

      {/* Moon icon */}
      <span style={{
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      }}>
        <MoonIcon active={isDark} />
      </span>

      {/* Knob */}
        <span style={{
          position: "absolute",
          top: "3px",
          left: isDark ? "calc(100% - 31px)" : "3px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
          transition: "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 2,
        }} />
      </button>
    </span>
  );
}
