import { TwistyPropSource } from "../../TwistyProp";

export const CUBE_FACES = ["U", "L", "F", "R", "B", "D"] as const;

export type CubeFace = (typeof CUBE_FACES)[number];
export type CubeColor = string | number;
export type CustomCubeColorScheme = Partial<Record<CubeFace, CubeColor>>;

// Presets are frozen because resolving one returns the shared object.
export const BOY_CUBE_COLOR_SCHEME = Object.freeze({
  U: 0xffffff,
  L: 0xff8000,
  F: 0x44ee00,
  R: 0xff0000,
  B: 0x2266ff,
  D: 0xf4f400,
} as const satisfies Record<CubeFace, CubeColor>);

export const JAPANESE_CUBE_COLOR_SCHEME = Object.freeze({
  ...BOY_CUBE_COLOR_SCHEME,
  B: BOY_CUBE_COLOR_SCHEME.D,
  D: BOY_CUBE_COLOR_SCHEME.B,
} as const satisfies Record<CubeFace, CubeColor>);

type CubeColorSchemePreset = "boy" | "western" | "japanese" | "default";
type SerializedCubeColorScheme = `${string}:${string}` | `{${string}}`;

/** Sticker-color input for the PG3D renderer. */
export type ExperimentalCubeColorScheme =
  | CubeColorSchemePreset
  | CustomCubeColorScheme
  | SerializedCubeColorScheme;

export type ResolvedCubeColorScheme = Readonly<Record<CubeFace, CubeColor>>;

function isCubeFace(face: string): face is CubeFace {
  return (CUBE_FACES as readonly string[]).includes(face);
}

function parseCustomCubeColorScheme(input: unknown): CustomCubeColorScheme {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Cube color schemes must be face-to-color objects.");
  }
  const scheme: CustomCubeColorScheme = {};
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
    scheme[face] = normalizedColor;
  }
  return scheme;
}

function parseSerializedCubeColorScheme(
  input: SerializedCubeColorScheme,
): CustomCubeColorScheme {
  const trimmed = input.trim();
  if (trimmed.startsWith("{")) {
    return parseCustomCubeColorScheme(JSON.parse(trimmed));
  }
  const scheme: Record<string, string> = {};
  for (const rawEntry of trimmed.split(",")) {
    const entry = rawEntry.trim();
    if (!entry) {
      continue;
    }
    const separator = entry.indexOf(":");
    if (separator <= 0 || separator === entry.length - 1) {
      throw new Error(`Invalid cube color scheme entry: ${entry}`);
    }
    scheme[entry.slice(0, separator).trim()] = entry
      .slice(separator + 1)
      .trim();
  }
  return parseCustomCubeColorScheme(scheme);
}

export function resolveCubeColorScheme(
  input: ExperimentalCubeColorScheme | undefined,
): ResolvedCubeColorScheme | undefined {
  if (input === undefined || input === "default") {
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
      ? parseSerializedCubeColorScheme(input)
      : parseCustomCubeColorScheme(input)),
  };
}

export class ExperimentalCubeColorSchemeProp extends TwistyPropSource<
  ResolvedCubeColorScheme | undefined,
  ExperimentalCubeColorScheme | undefined
> {
  getDefaultValue(): undefined {
    return undefined;
  }

  protected derive(
    input: ExperimentalCubeColorScheme | undefined,
  ): ResolvedCubeColorScheme | undefined {
    return resolveCubeColorScheme(input);
  }
}
