// Token quản trị lớp 2: HMAC-SHA256(userId|hạn) + so sánh constant-time.
// Dùng WebCrypto nên chạy được cả trên Deno (Edge Function) và Node (test).

import { constantTimeEqual } from "./security.ts";

const encoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64Url(new Uint8Array(signature));
}

/** Token = base64url(userId|expiresAt) + "." + base64url(HMAC). */
export async function signAdminToken(userId: string, expiresAt: number, secret: string): Promise<string> {
  const payload = base64Url(encoder.encode(`${userId}|${expiresAt}`));
  return `${payload}.${await hmac(payload, secret)}`;
}

/** Kiểm tra chữ ký, hạn và user. */
export async function verifyAdminToken(token: string, userId: string, now: number, secret: string): Promise<boolean> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(payload, secret);
  if (!(await constantTimeEqual(expected, signature))) return false;
  let decoded: string;
  try {
    decoded = fromBase64Url(payload);
  } catch {
    return false;
  }
  const separator = decoded.lastIndexOf("|");
  if (separator === -1) return false;
  const tokenUser = decoded.slice(0, separator);
  const expiresAt = Number(decoded.slice(separator + 1));
  if (tokenUser !== userId) return false;
  if (!Number.isFinite(expiresAt)) return false;
  return expiresAt > now;
}
