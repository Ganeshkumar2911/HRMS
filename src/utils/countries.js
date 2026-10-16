/**
 * Helper to get country flag code (2-letter lowercase ISO code).
 */
export function getFlagCode(val) {
  if (!val || typeof val !== "string") return "";
  const trimmed = val.trim();
  // Match 2-letter code in brackets e.g. [US] or (US)
  const bracketMatch = trimmed.match(/\[([A-Za-z]{2})\]|\(([A-Za-z]{2})\)/);
  if (bracketMatch) {
    return (bracketMatch[1] || bracketMatch[2]).toLowerCase();
  }
  // If exactly 2 letters
  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return "";
}

export default {
  getFlagCode,
};
