/**
 * SAAS ANIMATION — the film library
 * ---------------------------------
 * Short product films from the studio's SaaS work, encoded by scripts/encode-work.sh into
 * /public/media/work/saas/<id>/ (preview.mp4 muted loop, poster.jpg, full.mp4 with sound).
 *
 * ⚠️ INTEGRITY
 *  - Titles describe what each film shows (its own tagline); client names are not used.
 *  - `concept: true` = a self-initiated piece built around a well-known brand (confirmed by the studio, 2026-10-27).
 *    It is always shown with a "Concept" tag so it never reads as work for that company.
 *  - Only the studio's own films belong here. Clips signed by other creators or studios were left out.
 */

export interface Film {
  id: string;
  title: string;
  /** what kind of piece — shown under the title */
  kind: string;
  /** the brand a concept piece is built around */
  brand?: string;
  concept?: boolean;
  shape: "landscape" | "portrait" | "square" | "classic";
  seconds: number;
}

export const saasFilms: Film[] = [
  { id: "09", title: "Build it your way", kind: "AI app builder · Launch film", shape: "landscape", seconds: 56 },
  { id: "22", title: "Payments, simplified", kind: "Fintech · Product spot", brand: "Stripe", concept: true, shape: "landscape", seconds: 13 },
  { id: "29", title: "Research on autopilot", kind: "AI research assistant · Explainer", shape: "landscape", seconds: 123 },
  { id: "05", title: "Your business, amplified", kind: "Business suite · Vertical spot", shape: "portrait", seconds: 18 },
  { id: "11", title: "Voice AI for hourly teams", kind: "AI agent · Launch film", shape: "landscape", seconds: 65 },
  { id: "30", title: "Quant research, automated", kind: "Finance AI · Explainer", shape: "landscape", seconds: 140 },
  { id: "07", title: "Where everything connects", kind: "Workspace · Product spot", brand: "Notion", concept: true, shape: "square", seconds: 28 },
  { id: "28", title: "More control, every stay", kind: "Hospitality platform · Explainer", shape: "landscape", seconds: 52 },
  { id: "18", title: "Hand off the tasks you don't like", kind: "AI automation · Launch film", shape: "landscape", seconds: 48 },
  { id: "12", title: "Meetings, written up for you", kind: "AI note-taker · Product teaser", shape: "landscape", seconds: 25 },
  { id: "23", title: "Customer calls, handled", kind: "Voice AI · Vertical spot", shape: "portrait", seconds: 17 },
  { id: "32", title: "See the full deal", kind: "Deal analysis AI · Explainer", shape: "landscape", seconds: 80 },
  { id: "17", title: "Work that runs itself", kind: "AI agent · Product spot", brand: "Perplexity", concept: true, shape: "landscape", seconds: 19 },
  { id: "10", title: "Just ask Nova", kind: "AI assistant · Product teaser", shape: "landscape", seconds: 28 },
  { id: "03", title: "Anatomy, in three dimensions", kind: "Learning platform · Product reveal", shape: "landscape", seconds: 45 },
  { id: "36", title: "You've been listening wrong", kind: "Music platform · Product teaser", shape: "landscape", seconds: 52 },
  { id: "16", title: "Automations in plain English", kind: "Workflow automation · Product teaser", shape: "landscape", seconds: 23 },
  { id: "04", title: "Design your way", kind: "Design assets · Product tour", brand: "Flaticon", concept: true, shape: "classic", seconds: 40 },
  { id: "08", title: "Team chat that keeps up", kind: "Collaboration · Launch film", shape: "landscape", seconds: 30 },
  { id: "27", title: "Order ahead, skip the queue", kind: "Ordering app · Vertical spot", shape: "portrait", seconds: 12 },
  { id: "34", title: "Learn anything, step by step", kind: "AI learning app · Product teaser", shape: "landscape", seconds: 27 },
  { id: "19", title: "Unlock your potential", kind: "Website builder · Brand spot", brand: "Framer", concept: true, shape: "landscape", seconds: 13 },
  { id: "01", title: "Sharing, in one click", kind: "Cloud storage · Feature spot", brand: "Google Drive", concept: true, shape: "landscape", seconds: 15 },
  { id: "33", title: "It's an experience", kind: "Streaming · Brand spot", brand: "Spotify", concept: true, shape: "landscape", seconds: 9 },
  { id: "37", title: "Unleash your creativity", kind: "AI assistant · Brand spot", brand: "ChatGPT", concept: true, shape: "landscape", seconds: 10 },
];

export function filmMedia(id: string) {
  const base = `/media/work/saas/${id}`;
  return { poster: `${base}/poster.jpg`, preview: `${base}/preview.mp4`, full: `${base}/full.mp4` };
}

export function filmLength(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
}
