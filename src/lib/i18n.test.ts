import { describe, expect, it } from "vitest";
import { isLocale, locales } from "./i18n";

describe("i18n", () => {
  it("accepts the supported locales", () => {
    for (const l of locales) expect(isLocale(l)).toBe(true);
  });
  it("rejects unknown values", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale("AR")).toBe(false);
  });
});
