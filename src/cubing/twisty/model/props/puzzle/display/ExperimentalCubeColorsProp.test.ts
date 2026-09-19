import { expect, test } from "bun:test";
import {
  BOY_CUBE_COLOR_SCHEME,
  ExperimentalCubeColorsProp,
  JAPANESE_CUBE_COLOR_SCHEME,
  resolveCubeColors,
} from "./ExperimentalCubeColorsProp";

test("defaults to undefined (use renderer/puzzle defaults)", async () => {
  const prop = new ExperimentalCubeColorsProp();

  expect(await prop.get()).toBeUndefined();
  expect(resolveCubeColors(undefined)).toBeUndefined();
  expect(resolveCubeColors("default")).toBeUndefined();
});

test("resolves named cube color schemes by face", () => {
  expect(resolveCubeColors("boy")).toEqual(BOY_CUBE_COLOR_SCHEME);
  expect(resolveCubeColors("western")).toEqual(BOY_CUBE_COLOR_SCHEME);
  expect(resolveCubeColors("japanese")).toEqual(JAPANESE_CUBE_COLOR_SCHEME);
});

test("merges a custom cube color scheme with BOY", async () => {
  const prop = new ExperimentalCubeColorsProp();

  prop.set({ U: "black", D: 0xffffff });
  expect(await prop.get()).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    U: "black",
    D: 0xffffff,
  });
});

test("parses serialized custom cube color schemes", () => {
  expect(resolveCubeColors("U:#000,D:#fff")).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    U: "#000",
    D: "#fff",
  });
  expect(resolveCubeColors('{"F":"lime","B":"yellow"}')).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    F: "lime",
    B: "yellow",
  });
  expect(resolveCubeColors(" u : #000 , d : #fff ")).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    U: "#000",
    D: "#fff",
  });
  expect(resolveCubeColors({ u: "black", d: 0xffffff } as any)).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    U: "black",
    D: 0xffffff,
  });
});
