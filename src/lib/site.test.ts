import { describe, expect, it } from "vitest";
import { site, whatsappReady } from "./site";

describe("site settings", () => {
  it("reports WhatsApp readiness based on the configured number", () => {
    const original = site.whatsapp;
    site.whatsapp = "";
    expect(whatsappReady()).toBe(false);
    site.whatsapp = "249117027936";
    expect(whatsappReady()).toBe(true);
    site.whatsapp = original;
  });
});
