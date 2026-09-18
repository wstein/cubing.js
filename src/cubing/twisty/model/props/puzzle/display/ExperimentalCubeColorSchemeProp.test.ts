import { expect, test } from "bun:test";
import {
  BOY_CUBE_COLOR_SCHEME,
  ExperimentalCubeColorSchemeProp,
  JAPANESE_CUBE_COLOR_SCHEME,
  resolveCubeColorScheme,
} from "./ExperimentalCubeColorSchemeProp";

test("defaults to the BOY cube color scheme", async () => {
  const prop = new ExperimentalCubeColorSchemeProp();

  expect(await prop.get()).toEqual(BOY_CUBE_COLOR_SCHEME);
});

test("resolves named cube color schemes by face", () => {
  expect(resolveCubeColorScheme("boy")).toEqual(BOY_CUBE_COLOR_SCHEME);
  expect(resolveCubeColorScheme("western")).toEqual(BOY_CUBE_COLOR_SCHEME);
  expect(resolveCubeColorScheme("japanese")).toEqual(
    JAPANESE_CUBE_COLOR_SCHEME,
  );
});

test("merges a custom cube color scheme with BOY", async () => {
  const prop = new ExperimentalCubeColorSchemeProp();

  prop.set({ U: "black", D: 0xffffff });
  expect(await prop.get()).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    U: "black",
    D: 0xffffff,
  });
});

test("parses serialized custom cube color schemes", () => {
  expect(resolveCubeColorScheme("U:#000,D:#fff")).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    U: "#000",
    D: "#fff",
  });
  expect(resolveCubeColorScheme('{"F":"lime","B":"yellow"}')).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    F: "lime",
    B: "yellow",
  });
});
