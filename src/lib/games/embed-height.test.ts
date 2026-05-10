import { resolveEmbedHeights } from "./embed-height";

describe("resolveEmbedHeights", () => {
  it("treats circuit-breaker like any fixed-pixel game when embedHeight is set", () => {
    const { desktop, mobile } = resolveEmbedHeights({
      slug: "circuit-breaker",
      embedHeight: "800px",
    });
    expect(desktop).toBe("800px");
    expect(mobile).toContain("min(800px");
    expect(mobile).toContain("100dvh");
  });

  it("caps fixed px heights on mobile", () => {
    const { desktop, mobile } = resolveEmbedHeights({
      slug: "bridge-snap",
      embedHeight: "750px",
    });
    expect(desktop).toBe("750px");
    expect(mobile).toContain("min(750px");
    expect(mobile).toContain("100dvh");
  });

  it("replaces nested 100vh with dvh-safe clamps", () => {
    const { desktop, mobile } = resolveEmbedHeights({
      slug: "stellar-odyssey",
      embedHeight: "100vh",
    });
    expect(desktop).toContain("100dvh");
    expect(mobile).toContain("calc(100dvh - 200px)");
  });

  it("defaults when embedHeight missing", () => {
    const { desktop, mobile } = resolveEmbedHeights({
      slug: "unknown-slug",
      embedHeight: undefined,
    });
    expect(desktop).toContain("68dvh");
    expect(mobile).toContain("92dvh");
  });
});
