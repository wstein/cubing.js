import { expect, test } from "bun:test";
import type { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js";
import { Color } from "three/src/math/Color.js";
import { cube3x3x3 } from "../../../../puzzles";
import {
  type ExperimentalCubeColors,
  resolveCubeColors,
} from "../../../model/props/puzzle/display/ExperimentalCubeColorsProp";
import { Cube3D } from "./Cube3D";

async function cube3DWithColors(colors?: ExperimentalCubeColors) {
  return new Cube3D(await cube3x3x3.kpuzzle(), undefined, {
    experimentalCubeColors: resolveCubeColors(colors),
  });
}

function centerColor(
  cube3d: Cube3D,
  face: "U" | "L" | "F" | "R" | "B" | "D",
): number {
  const faceIndex = { U: 0, L: 1, F: 2, R: 3, B: 4, D: 5 }[face];
  const material = cube3d.kpuzzleFaceletInfo["CENTERS"][faceIndex][0].facelet
    .material as MeshBasicMaterial;
  return material.color.getHex();
}

function centerHintMaterial(
  cube3d: Cube3D,
  face: "U" | "L" | "F" | "R" | "B" | "D",
): MeshBasicMaterial {
  const faceIndex = { U: 0, L: 1, F: 2, R: 3, B: 4, D: 5 }[face];
  return cube3d.kpuzzleFaceletInfo["CENTERS"][faceIndex][0].hintFacelet!
    .material as MeshBasicMaterial;
}

test("Cube3D preserves the original hand-tuned axesInfo palette by default", async () => {
  // Test construction with explicit undefined as forwarded by Twisty3DPuzzleWrapper when prop is default
  const cube3dFromWrapper = await cube3DWithColors(undefined);
  // Also test construction without options object
  const cube3dBare = new Cube3D(await cube3x3x3.kpuzzle());

  for (const cube3d of [cube3dFromWrapper, cube3dBare]) {
    // Assert against the exact pre-change axesInfo palette:
    // Notice specifically:
    // L is 0xff9900 (not BOY_CUBE_COLOR_SCHEME's 0xff8000)
    // F is 0x00ff00 (not BOY_CUBE_COLOR_SCHEME's 0x44ee00)
    // D is 0xffff00 (not BOY_CUBE_COLOR_SCHEME's 0xf4f400)
    expect(centerColor(cube3d, "U")).toBe(
      new Color(0xffffff).convertLinearToSRGB().getHex(),
    );
    expect(centerColor(cube3d, "L")).toBe(
      new Color(0xff9900).convertLinearToSRGB().getHex(),
    );
    expect(centerColor(cube3d, "F")).toBe(
      new Color(0x00ff00).convertLinearToSRGB().getHex(),
    );
    expect(centerColor(cube3d, "R")).toBe(
      new Color(0xff0000).convertLinearToSRGB().getHex(),
    );
    expect(centerColor(cube3d, "B")).toBe(
      new Color(0x2266ff).convertLinearToSRGB().getHex(),
    );
    expect(centerColor(cube3d, "D")).toBe(
      new Color(0xffff00).convertLinearToSRGB().getHex(),
    );

    // Assert that hand-tuned hint sticker opacity scale from axesInfo is preserved:
    // U has hintOpacityScale 1.25 -> 0.5 * 1.25 = 0.625
    // B has hintOpacityScale 0.75 -> 0.5 * 0.75 = 0.375
    expect(centerHintMaterial(cube3d, "U").opacity).toBeCloseTo(0.625);
    expect(centerHintMaterial(cube3d, "B").opacity).toBeCloseTo(0.375);
  }
});

test("Cube3D renders the Japanese blue-yellow swap", async () => {
  const cube3d = await cube3DWithColors("japanese");

  expect(centerColor(cube3d, "B")).toBe(
    new Color(0xf4f400).convertLinearToSRGB().getHex(),
  );
  expect(centerColor(cube3d, "D")).toBe(
    new Color(0x2266ff).convertLinearToSRGB().getHex(),
  );
});

test("Cube3D renders custom colors by face", async () => {
  const cube3d = await cube3DWithColors({ F: "black", D: 0xffffff });

  expect(centerColor(cube3d, "F")).toBe(0x000000);
  expect(centerColor(cube3d, "D")).toBe(0xffffff);
});

test("Cube3D dynamically updates its cube colors", async () => {
  const cube3d = await cube3DWithColors("japanese");
  const oldMaterial = cube3d.kpuzzleFaceletInfo["CENTERS"][2][0].facelet
    .material as MeshBasicMaterial;
  let disposeCount = 0;
  oldMaterial.addEventListener("dispose", () => disposeCount++);
  cube3d.experimentalUpdateCubeColors(
    resolveCubeColors({ F: "black", D: 0xffffff }),
  );

  expect(disposeCount).toBe(1);
  expect(centerColor(cube3d, "F")).toBe(0x000000);
  expect(centerColor(cube3d, "D")).toBe(0xffffff);

  cube3d.experimentalUpdateCubeColors(undefined);
  expect(centerColor(cube3d, "F")).toBe(
    new Color(0x00ff00).convertLinearToSRGB().getHex(),
  );
  expect(centerColor(cube3d, "D")).toBe(
    new Color(0xffff00).convertLinearToSRGB().getHex(),
  );
});
