/* Shared by the configurator UI (components/services/WebShowcase) and the 3D scene (WatchScene) — kept apart from
   the scene so the page can import it without pulling three.js into its main bundle. */

export type CaseFinish = "steel" | "gold" | "ceramic";
export type DialColor = "midnight" | "ivory" | "emerald" | "violet";
export type StrapColor = "tan" | "rubber" | "lilac";
export interface WatchConfig {
  finish: CaseFinish;
  dial: DialColor;
  strap: StrapColor;
}
/** Shared with the DOM: drag rotation (radians) and when the visitor last touched it. */
export interface DragState {
  yaw: number;
  pitch: number;
  last: number;
}

/** How far each layer lifts in the exploded view (watch units, along its axis). */
export const EXPLODE = { crystal: 1.1, bezel: 0.82, hands: 0.62, dial: 0.42, movement: 0.14, back: -0.6 };
export const HOTSPOTS: { key: keyof typeof EXPLODE; label: string; at: [number, number, number] }[] = [
  { key: "crystal", label: "Domed crystal", at: [0.86, 0.21, 0] },
  { key: "bezel", label: "Bezel · 60-minute scale", at: [-0.96, 0.18, 0] },
  { key: "hands", label: "Hands · your local time", at: [0.5, 0.14, 0.2] },
  { key: "dial", label: "Sunray dial", at: [-0.82, 0.11, 0.1] },
  { key: "movement", label: "Movement · live gears", at: [0.74, 0.02, -0.1] },
  { key: "back", label: "Engraved case back", at: [-0.8, -0.17, 0] },
];
