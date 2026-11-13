import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { publicPhotoUrl, publicDocUrl, thumbUrl } from "@/lib/images";

describe("images utilities", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv;
  });

  describe("publicPhotoUrl", () => {
    it("returns full URL for bucket path", () => {
      expect(publicPhotoUrl("hybrid-30kw/cover.webp")).toBe(
        "https://test.supabase.co/storage/v1/object/public/project-photos/hybrid-30kw/cover.webp"
      );
    });

    it("returns absolute URLs unchanged", () => {
      expect(publicPhotoUrl("https://cdn.example.com/image.webp")).toBe(
        "https://cdn.example.com/image.webp"
      );
    });

    it("returns site-relative paths unchanged", () => {
      expect(publicPhotoUrl("/projects/hybrid-30kw/cover.webp")).toBe(
        "/projects/hybrid-30kw/cover.webp"
      );
    });

    it("returns empty for null/undefined", () => {
      expect(publicPhotoUrl(null)).toBe("");
      expect(publicPhotoUrl(undefined)).toBe("");
    });
  });

  describe("publicDocUrl", () => {
    it("returns full URL for bucket path", () => {
      expect(publicDocUrl("boq/project-123/doc.pdf")).toBe(
        "https://test.supabase.co/storage/v1/object/public/project-docs/boq/project-123/doc.pdf"
      );
    });

    it("returns absolute URLs unchanged", () => {
      expect(publicDocUrl("https://cdn.example.com/doc.pdf")).toBe(
        "https://cdn.example.com/doc.pdf"
      );
    });
  });

  describe("thumbUrl", () => {
    it("converts full URL to thumb variant", () => {
      const url = "https://test.supabase.co/storage/v1/object/public/project-photos/hybrid-30kw/cover.webp";
      expect(thumbUrl(url)).toBe(
        "https://test.supabase.co/storage/v1/object/public/project-photos/hybrid-30kw/cover-thumb.webp"
      );
    });

    it("handles paths without extension", () => {
      const result = thumbUrl("test");
      expect(result).toContain("test");
      expect(result).not.toContain("-thumb");
    });
  });
});