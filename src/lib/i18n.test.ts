import { describe, it, expect } from "vitest";
import { dict, isLocale, locales, defaultLocale, type Locale } from "@/lib/i18n";

describe("i18n", () => {
  describe("locales", () => {
    it("contains ar and en", () => {
      expect(locales).toEqual(["ar", "en"]);
    });
  });

  describe("defaultLocale", () => {
    it("is Arabic", () => {
      expect(defaultLocale).toBe("ar");
    });
  });

  describe("isLocale", () => {
    it("returns true for valid locales", () => {
      expect(isLocale("ar")).toBe(true);
      expect(isLocale("en")).toBe(true);
    });

    it("returns false for invalid locales", () => {
      expect(isLocale("fr")).toBe(false);
      expect(isLocale("")).toBe(false);
      expect(isLocale("AR")).toBe(false);
    });
  });

  describe("dict", () => {
    it("has Arabic and English dictionaries", () => {
      expect(dict.ar).toBeDefined();
      expect(dict.en).toBeDefined();
    });

    it("has required keys in both languages", () => {
      const requiredKeys = ["nav1", "nav2", "nav3", "h1", "cta", "title", "description"];
      requiredKeys.forEach((key) => {
        expect(dict.ar[key as keyof typeof dict.ar]).toBeDefined();
        expect(dict.en[key as keyof typeof dict.en]).toBeDefined();
      });
    });

    it("has RTL for Arabic, LTR for English", () => {
      expect(dict.ar.dir).toBe("rtl");
      expect(dict.en.dir).toBe("ltr");
    });
  });
});