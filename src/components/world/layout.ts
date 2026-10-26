import { projects } from "@/data/projects";

/**
 * World geometry (scene units). The journey runs DOWN the well, through the pool, then along -z:
 *
 *   y  2.2 ┌── the Well (hero rows, rims)
 *     -3.0 │   shaft rows ↓ (14)
 *    -23.6 ●── the pool (reel) = hole in the studio ceiling
 *    -32.6 └── studio: carousel (services) → gallery hall (work) → portal (finale), all along -z
 */
export const RADIUS = 4.1;
export const PANEL_H = 1.32;
export const ROW_GAP = 0.18;
export const ROW_STEP = PANEL_H + ROW_GAP;
export const WELL_ROWS = 3;
export const WELL_HALF = (WELL_ROWS * PANEL_H + (WELL_ROWS - 1) * ROW_GAP) / 2;

export const SHAFT_ROWS = 14;
export const SHAFT_TOP = -WELL_HALF - ROW_GAP - PANEL_H / 2;
export const SHAFT_BOTTOM = SHAFT_TOP - (SHAFT_ROWS - 1) * ROW_STEP - PANEL_H / 2;
export const POOL_Y = SHAFT_BOTTOM - 0.45;

export const EYE_Y = POOL_Y - 9;
export const FLOOR_Y = EYE_Y - 1.7;

export const CAROUSEL = { z: -7.5, r: 3.6, w: 3.2, h: 1.8 };
export const HALL = { z0: -16, step: 5.2, x: 2.5, w: 3.0, h: 1.69, turn: 0.55 };
export const hallZ = (i: number) => HALL.z0 - i * HALL.step;
/** the portal waits a little way past the last project screen */
export const PORTAL_Z = hallZ(projects.length - 1) - 24;
export const PORTAL_R = 3.2;

export const BG = "#08090d";
export const VIOLET = "#a77bff";
export const BLUE = "#3d8bff";
