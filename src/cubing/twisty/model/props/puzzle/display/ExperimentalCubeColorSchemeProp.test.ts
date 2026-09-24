import { expect, test } from "bun:test";
import {
  BOY_CUBE_COLOR_SCHEME,
  ExperimentalCubeColorSchemeProp,
  JAPANESE_CUBE_COLOR_SCHEME,
  resolveCubeColorScheme,
} from "./ExperimentalCubeColorSchemeProp";

test("defaults to each renderer's native cube colors", async () => {
  const prop = new ExperimentalCubeColorSchemeProp();

  expect(await prop.get()).toBeUndefined();
  prop.set("boy");
  expect(await prop.get()).toEqual(BOY_CUBE_COLOR_SCHEME);
  prop.set("default");
  expect(await prop.get()).toBeUndefined();
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
  expect(resolveCubeColorScheme(" u : #000 , d : #fff ")).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    U: "#000",
    D: "#fff",
  });
  expect(resolveCubeColorScheme({ u: "black", d: 0xffffff } as any)).toEqual({
    ...BOY_CUBE_COLOR_SCHEME,
    U: "black",
    D: 0xffffff,
  });
});
