import { actorFromRequest, ensureCatalog, json, normalizeGoogleDocUrl, normalizeHttpUrl, normalizeProject, recordActivity, validDateRange, validIsoDate, verifyGoogleDocLinkAccess } from '../../_lib.js';
import { syncTranslationFocusForProject } from '../../_translation.js';

const fields = new Set([
  'title_ar','title_en','assignee','status','source_url','source_pdf_url','google_doc_url','cover_url',
  'start_date','due_date','notes'
]);
const statusOrder = ['not_started','in_progress','review','completed','published'];
const validStatuses = new Set(statusOrder);
function validStatusTransition(from, to) {
  if (from === to) return true;
  const a=statusOrder.indexOf(from), b=statusOrder.indexOf(to);
  return a >= 0 && b >= 0 && Math.abs(a-b) === 1;
}
const validAssignees = new Set(['Zahraa','Mohammed','Brother','Both','Unassigned']);

function idFrom(context) {
  const n = Number(context.params.id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function onRequestGet(context) {
  const id = idFrom(context);
  if (!id) return json({ error: 'Invalid project id.' }, 400);
  const row = await context.env.DB.prepare('SELECT p.*, EXISTS(SELECT 1 FROM project_covers c WHERE c.project_id=p.id) AS has_uploaded_cover FROM projects p WHERE p.id = ?').bind(id).first();
  return row ? json({ project: normalizeProject(row) }) : json({ error: 'Project not found.' }, 404);
}

export async function onRequestPatch(context) {
  await ensureCatalog(context.env.DB);
  const id = idFrom(context);
  if (!id) return json({ error: 'Invalid project id.' }, 400);
  const before = await context.env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  if (!before) return json({ error: 'Project not found.' }, 404);
  const body = await context.request.json().catch(() => null);
  if (!body || typeof body !== 'object') return json({ error: 'Invalid JSON body.' }, 400);

  if (body.status !== undefined && !validStatuses.has(body.status)) return json({ error: 'Invalid status.' }, 400);
  if (body.status !== undefined && !validStatusTransition(before.status, body.status)) {
    return json({ error: 'Workflow stages must move one step at a time: Not Started → Translating → Needs Formatting → Needs Review → Publish Ready.' }, 409);
  }
  const normalizedBefore=normalizeProject(before);
  if (before.status === 'in_progress' && body.status === 'review' && normalizedBefore.page_count_verified
      && Number(before.translated_pages || 0) < Number(before.pages || 0)) {
    return json({ error: 'Verified source-page translation must reach the physical PDF total before Needs Formatting.' }, 409);
  }
  if(context.env?.WORKBENCH_REQUIRE_QA_EVIDENCE==='1' && body.status && body.status!==before.status){
    if(before.status==='in_progress' && body.status==='review'){
      const {results}=await context.env.DB.prepare(
        'SELECT from_page,to_page,source_pdf_sha256 FROM translation_quality_evidence WHERE project_id=? ORDER BY from_page,to_page'
      ).bind(id).all();
      const latest=await context.env.DB.prepare('SELECT source_pdf_sha256 FROM translation_progress_checkpoints WHERE project_id=? ORDER BY id DESC LIMIT 1').bind(id).first();
      const rows=(results||[]).filter(q=>q.source_pdf_sha256===latest?.source_pdf_sha256);
      let end=0;
      for(const item of rows){if(item.from_page<=end+1 && item.to_page>end)end=item.to_page;}
      if(!normalizedBefore.page_count_verified || end<Number(before.pages||0)){
        return json({error:'Cannot enter Needs Formatting: complete, source-consistent QA receipts do not cover every physical page.',code:'qa_coverage_incomplete'},409);
      }
    }
    if(before.status==='review' && body.status==='completed'){
      const latest=await context.env.DB.prepare('SELECT source_pdf_sha256,google_doc_revision FROM translation_progress_checkpoints WHERE project_id=? ORDER BY id DESC LIMIT 1').bind(id).first();
      const whole=await context.env.DB.prepare(`SELECT id FROM translation_quality_evidence
        WHERE project_id=? AND from_page=1 AND to_page=? AND source_pdf_sha256=? AND google_doc_revision=? LIMIT 1`)
        .bind(id,Number(before.pages||0),latest?.source_pdf_sha256||'',latest?.google_doc_revision||'').first();
      if(!whole)return json({error:'Whole-book rendered/TOC/publication QA receipt is required before Needs Review.',code:'whole_book_qa_required'},409);
    }
    if(before.status==='completed' && body.status==='published'){
      const qa=await context.env.DB.prepare(`SELECT source_pdf_sha256,google_doc_revision FROM translation_quality_evidence
        WHERE project_id=? AND from_page=1 AND to_page=? ORDER BY id DESC LIMIT 1`)
        .bind(id,Number(before.pages||0)).first();
      const attestation=qa?await context.env.DB.prepare(`SELECT id FROM translation_human_review_attestations
        WHERE project_id=? AND source_pdf_sha256=? AND google_doc_revision=? ORDER BY id DESC LIMIT 1`)
        .bind(id,qa.source_pdf_sha256,qa.google_doc_revision).first():null;
      if(!attestation)return json({error:'Publish Ready requires a reviewer-only credential-backed human attestation tied to this exact post-QA manuscript.',code:'human_review_attestation_required'},409);
    }
  }
  if (body.published === true && (before.status !== 'published' || (body.status !== undefined && body.status !== 'published'))) {
    return json({ error: 'Save the book as Publish Ready first; publication is a separate step and cannot remain set while rewinding workflow.' }, 409);
  }
  if (body.assignee !== undefined && !validAssignees.has(body.assignee)) return json({ error: 'Invalid assignee.' }, 400);

  if (body.google_doc_url !== undefined) {
    const normalized = normalizeGoogleDocUrl(body.google_doc_url);
    if (normalized === false) return json({ error: 'English Book must be a Google Docs document link.' }, 400);
    if (normalized) {
      const access = await verifyGoogleDocLinkAccess(normalized);
      if (!access.accessible) {
        return json({ error: 'English Book must be publicly accessible without sign-in before it can be linked. Set sharing to Anyone with the link → Editor.' }, 400);
      }
    }
    body.google_doc_url = normalized || '';
  }
  if (body.cover_url !== undefined) {
    const normalized = normalizeHttpUrl(body.cover_url);
    if (normalized === false) return json({ error: 'Cover image must use an http(s) URL.' }, 400);
    body.cover_url = normalized || '';
  }
  if (body.source_pdf_url !== undefined) {
    const normalized = normalizeHttpUrl(body.source_pdf_url);
    if (normalized === false) return json({ error: 'Arabic source PDF must use an http(s) URL.' }, 400);
    body.source_pdf_url = normalized || '';
  }
  if ((body.start_date !== undefined && !validIsoDate(body.start_date)) || (body.due_date !== undefined && !validIsoDate(body.due_date))) {
    return json({ error: 'Dates must use YYYY-MM-DD.' }, 400);
  }
  const nextStartDate=body.start_date !== undefined ? body.start_date : before.start_date;
  const nextDueDate=body.due_date !== undefined ? body.due_date : before.due_date;
  if (!validDateRange(nextStartDate,nextDueDate)) {
    return json({ error: 'Start date cannot be after the deadline.' }, 409);
  }
  if (body.translated_pages !== undefined) {
    return json({ error: 'Translation progress is verification-owned. Use the dedicated progress checkpoint endpoint.' }, 400);
  }

  const updates = [];
  const values = [];
  for (const [key, raw] of Object.entries(body)) {
    if (!fields.has(key)) continue;
    const value = raw === '' ? null : raw;
    updates.push(`${key} = ?`);
    values.push(value);
  }
  if (body.source_pdf_url !== undefined) {
    const nextPdf = body.source_pdf_url === '' ? null : body.source_pdf_url;
    if ((before.source_pdf_url || null) !== nextPdf) {
      if (nextPdf) {
        updates.push("pdf_status = 'unchecked'");
        updates.push('pdf_checked_at = NULL');
        updates.push("pdf_check_note = 'Awaiting validation'");
      } else {
        updates.push("pdf_status = 'missing'");
        updates.push('pdf_checked_at = NULL');
        updates.push("pdf_check_note = 'No direct PDF URL'");
      }
    }
  }

  const now = new Date().toISOString();
  const actor = actorFromRequest(context.request);
  const translatedStatuses = new Set(['review','completed','published']);
  const nextStatus = body.status ?? before.status;
  const wasTranslated = translatedStatuses.has(before.status);
  const willBeTranslated = translatedStatuses.has(nextStatus);

  if (!wasTranslated && willBeTranslated) {
    updates.push('completed_at = ?'); values.push(now);
    updates.push('completed_by = ?'); values.push(actor);
  } else if (wasTranslated && !willBeTranslated) {
    updates.push('completed_at = NULL');
    updates.push('completed_by = NULL');
  }

  if (body.published !== undefined) {
    if (body.published && !before.published_at) {
      updates.push('published_at = ?'); values.push(now);
      updates.push('published_by = ?'); values.push(actor);
    } else if (!body.published && before.published_at) {
      updates.push('published_at = NULL');
      updates.push('published_by = NULL');
    }
  } else if (body.status !== undefined && body.status !== 'published' && before.published_at) {
    updates.push('published_at = NULL');
    updates.push('published_by = NULL');
  }

  if (!updates.length) return json({ project: normalizeProject(before) });
  updates.push('updated_at = ?'); values.push(now);
  values.push(id);

  const after = await context.env.DB.prepare(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = ? RETURNING *`
  ).bind(...values).first();

  await recordActivity(context.env.DB, id, actor, 'updated project', before, after);
  await syncTranslationFocusForProject(context.env.DB, after, actor);
  return json({ project: normalizeProject(after) });
}
