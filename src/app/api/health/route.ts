import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase/public";
import { supabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, { status: "ok" | "degraded" | "down"; latencyMs?: number; error?: string }> = {};

  if (supabaseConfigured()) {
    const dbStart = Date.now();
    try {
      const { error } = await supabasePublic().from("projects").select("id").limit(1);
      checks.database = {
        status: error ? "down" : "ok",
        latencyMs: Date.now() - dbStart,
        error: error?.message,
      };
    } catch (e) {
      checks.database = {
        status: "down",
        latencyMs: Date.now() - dbStart,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  } else {
    checks.database = { status: "degraded", error: "Not configured (dev mode)" };
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const anyDown = Object.values(checks).some((c) => c.status === "down");

  return NextResponse.json(
    {
      status: allOk ? "ok" : anyDown ? "down" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.1.0",
      environment: process.env.NODE_ENV ?? "development",
      checks,
      latencyMs: Date.now() - start,
    },
    { status: allOk ? 200 : anyDown ? 503 : 200 }
  );
}