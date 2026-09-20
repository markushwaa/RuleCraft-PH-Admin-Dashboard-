import { createClient } from "@supabase/supabase-js";

const projectUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!projectUrl || !publishableKey) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

let parsedProjectUrl;
try {
  parsedProjectUrl = new URL(projectUrl);
} catch {
  throw new Error("VITE_SUPABASE_URL must be a valid URL.");
}
const localDevelopment = import.meta.env.DEV &&
  ["localhost", "127.0.0.1"].includes(parsedProjectUrl.hostname);
if (parsedProjectUrl.protocol !== "https:" && !localDevelopment) {
  throw new Error("VITE_SUPABASE_URL must use HTTPS outside local development.");
}

// Public anon/publishable keys are expected in a browser. Reject a mistakenly exposed
// service-role JWT before the application can start or bundle it into a deployment.
const jwtParts = publishableKey.split(".");
if (jwtParts.length === 3) {
  try {
    const base64Payload = jwtParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(paddedPayload));
    if (payload?.role === "service_role") {
      throw new Error(
        "A Supabase service-role key must never be used in the administrator frontend.",
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("service-role")) throw error;
  }
}

export const supabase = createClient(parsedProjectUrl.toString().replace(/\/$/, ""), publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: { "X-Client-Info": "rulecraft-admin" },
  },
});
