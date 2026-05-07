/** Normalize tutor/math text for TTS (shared by ElevenLabs and OpenAI routes). */
export function sanitizeForSpeech(text: string): string {
  let s = text;

  s = s.replace(/\[\[(.+?)\]\]/g, (_match, inner: string) => {
    const entries = inner.replace(/\]\s*,\s*\[/g, ", ").replace(/,/g, ", ");
    return `the matrix: ${entries}`;
  });

  s = s.replace(/\[([^\]]+)\]/g, "$1");
  s = s.replace(/(\w+)\^(\w+)/g, "$1 to the power of $2");
  s = s.replace(/(\d+)\s*[*×]\s*(\d+)/g, "$1 times $2");
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, "$1 divided by $2");
  s = s.replace(/(\d+)\s*\+\s*(\d+)/g, "$1 plus $2");
  s = s.replace(/(\d+)\s*-\s*(\d+)/g, "$1 minus $2");
  s = s.replace(/\s*=\s*/g, " equals ");
  s = s.replace(/≠/g, "is not equal to");
  s = s.replace(/≤/g, "is less than or equal to");
  s = s.replace(/≥/g, "is greater than or equal to");
  s = s.replace(/√(\w+)/g, "the square root of $1");
  s = s.replace(/sqrt\(([^)]+)\)/gi, "the square root of $1");
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}
