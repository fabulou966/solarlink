import { describe, it, expect, vi } from "vitest";
import { slugify, numOrNull, str } from "@/lib/admin/actions-utils";

describe("admin actions utilities", () => {
  describe("slugify", () => {
    it("converts title to lowercase slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("handles Arabic text", () => {
      expect(slugify("نظام شمسي")).toBe("");
    });

    it("removes special characters", () => {
      expect(slugify("Test@#$%^&*()Project")).toBe("test-project");
    });

    it("truncates to 80 chars", () => {
      const long = "a".repeat(100);
      expect(slugify(long).length).toBe(80);
    });

    it("handles empty string", () => {
      expect(slugify("")).toBe("");
    });
  });

  describe("numOrNull", () => {
    it("parses valid numbers", () => {
      const fd = new FormData();
      fd.append("system_kw", "30");
      expect(numOrNull(fd, "system_kw")).toBe(30);
    });

    it("parses decimals", () => {
      const fd = new FormData();
      fd.append("pv_kwp", "38.94");
      expect(numOrNull(fd, "pv_kwp")).toBe(38.94);
    });

    it("handles comma decimal separator", () => {
      const fd = new FormData();
      fd.append("battery_kwh", "40,5");
      expect(numOrNull(fd, "battery_kwh")).toBe(40.5);
    });

    it("returns null for empty", () => {
      const fd = new FormData();
      fd.append("system_kw", "");
      expect(numOrNull(fd, "system_kw")).toBeNull();
    });

    it("returns null for invalid", () => {
      const fd = new FormData();
      fd.append("system_kw", "abc");
      expect(numOrNull(fd, "system_kw")).toBeNull();
    });
  });

  describe("str", () => {
    it("trims and limits length", () => {
      const fd = new FormData();
      fd.append("title_ar", "  hello world  ");
      expect(str(fd, "title_ar", 20)).toBe("hello world");
    });

    it("truncates to max", () => {
      const fd = new FormData();
      fd.append("description", "a".repeat(100));
      expect(str(fd, "description", 50).length).toBe(50);
    });

    it("returns empty for missing", () => {
      const fd = new FormData();
      expect(str(fd, "missing")).toBe("");
    });
  });
});