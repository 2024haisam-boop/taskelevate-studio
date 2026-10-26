#!/usr/bin/env bash
# Records the studio's own real-time scenes into web-ready clips (one Chrome at a time).
# Requires `npm run dev -- --port 3000` running. Output: public/media/clips/*.mp4 + *.jpg posters.
set -u
cd "$(dirname "$0")/.."
B="http://localhost:3000/lab?scene"
O="public/media/clips"
rec() { node scripts/record-clip.mjs "$1" "$2" --mode=realtime "${@:3}" 2>&1 | tail -1; }
rec "$B=product-turntable&dur=8" "$O/product-turntable" --seconds=8 --warmup=10000
rec "$B=product-scan"            "$O/product-scan"      --seconds=6 --warmup=10000
rec "$B=saas"                    "$O/saas-dashboard"    --seconds=6 --warmup=10000
rec "$B=web"                     "$O/web-layers"        --seconds=6 --warmup=10000
rec "$B=motion"                  "$O/motion-comp"       --seconds=4.8 --warmup=10000
rec "$B=edit"                    "$O/edit-timeline"     --seconds=9.6 --warmup=10000
