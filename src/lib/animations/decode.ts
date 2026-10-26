/* Text "decode": a line resolves from scrambled glyphs, left to right. The final text is laid out from the start
   (scrambling glyphs sit on top of transparent letters, see ".dc" in globals.css), so nothing reflows while it
   plays. Words never break mid-word. Returns a cancel function. */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";
const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;

export function decodeTo(el: HTMLElement, text: string, duration = 700): () => void {
  el.textContent = "";
  const chars: HTMLSpanElement[] = [];
  const words = text.split(" ");
  words.forEach((w, wi) => {
    const word = document.createElement("span");
    word.className = "dc-word";
    for (const ch of w) {
      const c = document.createElement("span");
      c.className = "dc dc-s";
      c.textContent = ch;
      c.dataset.g = glyph();
      word.appendChild(c);
      chars.push(c);
    }
    el.appendChild(word);
    if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
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
