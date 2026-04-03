const adjectives = [
  "Cosmic", "Quantum", "Stellar", "Atomic", "Cyber", "Neon", "Solar",
  "Lunar", "Crystal", "Pixel", "Turbo", "Hyper", "Ultra", "Mega",
  "Swift", "Clever", "Brave", "Bold", "Bright", "Noble", "Sharp",
  "Keen", "Vivid", "Epic", "Lucky", "Mighty", "Rapid", "Silent",
];

const nouns = [
  "Phoenix", "Dragon", "Falcon", "Panda", "Tiger", "Otter", "Fox",
  "Wolf", "Hawk", "Bear", "Owl", "Lynx", "Raven", "Dolphin",
  "Comet", "Nebula", "Photon", "Quasar", "Proton", "Neutron",
  "Spark", "Blaze", "Storm", "Frost", "Wave", "Echo", "Pulse",
];

/**
 * Generates a fun random username like "CosmicPhoenix42"
 * Deterministic when given the same seed string (e.g. user id).
 */
export function generateUsername(seed?: string): string {
  let hash = 0;
  if (seed) {
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
  } else {
    hash = Math.floor(Math.random() * 1_000_000);
  }

  const abs = Math.abs(hash);
  const adj = adjectives[abs % adjectives.length];
  const noun = nouns[Math.floor(abs / adjectives.length) % nouns.length];
  const num = (abs % 100).toString().padStart(2, "0");

  return `${adj}${noun}${num}`;
}
