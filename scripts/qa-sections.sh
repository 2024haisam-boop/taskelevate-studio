#!/usr/bin/env bash
# Viewport captures of the home page at specific scroll states (sticky sections need real scrolling).
# usage: scripts/qa-sections.sh <outdir> [WxH]
set -u
cd "$(dirname "$0")/.."
OUT="$1"; SIZE="${2:-1440x900}"; mkdir -p "$OUT"
shot() { # name selector fraction-of-track extraWait
  node scripts/qa-screenshot.mjs http://localhost:3000/ "$SIZE" "$OUT/$1.png" --wait=12000 --eval="(async()=>{const el=document.querySelector('$2'); const top=el.getBoundingClientRect().top+scrollY; const total=Math.max(el.offsetHeight-innerHeight,0); const target=top+total*$3; for(let y=0;y<=target;y+=160){scrollTo(0,y); await new Promise(r=>setTimeout(r,30));} scrollTo(0,target); await new Promise(r=>setTimeout(r,${4:-1500})); return 1})()" >/dev/null 2>&1 && echo "ok $1" || echo "FAIL $1"
}
shot statement '#statement' 0.45
shot reel-small 'section[aria-label=Showreel]' 0.12
shot reel-full 'section[aria-label=Showreel]' 0.8
shot services 'ol [data-stack-card]' 0 1500
shot services-2 '#services' 0.55
shot work '#work' 0.4
shot cta 'section[aria-labelledby=cta-title]' 0 4000
