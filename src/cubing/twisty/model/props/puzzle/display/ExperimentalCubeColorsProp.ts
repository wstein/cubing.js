import { TwistyPropSource } from "../../TwistyProp";

export const CUBE_FACES = ["U", "L", "F", "R", "B", "D"] as const;

export type CubeFace = (typeof CUBE_FACES)[number];
export type CubeColor = string | number;
export type CustomCubeColors = Partial<Record<CubeFace, CubeColor>>;

export const BOY_CUBE_COLOR_SCHEME = {
  U: 0xffffff,
  L: 0xff8000,
  F: 0x44ee00,
  R: 0xff0000,
  B: 0x2266ff,
  D: 0xf4f400,
} as const satisfies Record<CubeFace, CubeColor>;

export const JAPANESE_CUBE_COLOR_SCHEME = {
  ...BOY_CUBE_COLOR_SCHEME,
  B: BOY_CUBE_COLOR_SCHEME.D,
  D: BOY_CUBE_COLOR_SCHEME.B,
} as const satisfies Record<CubeFace, CubeColor>;

export type CubeColorPreset = "boy" | "western" | "japanese" | "default";

/** Cube face color specification. Accepts named presets ("western", "japanese", "boy", "default"), face-to-color objects, or serialized "U:#...,F:#..." strings. */
export type ExperimentalCubeColors =
  | CubeColorPreset
  | CustomCubeColors
  | (string & {});

export type ResolvedCubeColors = Record<CubeFace, CubeColor>;

function isCubeFace(face: string): face is CubeFace {
  return (CUBE_FACES as readonly string[]).includes(face);
}

function parseCustomCubeColors(input: unknown): CustomCubeColors {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Cube colors must be a face-to-color object.");
  }
  const colors: CustomCubeColors = {};
  for (const [rawFace, color] of Object.entries(input)) {
    const face = rawFace.trim().toUpperCase();
    if (!isCubeFace(face)) {
      throw new Error(`Unknown cube face: ${rawFace}`);
    }
    const normalizedColor = typeof color === "string" ? color.trim() : color;
    if (
      (typeof normalizedColor !== "string" &&
        typeof normalizedColor !== "number") ||
      normalizedColor === "" ||
      (typeof normalizedColor === "number" && !Number.isFinite(normalizedColor))
    ) {
      throw new Error(`Invalid color for ${rawFace}.`);
    }
    colors[face] = normalizedColor;
  }
  return colors;
}

function parseSerializedCubeColors(input: string): CustomCubeColors {
  const trimmed = input.trim();
  if (trimmed.startsWith("{")) {
    return parseCustomCubeColors(JSON.parse(trimmed));
  }
  const colors: Record<string, string> = {};
  for (const rawEntry of trimmed.split(",")) {
    const entry = rawEntry.trim();
    if (!entry) {
      continue;
    }
    const separator = entry.indexOf(":");
    if (separator <= 0 || separator === entry.length - 1) {
      throw new Error(`Invalid cube color entry: ${entry}`);
    }
    colors[entry.slice(0, separator).trim()] = entry
      .slice(separator + 1)
      .trim();
  }
  return parseCustomCubeColors(colors);
}

export function resolveCubeColors(
  input: ExperimentalCubeColors | undefined,
): ResolvedCubeColors | undefined {
  if (typeof input === "undefined" || input === "default") {
    return undefined;
  }
  switch (input) {
    case "boy":
    case "western":
      return BOY_CUBE_COLOR_SCHEME;
    case "japanese":
      return JAPANESE_CUBE_COLOR_SCHEME;
  }
  return {
    ...BOY_CUBE_COLOR_SCHEME,
    ...(typeof input === "string"
      ? parseSerializedCubeColors(input)
      : parseCustomCubeColors(input)),
  };
}

export class ExperimentalCubeColorsProp extends TwistyPropSource<
  ResolvedCubeColors | undefined,
  ExperimentalCubeColors | undefined
> {
  getDefaultValue(): undefined {
    return undefined;
  }

  protected derive(
    input: ExperimentalCubeColors | undefined,
  ): ResolvedCubeColors | undefined {
    return resolveCubeColors(input);
  }
}
