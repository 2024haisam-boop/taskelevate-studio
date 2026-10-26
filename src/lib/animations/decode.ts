/* Text "decode": a line resolves from scrambled glyphs, left to right. The final text is laid out from the start
   (scrambling glyphs sit on top of transparent letters, see ".dc" in globals.css), so nothing reflows while it
   plays. Words never break mid-word. Returns a cancel function. */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";
const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;

/** Lay `text` out as per-letter spans (resolved). Kept on the element, so a later decode of the same text reuses it
 *  and the letters never move (the hero's GPU copy relies on that). */
function build(el: HTMLElement, text: string): HTMLSpanElement[] {
  el.textContent = "";
  const chars: HTMLSpanElement[] = [];
  const words = text.split(" ");
  words.forEach((w, wi) => {
    const word = document.createElement("span");
    word.className = "dc-word";
    for (const ch of w) {
      const c = document.createElement("span");
      c.className = "dc";
      c.textContent = ch;
      word.appendChild(c);
      chars.push(c);
    }
    el.appendChild(word);
    if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  el.dataset.dc = text;
  return chars;
}

/** Prepare an element for decoding without playing anything (same text, same layout). */
export function prepareDecode(el: HTMLElement, text: string) {
  if (el.dataset.dc !== text) build(el, text);
}

export function decodeTo(el: HTMLElement, text: string, duration = 700): () => void {
  const chars = el.dataset.dc === text ? Array.from(el.querySelectorAll<HTMLSpanElement>(".dc")) : build(el, text);
  chars.forEach((c) => {
    c.classList.add("dc-s");
    c.dataset.g = glyph();
  });

  const start = performance.now();
  const per = (duration * 0.7) / Math.max(chars.length, 1);
  let swapAt = 0;
  let raf = requestAnimationFrame(function tick(now) {
    const t = now - start;
    const swap = now >= swapAt;
    if (swap) swapAt = now + 50;
    let pending = false;
    chars.forEach((c, i) => {
      if (!c.classList.contains("dc-s")) return;
      if (t >= 90 + i * per) c.classList.remove("dc-s");
      else {
        pending = true;
        if (swap) c.dataset.g = glyph();
      }
    });
    if (pending) raf = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(raf);
}
