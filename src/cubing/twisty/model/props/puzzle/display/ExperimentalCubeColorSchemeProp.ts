import { TwistyPropSource } from "../../TwistyProp";

export const CUBE_FACES = ["U", "L", "F", "R", "B", "D"] as const;

export type CubeFace = (typeof CUBE_FACES)[number];
export type CubeColor = string | number;
export type CustomCubeColorScheme = Partial<Record<CubeFace, CubeColor>>;

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

type CubeColorSchemePreset = "boy" | "western" | "japanese";
type SerializedCubeColorScheme = `${string}:${string}` | `{${string}}`;

/** Sticker-color input for the PG3D renderer. */
export type ExperimentalCubeColorScheme =
  | CubeColorSchemePreset
  | CustomCubeColorScheme
  | SerializedCubeColorScheme;

export type ResolvedCubeColorScheme = Record<CubeFace, CubeColor>;

function isCubeFace(face: string): face is CubeFace {
  return (CUBE_FACES as readonly string[]).includes(face);
}

function parseCustomCubeColorScheme(input: unknown): CustomCubeColorScheme {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Cube color schemes must be face-to-color objects.");
  }
  const scheme: CustomCubeColorScheme = {};
  for (const [face, color] of Object.entries(input)) {
    if (!isCubeFace(face)) {
      throw new Error(`Unknown cube face: ${face}`);
    }
    if (
      (typeof color !== "string" && typeof color !== "number") ||
      color === "" ||
      (typeof color === "number" && !Number.isFinite(color))
    ) {
      throw new Error(`Invalid color for ${face}.`);
    }
    scheme[face] = color;
  }
  return scheme;
}

function parseSerializedCubeColorScheme(
  input: SerializedCubeColorScheme,
): CustomCubeColorScheme {
  if (input.startsWith("{")) {
    return parseCustomCubeColorScheme(JSON.parse(input));
  }
  const scheme: Record<string, string> = {};
  for (const entry of input.split(",")) {
    const separator = entry.indexOf(":");
    if (separator <= 0 || separator === entry.length - 1) {
      throw new Error(`Invalid cube color scheme entry: ${entry}`);
    }
    scheme[entry.slice(0, separator)] = entry.slice(separator + 1);
  }
  return parseCustomCubeColorScheme(scheme);
}

export function resolveCubeColorScheme(
  input: ExperimentalCubeColorScheme,
): ResolvedCubeColorScheme {
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
  ResolvedCubeColorScheme,
  ExperimentalCubeColorScheme
> {
  getDefaultValue(): ResolvedCubeColorScheme {
    return BOY_CUBE_COLOR_SCHEME;
  }

  protected derive(
    input: ExperimentalCubeColorScheme,
  ): ResolvedCubeColorScheme {
    return resolveCubeColorScheme(input);
  }
}
