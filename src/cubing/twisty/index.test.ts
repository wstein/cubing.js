import { expect, test } from "bun:test";
import { CUBE_FACES, type ExperimentalCubeColors } from "./index";

test("exports cube color definitions from the twisty entry point", () => {
  expect(CUBE_FACES).toEqual(["U", "L", "F", "R", "B", "D"]);
  const colors: ExperimentalCubeColors = "japanese";
  expect(colors).toBe("japanese");
});
