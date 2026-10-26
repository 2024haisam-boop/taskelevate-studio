#!/usr/bin/env bash
# Encodes one real project video into web-ready files under public/media/work/<slug>/:
#   preview.mp4  muted loop for cards (≤1280w landscape / ≤960h portrait, ~12 s)
#   poster.jpg   first-look frame for the card and the player
#   full.mp4     the whole video with sound (if any) for the case-study page
# usage: scripts/encode-work.sh "<source file>" <slug> <preview-start-s> <preview-seconds> [poster-offset-s]
# Originals are only read, never modified.
set -euo pipefail
SRC="$1"; SLUG="$2"; START="$3"; DUR="$4"; POSTER_AT="${5:-1.5}"
cd "$(dirname "$0")/.."
OUT="public/media/work/$SLUG"; mkdir -p "$OUT"
SCALE="scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(960,ih))':flags=lanczos"
HAS_AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$SRC" | head -1)

ffmpeg -v error -y -ss "$START" -t "$DUR" -i "$SRC" -an -vf "$SCALE,fps=30" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset medium -movflags +faststart "$OUT/preview.mp4"
ffmpeg -v error -y -ss "$(python3 -c "print($START+$POSTER_AT)")" -i "$SRC" -frames:v 1 -vf "$SCALE" -q:v 3 "$OUT/poster.jpg"
if [ -n "$HAS_AUDIO" ]; then AUDIO=(-c:a aac -b:a 128k); else AUDIO=(-an); fi
ffmpeg -v error -y -i "$SRC" -vf "$SCALE,fps=30" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 24 -preset medium \
  "${AUDIO[@]}" -movflags +faststart "$OUT/full.mp4"
printf "%-34s preview %6s  poster %6s  full %7s  %s\n" "$SLUG" "$(du -h "$OUT/preview.mp4" | cut -f1)" "$(du -h "$OUT/poster.jpg" | cut -f1)" "$(du -h "$OUT/full.mp4" | cut -f1)" "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$OUT/preview.mp4")"
