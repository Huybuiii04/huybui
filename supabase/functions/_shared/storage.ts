import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "./http.ts";
import { sha256Hex } from "./jobs.ts";
import type { PromptImage } from "./prompts.ts";
import { detectImageMimeType } from "./security.ts";

export const ESSAY_IMAGE_BUCKET = "essay-images";

/** Bucket audio của module Speaking — private, xoá sau khi chấm. */
export const SPEAKING_AUDIO_BUCKET = "speaking-audio";

export interface EssayAssetRow {
  id: string;
  user_id: string;
  essay_id: string;
  object_path: string;
  mime_type: "image/png" | "image/jpeg" | "image/webp";
  byte_size: number;
  content_hash: string;
  status: "pending" | "ready" | "deleted";
}

export async function finalizePendingAssets(
  service: SupabaseClient,
  essayId: string,
  userId: string,
): Promise<EssayAssetRow[]> {
  const { data, error } = await service
    .from("essay_assets")
    .select("id,user_id,essay_id,object_path,mime_type,byte_size,content_hash,status")
    .eq("essay_id", essayId)
    .eq("user_id", userId)
    .neq("status", "deleted")
    .order("created_at", { ascending: true });
  if (error) throw new AppError(503, "database_unavailable", "Could not load the essay images");

  const assets = (data ?? []) as EssayAssetRow[];
  const ready: EssayAssetRow[] = [];
  for (const asset of assets) {
    if (asset.status === "ready") {
      ready.push(asset);
      continue;
    }
    if (asset.status !== "pending") continue;

    const download = await service.storage.from(ESSAY_IMAGE_BUCKET).download(asset.object_path);
    if (download.error) {
      if (isNotFound(download.error)) continue;
      throw new AppError(503, "storage_unavailable", "Could not verify an uploaded image");
    }

    const bytes = new Uint8Array(await download.data.arrayBuffer());
    const detected = detectImageMimeType(bytes);
    if (!detected || detected !== asset.mime_type) {
      throw new AppError(400, "invalid_image", "An uploaded file does not match its declared image type");
    }
    if (bytes.byteLength !== asset.byte_size || bytes.byteLength > 5 * 1024 * 1024) {
      throw new AppError(400, "invalid_image_size", "An uploaded image has an unexpected size");
    }
    const actualHash = await sha256Hex(bytes);
    if (actualHash !== asset.content_hash.toLowerCase()) {
      throw new AppError(400, "image_hash_mismatch", "An uploaded image does not match its declared SHA-256");
    }

    const update = await service
      .from("essay_assets")
      .update({ status: "ready" })
      .eq("id", asset.id)
      .eq("user_id", userId)
      .eq("status", "pending");
    if (update.error) throw new AppError(503, "database_unavailable", "Could not finalize an uploaded image");
    ready.push({ ...asset, status: "ready" });
  }
  return ready;
}

export async function loadAssetImages(
  service: SupabaseClient,
  assets: EssayAssetRow[],
): Promise<PromptImage[]> {
  const images: PromptImage[] = [];
  for (const asset of assets) {
    const download = await service.storage.from(ESSAY_IMAGE_BUCKET).download(asset.object_path);
    if (download.error) {
      throw new AppError(503, "storage_unavailable", "Could not read an essay image");
    }
    const bytes = new Uint8Array(await download.data.arrayBuffer());
    images.push({
      mediaType: asset.mime_type,
      data: bytesToBase64(bytes),
    });
  }
  return images;
}

export async function removeEssayAssetObjects(
  service: SupabaseClient,
  assets: Pick<EssayAssetRow, "object_path">[],
): Promise<void> {
  const uniquePaths = [...new Set(assets.map((asset) => asset.object_path))];
  if (!uniquePaths.length) return;
  const { error } = await service.storage.from(ESSAY_IMAGE_BUCKET).remove(uniquePaths);
  if (error && !isNotFound(error)) {
    throw new AppError(503, "storage_cleanup_failed", "Could not remove the essay images. Please retry deletion.");
  }
}

export async function removeUserAssetObjects(
  service: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data, error } = await service
    .from("essay_assets")
    .select("object_path")
    .eq("user_id", userId)
    .neq("status", "deleted");
  if (error) throw new AppError(503, "database_unavailable", "Could not load the account images");
  await removeEssayAssetObjects(service, (data ?? []) as Pick<EssayAssetRow, "object_path">[]);
}

/**
 * Xoá toàn bộ recording của user trong bucket `speaking-audio`.
 * Các row trong `speaking_attempts` bị `on delete cascade` xoá theo `auth.users`, nhưng
 * object trong Storage thì không — nên phải dọn riêng khi xoá tài khoản.
 */
export async function removeUserSpeakingAudioObjects(
  service: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data, error } = await service.storage.from(SPEAKING_AUDIO_BUCKET).list(userId, { limit: 1000 });
  if (error) return;
  const paths = (data ?? []).map((item) => `${userId}/${item.name}`);
  if (!paths.length) return;
  await service.storage.from(SPEAKING_AUDIO_BUCKET).remove(paths);
}

/** Xoá một danh sách recording cụ thể (dùng sau khi chấm xong). */
export async function removeSpeakingAudioObjects(
  service: SupabaseClient,
  paths: string[],
): Promise<void> {
  const unique = [...new Set(paths.filter((path) => Boolean(path)))];
  if (!unique.length) return;
  await service.storage.from(SPEAKING_AUDIO_BUCKET).remove(unique);
}

function isNotFound(error: { statusCode?: string | number; status?: number; message?: string }): boolean {
  const rawStatus = error.statusCode ?? error.status;
  const status = typeof rawStatus === "string" ? Number(rawStatus) : rawStatus;
  return status === 404 || /not found/i.test(error.message ?? "");
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}
