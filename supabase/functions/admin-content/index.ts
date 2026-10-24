import { requireAdmin } from "../_shared/auth.ts";
import { AppError, databaseError, errorResponse, jsonResponse, preflightResponse, readJsonBody, requestId, requireMethod } from "../_shared/http.ts";
import { parseAdminContent } from "../_shared/schemas.ts";

Deno.serve(async (request) => {
  const id = requestId();
  try {
    if (request.method === "OPTIONS") return preflightResponse(request);
    requireMethod(request, ["POST"]);
    const context = await requireAdmin(request);
    const input = parseAdminContent(await readJsonBody(request));

    let entryId = input.entry.id;
    if (input.action === "upsert") {
      const result = await context.service.from("content_entries").upsert({
        ...(entryId ? { id: entryId } : {}),
        kind: input.entry.kind,
        slug: input.entry.slug,
        task_type: input.entry.taskType ?? null,
        skill_tags: input.entry.skillTags ?? [],
        sort_order: input.entry.sortOrder ?? 0,
        status: input.entry.status ?? "draft",
        metadata: input.entry.metadata ?? {},
      }, { onConflict: "kind,slug" }).select("id,kind,slug,task_type,skill_tags,sort_order,status,metadata,created_at,updated_at").maybeSingle();
      if (result.error || !result.data) throw databaseError("save the content entry");
      entryId = result.data.id;
    } else if (input.action === "publish" || input.action === "hide") {
      const result = await context.service
        .from("content_entries")
        .update({ status: input.action === "publish" ? "published" : "hidden" })
        .eq("id", entryId!)
        .select("id,kind,slug,task_type,skill_tags,sort_order,status,metadata,created_at,updated_at")
        .maybeSingle();
      if (result.error) throw databaseError("update the content status");
      if (!result.data) throw new AppError(404, "entry_not_found", "Content entry not found");
    } else {
      const result = await context.service
        .from("content_entries")
        .delete()
        .eq("id", entryId!)
        .select("id")
        .maybeSingle();
      if (result.error) throw databaseError("delete the content entry");
      if (!result.data) throw new AppError(404, "entry_not_found", "Content entry not found");
    }

    if (input.action !== "delete" && input.translations?.length && entryId) {
      const translations = input.translations.map((translation) => ({
        entry_id: entryId,
        locale: translation.locale,
        title: translation.title,
        summary: translation.summary,
        body: translation.body,
      }));
      const translationResult = await context.service
        .from("content_translations")
        .upsert(translations, { onConflict: "entry_id,locale" });
      if (translationResult.error) throw databaseError("save the content translations");
    }

    const audit = await context.service.from("admin_audit_logs").insert({
      actor_id: context.userId,
      action: `admin.content.${input.action}`,
      target: entryId ?? "",
      metadata: {
        slug: input.entry.slug ?? "",
        locales: (input.translations ?? []).map((translation) => translation.locale),
      },
    });
    if (audit.error) throw databaseError("write the admin audit log");

    if (input.action === "delete") {
      return jsonResponse(request, 200, { ok: true, entry: { id: entryId } }, { requestId: id });
    }

    const entry = await context.service
      .from("content_entries")
      .select("id,kind,slug,task_type,skill_tags,sort_order,status,metadata,created_at,updated_at")
      .eq("id", entryId!)
      .maybeSingle();
    if (entry.error) throw databaseError("load the content entry");
    return jsonResponse(request, 200, { ok: true, entry: entry.data }, { requestId: id });
  } catch (error) {
    return errorResponse(request, error, id);
  }
});
