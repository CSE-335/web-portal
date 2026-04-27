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
