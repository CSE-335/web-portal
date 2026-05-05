import type { CSSProperties } from "react";

const fontFamily = "var(--font-alexandria), sans-serif";

export const pageTheme = {
  font: {
    fontFamily,
  },
  shell: {
    background: "var(--app-bg-gradient)",
    minHeight: "100vh",
    paddingTop: "40px",
    paddingBottom: "60px",
  },
  title: {
    color: "var(--text-primary)",
    fontFamily,
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
  sectionTitle: {
    color: "var(--text-primary)",
    fontFamily,
    fontSize: "22px",
    fontWeight: 700,
    marginTop: "8px",
  },
  subTitle: {
    color: "var(--text-secondary)",
    fontFamily,
    fontSize: "17px",
    fontWeight: 700,
  },
  body: {
    color: "var(--text-body)",
    fontFamily,
    fontSize: "16px",
    lineHeight: "1.7",
  },
  list: {
    color: "var(--text-body)",
    fontFamily,
    fontSize: "16px",
  },
  divider: {
    borderColor: "var(--app-divider-color)",
    margin: "8px 0",
  },
  card: {
    backgroundColor: "var(--surface-primary)",
    border: "1px solid var(--card-border)",
    boxShadow: "var(--shadow-card)",
  },
  panel: {
    backgroundColor: "var(--surface-primary)",
    border: "1px solid var(--card-border)",
    borderRadius: "10px",
    boxShadow: "var(--shadow-card)",
  },
  strong: {
    color: "var(--text-primary)",
  },
  link: {
    color: "var(--link-color)",
    textDecoration: "none",
    fontWeight: 500,
  },
  inputLabel: {
    fontFamily,
    fontWeight: 500,
    fontSize: "16px",
    color: "var(--text-primary)",
    marginBottom: "6px",
  },
  optionalText: {
    color: "var(--text-secondary)",
    fontWeight: 400,
    fontSize: "13px",
  },
  primaryButton: {
    background: "var(--button-primary-bg)",
    borderRadius: "20px",
    color: "var(--button-primary-text)",
    fontFamily,
    fontWeight: 700,
    fontSize: "15px",
    border: "none",
  },
} satisfies Record<string, CSSProperties>;

export const themedInputStyles = {
  wrapper: {
    borderRadius: "10px",
    background: "var(--input-wrapper-bg)",
    border: "var(--input-wrapper-border)",
  },
  input: {
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    border: "none",
    height: "46px",
    fontSize: "15px",
    fontFamily,
    fontWeight: 400,
    paddingLeft: "20px",
  },
};

export const themedTextareaStyles = {
  wrapper: {
    borderRadius: "10px",
    background: "var(--input-wrapper-bg)",
    border: "var(--input-wrapper-border)",
  },
  input: {
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    border: "none",
    fontSize: "15px",
    fontFamily,
    fontWeight: 400,
    padding: "14px 20px",
  },
};

/** About / Contact / Privacy / Feedback — one shell, cards, and type scale (light + dark via CSS vars) */
export const staticInfoPageShell: CSSProperties = {
  backgroundColor: "var(--about-wrapper-bg)",
  borderRadius: "16px",
  minHeight: "100vh",
  paddingTop: "max(3rem, env(safe-area-inset-top, 0px))",
  paddingBottom: "max(4.5rem, env(safe-area-inset-bottom, 0px))",
  paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
  paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
};

/** Scales down on phones; caps at ~48px on large screens */
export const staticInfoPageTitle: CSSProperties = {
  color: "var(--about-text)",
  fontSize: "clamp(1.625rem, 4vw + 1rem, 3rem)",
  fontWeight: 600,
  lineHeight: 1.12,
  marginBottom: "10px",
  letterSpacing: "-0.5px",
};

/** Padding inside cards — replaces responsive p= prop for TS-safe mobile/desktop rhythm */
export const staticInfoCardPadding = "clamp(1rem, 2.5vw + 0.5rem, 2rem)";

/** Stack gaps between major blocks */
export const staticInfoBlockGap = "clamp(1.25rem, 2.8vw, 2rem)";

/** Card surface — add `padding: staticInfoCardPadding` in the style prop */
export const staticInfoCardSurface: CSSProperties = {
  backgroundColor: "var(--about-container-bg)",
  border: "2px solid var(--about-border-strong)",
};

export const staticInfoSectionTitle: CSSProperties = {
  color: "var(--about-text)",
  fontSize: "clamp(1.05rem, 2vw + 0.65rem, 1.25rem)",
  fontWeight: 600,
};

export const staticInfoSubSectionTitle: CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: "clamp(0.95rem, 1.5vw + 0.65rem, 1.0625rem)",
  fontWeight: 600,
};

export const staticInfoBody: CSSProperties = {
  color: "var(--about-text)",
  fontSize: "clamp(1rem, 1.2vw + 0.875rem, 1.125rem)",
  lineHeight: 1.7,
};

export const staticInfoList: CSSProperties = {
  color: "var(--about-text)",
  fontSize: "clamp(0.9375rem, 1vw + 0.8rem, 1rem)",
};

export const staticInfoLabel: CSSProperties = {
  fontFamily,
  fontWeight: 500,
  fontSize: "clamp(0.875rem, 1.2vw + 0.7rem, 1rem)",
  color: "var(--about-text)",
  marginBottom: "6px",
};

export const staticInfoOptional: CSSProperties = {
  color: "var(--text-secondary)",
  fontWeight: 400,
  fontSize: "13px",
};
