import { TwistyPropSource } from "../../TwistyProp";
import {
  type CustomCubeColorScheme,
  type ExperimentalCubeColorScheme,
  resolveCubeColorScheme,
} from "./ExperimentalCubeColorSchemeProp";

export type {
  CubeColor,
  CubeFace,
  CustomCubeColorScheme as CustomCubeColors,
  ResolvedCubeColorScheme as ResolvedCubeColors,
} from "./ExperimentalCubeColorSchemeProp";
export {
  BOY_CUBE_COLOR_SCHEME,
  CUBE_FACES,
  JAPANESE_CUBE_COLOR_SCHEME,
} from "./ExperimentalCubeColorSchemeProp";

export type CubeColorPreset = "boy" | "western" | "japanese" | "default";

/** Cube face colors for the 3D renderers. */
export type ExperimentalCubeColors =
  | CubeColorPreset
  | CustomCubeColorScheme
  | (string & {});

export function resolveCubeColors(input: ExperimentalCubeColors | undefined) {
  return resolveCubeColorScheme(
    input as ExperimentalCubeColorScheme | undefined,
  );
}

export class ExperimentalCubeColorsProp extends TwistyPropSource<
  ReturnType<typeof resolveCubeColors>,
  ExperimentalCubeColors | undefined
> {
  getDefaultValue(): undefined {
    return undefined;
  }

  protected derive(input: ExperimentalCubeColors | undefined) {
    return resolveCubeColors(input);
  }
}
