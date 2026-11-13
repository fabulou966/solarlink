import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { PROJECTS_TAG } from "@/lib/data/projects";

export function str(fd: FormData, key: string, max = 5000): string {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

export function numOrNull(fd: FormData, key: string): number | null {
  const raw = str(fd, key, 20).replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function refreshPublicPages() {
  updateTag(PROJECTS_TAG);
  revalidatePath("/ar");
  revalidatePath("/en");
}