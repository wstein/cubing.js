import { expect, test } from "bun:test";
import type { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js";
import { Color } from "three/src/math/Color.js";
import { cube3x3x3 } from "../../../../puzzles";
import { resolveCubeColorScheme } from "../../../model/props/puzzle/display/ExperimentalCubeColorSchemeProp";
import { Cube3D } from "./Cube3D";

async function cube3DWithScheme(scheme: "japanese" | { F: string; D: number }) {
  return new Cube3D(await cube3x3x3.kpuzzle(), undefined, {
    experimentalCubeColorScheme: resolveCubeColorScheme(scheme),
  });
}

function centerColor(cube3d: Cube3D, face: "F" | "B" | "D"): number {
  const faceIndex = { F: 2, B: 4, D: 5 }[face];
  const material = cube3d.kpuzzleFaceletInfo["CENTERS"][faceIndex][0].facelet
    .material as MeshBasicMaterial;
  return material.color.getHex();
}

test("Cube3D renders the Japanese blue-yellow swap", async () => {
  const cube3d = await cube3DWithScheme("japanese");

  expect(centerColor(cube3d, "B")).toBe(
    new Color(0xf4f400).convertLinearToSRGB().getHex(),
  );
  expect(centerColor(cube3d, "D")).toBe(
    new Color(0x2266ff).convertLinearToSRGB().getHex(),
  );
});

test("Cube3D renders custom colors by face", async () => {
  const cube3d = await cube3DWithScheme({ F: "black", D: 0xffffff });

  expect(centerColor(cube3d, "F")).toBe(0x000000);
  expect(centerColor(cube3d, "D")).toBe(0xffffff);
});

test("Cube3D dynamically updates its color scheme", async () => {
  const cube3d = await cube3DWithScheme("japanese");
  cube3d.experimentalUpdateCubeColorScheme(
    resolveCubeColorScheme({ F: "black", D: 0xffffff }),
  );

  expect(centerColor(cube3d, "F")).toBe(0x000000);
  expect(centerColor(cube3d, "D")).toBe(0xffffff);
});
