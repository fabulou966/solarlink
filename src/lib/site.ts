// ─── SolarLink site settings ────────────────────────────────────
// Edit values here; everything else in the site reads from this file.

export const site = {
  name: "SolarLink",

  // ⚠️ WhatsApp number — digits only with country code, no "+", no spaces.
  // Example: "218912345678"
  // TODO: not ready yet. Ask the owner before launching the contact step.
  // While empty, the quote form shows a "number not added" notice.
  whatsapp: "249117027936",

  // Public site URL (used for SEO / Open Graph / sitemap).
  // TODO: set to the real Vercel URL once deployed.
  url: "https://solarlink.vercel.app",
};

export function whatsappReady(): boolean {
  return site.whatsapp.trim().length > 0;
}
