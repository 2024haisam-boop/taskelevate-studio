import * as THREE from "three";

/**
 * One decoder per clip for the whole world. Parts ask for a clip (`get`) to receive a shared texture
 * uniform (poster first, live video once frames flow) and call `want(src)` every frame they are near the
 * camera. `flush()` (once per frame) plays what is wanted and pauses what has not been wanted for a while,
 * so at most the clips of the current act are decoding. The <video> element itself is only created the
 * first time a clip is wanted — acts a visitor never reaches never download their footage.
 */
export interface PoolEntry {
  src: string;
  /** shared uniform — put it straight into a ShaderMaterial's uniforms */
  map: { value: THREE.Texture };
  /** video width / height */
  aspect: number;
}

interface Internal extends PoolEntry {
  poster: THREE.Texture;
  video: HTMLVideoElement | null;
  videoTex: THREE.VideoTexture | null;
  mipmaps: boolean;
  lastWanted: number;
  playing: boolean;
}

const KEEP_MS = 700;

export class VideoPool {
  private entries = new Map<string, Internal>();
  private loader = new THREE.TextureLoader();
  private now = 0;
  /** false → nothing plays (reduced motion, hidden tab) */
  enabled = true;
  postersTotal = 0;
  postersLoaded = 0;

  get(src: string, poster: string, opts: { mipmaps?: boolean; aspect?: number } = {}): PoolEntry {
    const hit = this.entries.get(src);
    if (hit) return hit;
    this.postersTotal += 1;
    const posterTex = this.loader.load(
      poster,
      () => (this.postersLoaded += 1),
      undefined,
      () => (this.postersLoaded += 1),
    );
    posterTex.colorSpace = THREE.SRGBColorSpace;
    posterTex.anisotropy = 4;
    const entry: Internal = {
      src,
      map: { value: posterTex },
      aspect: opts.aspect ?? 16 / 9,
      poster: posterTex,
      video: null,
      videoTex: null,
      mipmaps: opts.mipmaps ?? true,
      lastWanted: -Infinity,
      playing: false,
    };
    this.entries.set(src, entry);
    return entry;
  }

  want(src: string) {
    const e = this.entries.get(src);
    if (e) e.lastWanted = this.now;
  }

  /** Apply this frame's wishes. Call once per frame with performance.now(). */
  flush(now: number) {
    this.now = now;
    this.entries.forEach((e) => {
      const wanted = this.enabled && now - e.lastWanted < KEEP_MS;
      if (wanted && !e.playing) {
        const v = e.video ?? this.createVideo(e);
        e.playing = true;
        void v.play().catch(() => (e.playing = false));
      } else if (!wanted && e.playing && e.video) {
        e.playing = false;
        e.video.pause();
      }
    });
  }

  pauseAll() {
    this.entries.forEach((e) => {
      e.playing = false;
      e.video?.pause();
    });
  }

  private createVideo(e: Internal): HTMLVideoElement {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.src = e.src;
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    if (e.mipmaps) {
      // screens drawn much smaller than the footage → mipmaps avoid moiré on fine UI lines
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
    } else {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
    }
    tex.anisotropy = 4;
    video.addEventListener("playing", () => (e.map.value = tex), { once: true });
    e.video = video;
    e.videoTex = tex;
    return video;
  }

  dispose() {
    this.entries.forEach((e) => {
      if (e.video) {
        e.video.pause();
        e.video.removeAttribute("src");
        e.video.load();
      }
      e.videoTex?.dispose();
      e.poster.dispose();
    });
    this.entries.clear();
  }
}
