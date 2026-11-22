import { describe, expect, it } from "vitest";
import { publicPhotoUrl, publicDocUrl, thumbUrl } from "./images";

describe("image urls", () => {
  it("passes through absolute urls", () => {
    expect(publicPhotoUrl("https://example.com/x.webp")).toBe("https://example.com/x.webp");
  });
  it("passes through site-relative paths", () => {
    expect(publicPhotoUrl("/projects/a/cover.webp")).toBe("/projects/a/cover.webp");
  });
  it("returns empty for null/empty", () => {
    expect(publicPhotoUrl(null)).toBe("");
    expect(publicPhotoUrl("")).toBe("");
  });
  it("builds a thumbnail variant", () => {
    expect(thumbUrl("/projects/a/cover.webp")).toBe("/projects/a/cover-thumb.webp");
  });
  it("publicDocUrl passes through site-relative paths", () => {
    expect(publicDocUrl("/docs/x.pdf")).toBe("/docs/x.pdf");
  });
});
