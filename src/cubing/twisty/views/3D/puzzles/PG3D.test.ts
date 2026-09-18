import { expect, test } from "bun:test";
import type { Mesh } from "three/src/objects/Mesh.js";
import { cube3x3x3 } from "../../../../puzzles";
import { PG3D } from "./PG3D";

async function stickerColorOnFace(
  scheme: "boy" | "japanese",
  zDirection: 1 | -1,
): Promise<number[]> {
  const pg3d = new PG3D(
    () => {},
    await cube3x3x3.kpuzzle(),
    (await cube3x3x3.pg!()).get3d({ darkIgnoredOrbits: false }),
    true,
    false,
    undefined,
    1,
    { experimentalCubeColorScheme: scheme },
  );
  const mesh = pg3d.children[0] as Mesh;
  const positions = mesh.geometry.getAttribute("position");
  const colors = mesh.geometry.getAttribute("color");

  for (let i = 0; i < positions.count; i++) {
    if (positions.getZ(i) * zDirection > 1.5) {
      const colorOffset = i * 3;
      return Array.from(colors.array.slice(colorOffset, colorOffset + 3));
    }
  }
  throw new Error(`No sticker vertex found on z=${zDirection}`);
}

test("PG3D renders Japanese front and back sticker colors", async () => {
  expect(await stickerColorOnFace("boy", 1)).toEqual([68, 238, 0]);
  expect(await stickerColorOnFace("boy", -1)).toEqual([34, 102, 255]);
  expect(await stickerColorOnFace("japanese", 1)).toEqual([34, 102, 255]);
  expect(await stickerColorOnFace("japanese", -1)).toEqual([68, 238, 0]);
});
