import { assertUnreachable } from "../tools/utils";

describe("utils tests", () => {
  test("assertUnreachable", () => {
    expect(() => assertUnreachable("hi" as never)).toThrow();
  });
});
