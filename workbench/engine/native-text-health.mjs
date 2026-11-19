// Fail-closed heuristic for native PDF text corrupted by custom-font extraction.
// This is NOT source-image inspection, OCR, or semantic assurance.
const LETTER = /\p{L}/u;
const PRIVATE_USE = /[\uE000-\uF8FF]/u;
export function assessNativeTextHealth(text) {
  if (typeof text !== 'string') throw new TypeError('native text must be a string');
  const meaningful = Array.from(text).filter(c => !/\s/u.test(c));
  const letters = meaningful.filter(c => LETTER.test(c)).length;
  const density = meaningful.length ? letters / meaningful.length : 0;
  const bidiControls = (text.match(/[\u202A-\u202E\u2066-\u2069]/gu) || []).length;
  let reason = null;
  if (text.includes('\uFFFD')) reason = 'REPLACEMENT_CHARACTER';
  else if (PRIVATE_USE.test(text)) reason = 'PRIVATE_USE_FONT_GLYPH';
  else if (bidiControls >= 12 && bidiControls / Math.max(1, meaningful.length) > 0.08)
    reason = 'EXCESSIVE_BIDI_CONTROLS';
  else if (meaningful.length >= 40 && density < 0.45) reason = 'LOW_LETTER_DENSITY';
  return {usableAsNativeCandidate: reason === null, reason,
    meaningfulCharacters: meaningful.length, bidiControls,
    letterDensity: Number(density.toFixed(4))};
}
