import { SimpleTwistyPropSource } from "../../TwistyProp";

/**
 * Sticker-color schemes for the six-faced cube renderers.
 *
 * `boy` uses the standard Blue-Orange-Yellow opposite-face arrangement.
 * `japanese` swaps its green and blue sticker colors while preserving the
 * cube's face labels and state.
 */
export type ExperimentalCubeColorScheme = "boy" | "japanese";

const green = 0x44ee00;
const blue = 0x2266ff;

export function cubeColorForScheme(
  color: number,
  scheme: ExperimentalCubeColorScheme,
): number {
  if (scheme === "japanese") {
    if (color === green) {
      return blue;
    }
    if (color === blue) {
      return green;
    }
  }
  return color;
}

export class ExperimentalCubeColorSchemeProp extends SimpleTwistyPropSource<ExperimentalCubeColorScheme> {
  getDefaultValue(): ExperimentalCubeColorScheme {
    return "boy";
  }
}
