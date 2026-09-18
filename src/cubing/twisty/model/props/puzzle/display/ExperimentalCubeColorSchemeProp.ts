import { SimpleTwistyPropSource } from "../../TwistyProp";

/**
 * Sticker-color schemes for the six-faced cube renderers.
 *
 * `boy` uses the standard Blue-Orange-Yellow opposite-face arrangement.
 * `japanese` swaps its blue and yellow sticker colors while preserving the
 * cube's face labels and state.
 */
export type ExperimentalCubeColorScheme = "boy" | "japanese";

const blue = 0x2266ff;
const yellow = 0xf4f400;

export function cubeColorForScheme(
  color: number,
  scheme: ExperimentalCubeColorScheme,
): number {
  if (scheme === "japanese") {
    if (color === blue) {
      return yellow;
    }
    if (color === yellow) {
      return blue;
    }
  }
  return color;
}

export class ExperimentalCubeColorSchemeProp extends SimpleTwistyPropSource<ExperimentalCubeColorScheme> {
  getDefaultValue(): ExperimentalCubeColorScheme {
    return "boy";
  }
}
