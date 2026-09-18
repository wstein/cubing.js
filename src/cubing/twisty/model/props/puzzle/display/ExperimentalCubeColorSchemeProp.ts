import { SimpleTwistyPropSource } from "../../TwistyProp";

/**
 * Sticker-color schemes for the six-faced cube renderers.
 *
 * `boy` uses the standard Blue-Orange-Yellow opposite-face arrangement.
 * `japanese` swaps its blue and yellow sticker colors while preserving the
 * cube's face labels and state.
 */
export type ExperimentalCubeColorScheme = "boy" | "japanese";

const cubeStickerColors = {
  blue: 0x2266ff,
  yellow: 0xf4f400,
} as const;

export function cubeColorForScheme(
  color: number,
  scheme: ExperimentalCubeColorScheme,
): number {
  if (scheme === "japanese") {
    if (color === cubeStickerColors.blue) {
      return cubeStickerColors.yellow;
    }
    if (color === cubeStickerColors.yellow) {
      return cubeStickerColors.blue;
    }
  }
  return color;
}

export class ExperimentalCubeColorSchemeProp extends SimpleTwistyPropSource<ExperimentalCubeColorScheme> {
  getDefaultValue(): ExperimentalCubeColorScheme {
    return "boy";
  }
}
