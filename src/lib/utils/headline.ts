/**
 * Parses the tiny headline markup used across content files:
 *   "\n"      → line break
 *   "*word*"  → violet italic emphasis
 */
export interface HeadlineSegment {
  text: string;
  em: boolean;
}

export type HeadlineLine = HeadlineSegment[];

// Words that keep their own casing when a CAPS headline is set in sentence case.
const KEEP: Record<string, string> = {
  saas: "SaaS",
  "3d": "3D",
  ui: "UI",
  ux: "UX",
  webgl: "WebGL",
  blender: "Blender",
  taskelevate: "Taskelevate",
  i: "I",
  "i'm": "I'm",
  "i've": "I've",
  cad: "CAD",
  ai: "AI",
};

/**
 * Converts an ALL-CAPS headline (the original content style) to sentence case for the editorial design:
 * first letter of each sentence capitalised, brand/acronym words restored. Mixed-case input is left alone.
 */
export function toSentenceCase(source: string): string {
  if (/[a-z]/.test(source.replace(/\*/g, ""))) return source;
  let capNext = true;
  return source.replace(/[A-Za-z0-9'’]+|[.!?]/g, (tok) => {
    if (/^[.!?]$/.test(tok)) {
      capNext = true;
      return tok;
    }
    const lower = tok.toLowerCase();
    const kept = KEEP[lower.replace(/’/g, "'")];
    let out = kept ?? lower;
    if (capNext && !kept) out = out.charAt(0).toUpperCase() + out.slice(1);
    capNext = false;
    return out;
  });
}

export function parseHeadline(source: string): HeadlineLine[] {
  return toSentenceCase(source).split("\n").map((line) => {
    const segments: HeadlineSegment[] = [];
    const parts = line.split(/(\*[^*]+\*)/g).filter(Boolean);
    for (const part of parts) {
      if (part.startsWith("*") && part.endsWith("*")) {
        segments.push({ text: part.slice(1, -1), em: true });
      } else {
        segments.push({ text: part, em: false });
      }
    }
    return segments;
  });
}

/** Plain-text version for metadata, aria labels and screen readers. */
export function headlineToText(source: string): string {
  return toSentenceCase(source).replace(/\*/g, "").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}
