import { expect, test } from "bun:test";
import { CUBE_FACES, type ExperimentalCubeColorScheme } from "./index";

test("exports cube color scheme definitions from the twisty entry point", () => {
  expect(CUBE_FACES).toEqual(["U", "L", "F", "R", "B", "D"]);
  const scheme: ExperimentalCubeColorScheme = "japanese";
  expect(scheme).toBe("japanese");
});
