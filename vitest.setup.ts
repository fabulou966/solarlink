import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, "localStorage", {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

vi.mock("next/navigation", () => ({
  useRouter() {
    return { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() };
  },
  usePathname() {
    return "/ar";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/env", () => ({
  supabaseConfigured: () => false,
  supabaseEnv: () => ({ url: "http://localhost", anonKey: "test" }),
  supabaseServiceKey: () => "test",
}));

vi.mock("@/lib/supabase/public", () => ({
  supabasePublic: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ data: [], error: null }) }) }),
    }),
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: () => Promise.resolve({
    auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
    rpc: () => Promise.resolve({ data: false }),
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ data: [], error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "test" } }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: () => ({
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: null }),
        remove: () => Promise.resolve({ error: null }),
      }),
    },
  }),
}));

vi.mock("@/lib/site", () => ({
  site: { name: "SolarLink", whatsapp: "249117027936", url: "https://solarlink.vercel.app" },
  whatsappReady: () => true,
}));

vi.mock("@/lib/data/projects", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/projects")>();
  return {
    ...actual,
    getPublishedProjects: () => Promise.resolve([]),
    getPublishedProject: () => Promise.resolve(null),
    getPublishedSlugs: () => Promise.resolve([]),
  };
});

vi.mock("sharp", () => ({
  default: () => ({
    metadata: () => Promise.resolve({ width: 1600, height: 900 }),
    rotate: () => ({ resize: () => ({ webp: () => ({ toBuffer: () => Promise.resolve(Buffer.from("test")) }) }) }),
    resize: () => ({ webp: () => ({ toBuffer: () => Promise.resolve(Buffer.from("test")) }) }),
    webp: () => ({ toBuffer: () => Promise.resolve(Buffer.from("test")) }),
  }),
}));

vi.mock("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  updateTag: () => {},
}));

vi.mock("server-only", () => ({}));