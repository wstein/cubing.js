import { expect, test } from "bun:test";
import type { Mesh } from "three/src/objects/Mesh.js";
import { Move } from "../../../../alg";
import { cube3x3x3, puzzles } from "../../../../puzzles";
import {
  type ExperimentalCubeColorScheme,
  resolveCubeColorScheme,
} from "../../../model/props/puzzle/display/ExperimentalCubeColorSchemeProp";
import { resolveCubeColors } from "../../../model/props/puzzle/display/ExperimentalCubeColorsProp";
import { PG3D } from "./PG3D";

async function stickerColorOnFace(
  scheme: ExperimentalCubeColorScheme | undefined,
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
  return stickerColorFromPG3D(pg3d, axis, direction);
}

function stickerColorFromPG3D(
  pg3d: PG3D,
  axis: "y" | "z",
  direction: 1 | -1,
): number[] {
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
  expect(await stickerColorOnFace(undefined, "z", 1)).toEqual([68, 238, 0]);
  expect(await stickerColorOnFace("boy", "z", 1)).toEqual([68, 238, 0]);
  expect(await stickerColorOnFace("boy", "z", -1)).toEqual([34, 102, 255]);
  expect(await stickerColorOnFace("boy", "y", -1)).toEqual([244, 244, 0]);
  expect(await stickerColorOnFace("japanese", "z", 1)).toEqual([68, 238, 0]);
  expect(await stickerColorOnFace("japanese", "z", -1)).toEqual([244, 244, 0]);
  expect(await stickerColorOnFace("japanese", "y", -1)).toEqual([34, 102, 255]);
});

test("PG3D restores native colors after clearing the scheme", async () => {
  const pg3d = new PG3D(
    () => {},
    await cube3x3x3.kpuzzle(),
    (await cube3x3x3.pg!()).get3d({ darkIgnoredOrbits: false }),
    true,
    false,
    undefined,
    1,
    { experimentalCubeColorScheme: resolveCubeColorScheme("japanese") },
  );

  expect(stickerColorFromPG3D(pg3d, "z", -1)).toEqual([244, 244, 0]);
  pg3d.experimentalUpdateCubeColorScheme(undefined);
  expect(stickerColorFromPG3D(pg3d, "z", -1)).toEqual([34, 102, 255]);
});

test("PG3D accepts and updates the new cube-colors option", async () => {
  const pg3d = new PG3D(
    () => {},
    await cube3x3x3.kpuzzle(),
    (await cube3x3x3.pg!()).get3d({ darkIgnoredOrbits: false }),
    true,
    false,
    undefined,
    1,
    { experimentalCubeColors: resolveCubeColors("japanese") },
  );

  expect(stickerColorFromPG3D(pg3d, "z", -1)).toEqual([244, 244, 0]);
  pg3d.experimentalUpdateCubeColors(undefined);
  expect(stickerColorFromPG3D(pg3d, "z", -1)).toEqual([34, 102, 255]);
});

test("PG3D applies custom colors by face", async () => {
  const scheme = { F: "black", D: 0xffffff };

  expect(await stickerColorOnFace(scheme, "z", 1)).toEqual([0, 0, 0]);
  expect(await stickerColorOnFace(scheme, "y", -1)).toEqual([255, 255, 255]);
  expect(await stickerColorOnFace(scheme, "z", -1)).toEqual([34, 102, 255]);
});

async function pyraminxPG3D(
  scheme: ExperimentalCubeColorScheme | undefined,
): Promise<PG3D> {
  return new PG3D(
    () => {},
    await puzzles["pyraminx"].kpuzzle(),
    (await puzzles["pyraminx"].pg!()).get3d({ darkIgnoredOrbits: false }),
    true,
    false,
    undefined,
    1,
    { experimentalCubeColorScheme: resolveCubeColorScheme(scheme) },
  );
}

function meshColors(pg3d: PG3D): number[] {
  return Array.from(
    (pg3d.children[0] as Mesh).geometry.getAttribute("color").array,
  );
}

test("PG3D ignores cube color schemes on non-cube puzzles", async () => {
  const defaultColors = meshColors(await pyraminxPG3D(undefined));
  expect(meshColors(await pyraminxPG3D("japanese"))).toEqual(defaultColors);

  const pg3d = await pyraminxPG3D(undefined);
  pg3d.experimentalUpdateCubeColorScheme(resolveCubeColorScheme("japanese"));
  expect(meshColors(pg3d)).toEqual(defaultColors);
});

test("PG3D does not rewind moves when updating cube color scheme", async () => {
  const kpuzzle = await cube3x3x3.kpuzzle();
  const pg3d = new PG3D(
    () => {},
    kpuzzle,
    (await cube3x3x3.pg!()).get3d({ darkIgnoredOrbits: false }),
    true,
    false,
    undefined,
    1,
  );

  const move = new Move("R");
  const patternAfterMove = kpuzzle.defaultPattern().applyMove(move);

  // 1. Initial frame of catchUpMove: pattern updated, move is animating backwards
  pg3d.onPositionChange({
    pattern: patternAfterMove,
    movesInProgress: [
      {
        move,
        direction: -1,
        fraction: 1,
      },
    ],
  });

  // 2. Animation completes: pattern unchanged, movesInProgress is empty
  pg3d.onPositionChange({
    pattern: patternAfterMove,
    movesInProgress: [],
  });

  expect((pg3d as any).movingObj.rotation.x).toBeCloseTo(0);
  expect((pg3d as any).movingObj.rotation.y).toBeCloseTo(0);
  expect((pg3d as any).movingObj.rotation.z).toBeCloseTo(0);

  // 3. Changing color scheme should NOT set state back to the catch-up move
  pg3d.experimentalUpdateCubeColorScheme(resolveCubeColorScheme("japanese"));

  expect((pg3d as any).movingObj.rotation.x).toBeCloseTo(0);
  expect((pg3d as any).movingObj.rotation.y).toBeCloseTo(0);
  expect((pg3d as any).movingObj.rotation.z).toBeCloseTo(0);
});
