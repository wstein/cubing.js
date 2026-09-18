import { expect, test } from "bun:test";
import type { Mesh } from "three/src/objects/Mesh.js";
import { cube3x3x3, puzzles } from "../../../../puzzles";
import {
  type ExperimentalCubeColorScheme,
  resolveCubeColorScheme,
} from "../../../model/props/puzzle/display/ExperimentalCubeColorSchemeProp";
import { PG3D } from "./PG3D";

async function stickerColorOnFace(
  scheme: ExperimentalCubeColorScheme,
  axis: "y" | "z",
  direction: 1 | -1,
): Promise<number[]> {
  const pg3d = new PG3D(
    () => {},
    await cube3x3x3.kpuzzle(),
    (await cube3x3x3.pg!()).get3d({ darkIgnoredOrbits: false }),
    true,
    false,
    undefined,
    1,
    { experimentalCubeColorScheme: resolveCubeColorScheme(scheme) },
  );
  const mesh = pg3d.children[0] as Mesh;
  const positions = mesh.geometry.getAttribute("position");
  const colors = mesh.geometry.getAttribute("color");

  for (let i = 0; i < positions.count; i++) {
    if (positions.getComponent(i, axis === "y" ? 1 : 2) * direction > 1.5) {
      const colorOffset = i * 3;
      return Array.from(colors.array.slice(colorOffset, colorOffset + 3));
    }
  }
  throw new Error(`No sticker vertex found on ${axis}=${direction}`);
}

test("PG3D renders the Japanese blue-yellow swap", async () => {
  expect(await stickerColorOnFace("boy", "z", 1)).toEqual([68, 238, 0]);
  expect(await stickerColorOnFace("boy", "z", -1)).toEqual([34, 102, 255]);
  expect(await stickerColorOnFace("boy", "y", -1)).toEqual([244, 244, 0]);
  expect(await stickerColorOnFace("japanese", "z", 1)).toEqual([68, 238, 0]);
  expect(await stickerColorOnFace("japanese", "z", -1)).toEqual([244, 244, 0]);
  expect(await stickerColorOnFace("japanese", "y", -1)).toEqual([34, 102, 255]);
});

test("PG3D applies custom colors by face", async () => {
  const scheme = { F: "black", D: 0xffffff };

  expect(await stickerColorOnFace(scheme, "z", 1)).toEqual([0, 0, 0]);
  expect(await stickerColorOnFace(scheme, "y", -1)).toEqual([255, 255, 255]);
  expect(await stickerColorOnFace(scheme, "z", -1)).toEqual([34, 102, 255]);
});

test("PG3D safely handles non-cube puzzles with a color scheme", async () => {
  const pg3d = new PG3D(
    () => {},
    await puzzles["pyraminx"].kpuzzle(),
    (await puzzles["pyraminx"].pg!()).get3d({ darkIgnoredOrbits: false }),
    true,
    false,
    undefined,
    1,
    { experimentalCubeColorScheme: resolveCubeColorScheme("japanese") },
  );
  expect(pg3d.children.length).toBeGreaterThan(0);
});
