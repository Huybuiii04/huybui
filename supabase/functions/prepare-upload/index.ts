import { requireAuthenticatedUser } from "../_shared/auth.ts";
import { AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { parsePrepareUpload } from "../_shared/schemas.ts";
import { ESSAY_IMAGE_BUCKET } from "../_shared/storage.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAuthenticatedUser(request);
    const input = parsePrepareUpload(await readJsonBody(request));

    const essayResult = await context.service
      .from("essays")
      .select("id,status")
      .eq("id", input.essayId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (essayResult.error) throw databaseError("load the essay");
    if (!essayResult.data) throw new AppError(404, "essay_not_found", "Essay not found");
    if (essayResult.data.status !== "active") {
      throw new AppError(409, "essay_not_active", "The essay is being deleted and cannot accept images");
    }

    const assetId = crypto.randomUUID();
    const extension = extensionForMime(input.mimeType);
    const objectPath = `${context.userId}/${input.essayId}/${assetId}.${extension}`;
    const insert = await context.service.from("essay_assets").insert({
      id: assetId,
      user_id: context.userId,
      essay_id: input.essayId,
      object_path: objectPath,
      mime_type: input.mimeType,
      byte_size: input.byteSize,
      content_hash: input.sha256,
      status: "pending",
    }).select("id").maybeSingle();
    if (insert.error || !insert.data) throw databaseError("create the image record");

    const signed = await context.service.storage.from(ESSAY_IMAGE_BUCKET).createSignedUploadUrl(objectPath, {
      upsert: false,
    });
    if (signed.error) {
      await context.service.from("essay_assets").delete().eq("id", assetId).eq("user_id", context.userId);
      throw new AppError(503, "storage_unavailable", "Could not prepare the image upload. Please retry.");
    }

    return jsonResponse(request, 201, {
      assetId,
      objectPath,
      path: signed.data.path ?? objectPath,
      token: signed.data.token,
      signedUrl: signed.data.signedUrl,
    }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});

function extensionForMime(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  throw new AppError(400, "invalid_mime_type", "Unsupported image MIME type");
}
