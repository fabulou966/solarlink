"use client";

// Share button: native share sheet on mobile, WhatsApp fallback elsewhere.
export default function ShareButton({
  label,
  title,
  text,
  url = "",
}: {
  label: string;
  title: string;
  text: string;
  url?: string;
}) {
  const share = async () => {
    const finalUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const payload = { title, text, url: finalUrl };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        /* user cancelled */
      }
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${title}\n${text}\n${finalUrl}`)}`,
        "_blank",
      );
    }
  };
  return <button onClick={share}>{label}</button>;
}
