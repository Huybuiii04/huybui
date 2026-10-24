import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { AppError, getEnv } from "./http.ts";
import { constantTimeEqual } from "./security.ts";

export interface AuthenticatedContext {
  user: User;
  userId: string;
  service: SupabaseClient;
  userClient: SupabaseClient;
}

let serviceClient: SupabaseClient | undefined;
let publicClient: SupabaseClient | undefined;

export function getServiceClient(): SupabaseClient {
  if (serviceClient) return serviceClient;
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? getEnv("SUPABASE_SERVICE_KEY") ?? getEnv("SUPABASE_SECRET_KEY");
  if (!url || !key) {
    throw new AppError(503, "server_misconfigured", "The server is missing Supabase service credentials");
  }
  serviceClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return serviceClient;
}

export function getPublicClient(): SupabaseClient {
  if (publicClient) return publicClient;
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_ANON_KEY") ?? getEnv("SUPABASE_PUBLISHABLE_KEY") ?? getEnv("SUPABASE_SECRET_KEY");
  if (!url || !key) {
    throw new AppError(503, "server_misconfigured", "The server is missing Supabase API credentials");
  }
  publicClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return publicClient;
}

function getUserClient(token: string): SupabaseClient {
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_ANON_KEY") ?? getEnv("SUPABASE_PUBLISHABLE_KEY") ?? getEnv("SUPABASE_SECRET_KEY");
  if (!url || !key) {
    throw new AppError(503, "server_misconfigured", "The server is missing Supabase API credentials");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function requireAuthenticatedUser(request: Request): Promise<AuthenticatedContext> {
  const authorization = request.headers.get("authorization");
  if (!authorization) throw new AppError(401, "unauthenticated", "Authentication is required");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new AppError(401, "unauthenticated", "A Bearer access token is required");
  const token = match[1].trim();
  if (!token) throw new AppError(401, "unauthenticated", "A Bearer access token is required");

  const userClient = getUserClient(token);
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data.user) {
    throw new AppError(401, "unauthenticated", "The access token is invalid or expired");
  }

  const service = getServiceClient();
  await assertActiveUser(userClient, service, data.user.id);
  return { user: data.user, userId: data.user.id, service, userClient };
}

export async function requireAdmin(request: Request): Promise<AuthenticatedContext> {
  const context = await requireAuthenticatedUser(request);
  const isAdmin = await privateBoolean(context.userClient, "is_admin");
  if (isAdmin !== null) {
    if (!isAdmin) throw new AppError(403, "forbidden", "Administrator access is required");
    return context;
  }

  const access = await readAccess(context.service, context.userId);
  if (!access || access.role !== "admin" || access.status !== "active") {
    throw new AppError(403, "forbidden", "Administrator access is required");
  }
  return context;
}

export async function requireWorkerSecret(request: Request): Promise<void> {
  const expected = getEnv("WORKER_SECRET");
  if (!expected) throw new AppError(503, "server_misconfigured", "The worker secret is not configured");
  const provided = request.headers.get("x-worker-secret");
  if (!provided || !(await constantTimeEqual(provided, expected))) {
    throw new AppError(401, "invalid_worker_secret", "The worker secret is invalid");
  }
}

async function assertActiveUser(
  userClient: SupabaseClient,
  service: SupabaseClient,
  userId: string,
): Promise<void> {
  const privateResult = await privateBoolean(userClient, "is_active_user");
  if (privateResult !== null) {
    if (!privateResult) throw new AppError(403, "suspended", "This account is suspended");
    return;
  }

  const access = await readAccess(service, userId);
  if (!access || access.status !== "active") {
    throw new AppError(403, "suspended", "This account is suspended");
  }
}

async function privateBoolean(userClient: SupabaseClient, functionName: "is_active_user" | "is_admin"): Promise<boolean | null> {
  try {
    const { data, error } = await userClient.schema("private").rpc(functionName);
    if (!error && typeof data === "boolean") return data;
  } catch {
    // The private schema may not be exposed through PostgREST. The service-role
    // lookup below checks the same database row and never trusts JWT metadata.
  }
  return null;
}

async function readAccess(
  service: SupabaseClient,
  userId: string,
): Promise<{ role: "user" | "admin"; status: "active" | "suspended" } | null> {
  const { data, error } = await service
    .from("user_access")
    .select("role,status")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  if (data.role !== "user" && data.role !== "admin") return null;
  if (data.status !== "active" && data.status !== "suspended") return null;
  return { role: data.role, status: data.status };
}
