import { describe, it, expect } from "vitest";
import { summaryOf, num, fmt } from "@/lib/data/projects";

describe("projects utilities", () => {
  describe("num", () => {
    it("returns number for valid input", () => {
      expect(num(30)).toBe(30);
      expect(num("38.94")).toBe(38.94);
      expect(num(0)).toBe(0);
    });

    it("returns null for invalid input", () => {
      expect(num(null)).toBeNull();
      expect(num(undefined)).toBeNull();
      expect(num("")).toBeNull();
      expect(num("abc")).toBeNull();
      expect(num(NaN)).toBeNull();
    });
  });

  describe("fmt", () => {
    it("formats integers without decimals", () => {
      expect(fmt(30)).toBe("30");
      expect(fmt(0)).toBe("0");
    });

    it("formats decimals with 2 places", () => {
      expect(fmt(38.94)).toBe("38.94");
      expect(fmt(40.5)).toBe("40.5");
    });
  });

  describe("summaryOf", () => {
    it("builds Arabic and English summaries", () => {
      const result = summaryOf(30, 38.94, 40);
      expect(result.ar).toContain("ألواح 38.94 kWp");
      expect(result.ar).toContain("بطاريات 40 kWh");
      expect(result.ar).toContain("نظام 30 kW");
      expect(result.en).toContain("38.94 kWp PV");
      expect(result.en).toContain("40 kWh battery");
      expect(result.en).toContain("30 kW system");
    });

    it("handles missing values", () => {
      const result = summaryOf(null, 38.94, null);
      expect(result.ar).toBe("ألواح 38.94 kWp");
      expect(result.en).toBe("38.94 kWp PV");
    });

    it("returns empty strings when all null", () => {
      const result = summaryOf(null, null, null);
      expect(result.ar).toBe("");
      expect(result.en).toBe("");
    });
  });
});