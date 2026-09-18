import { expect, test } from "bun:test";
import {
  cubeColorForScheme,
  ExperimentalCubeColorSchemeProp,
} from "./ExperimentalCubeColorSchemeProp";

test("defaults to BOY and accepts the Japanese cube color scheme", async () => {
  const prop = new ExperimentalCubeColorSchemeProp();

  expect(await prop.get()).toBe("boy");

  prop.set("japanese");
  expect(await prop.get()).toBe("japanese");
});

test("Japanese swaps the blue and yellow sticker colors while BOY preserves them", () => {
  const green = 0x44ee00;
  const blue = 0x2266ff;
  const yellow = 0xf4f400;

  expect(cubeColorForScheme(green, "boy")).toBe(green);
  expect(cubeColorForScheme(blue, "boy")).toBe(blue);
  expect(cubeColorForScheme(yellow, "boy")).toBe(yellow);
  expect(cubeColorForScheme(green, "japanese")).toBe(green);
  expect(cubeColorForScheme(blue, "japanese")).toBe(yellow);
  expect(cubeColorForScheme(yellow, "japanese")).toBe(blue);
});
