import { googleDocIdFromUrl, normalizeProject } from './_lib.js';

export const TRANSLATORS = new Set(['Zahraa','Mohammed','Brother']);

function textOrNull(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function safeJsonArray(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function normalizeSourcePack(row) {
  if (!row) return {
    source_text_kind: null,
    source_text_url: null,
    recovery_routes: [],
    page_alignment_note: null,
    known_issues: null,
    resume_note: null,
    updated_at: null,
  };
  return {
    source_text_kind: textOrNull(row.source_text_kind),
    source_text_url: textOrNull(row.source_text_url),
    recovery_routes: safeJsonArray(row.recovery_routes_json),
    page_alignment_note: textOrNull(row.page_alignment_note),
    known_issues: textOrNull(row.known_issues),
    resume_note: textOrNull(row.resume_note),
    updated_at: row.updated_at || null,
  };
}

function hex(bytes) {
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2,'0')).join('');
}

export async function readPublicProgressMarker(project) {
  const normalizedProject = normalizeProject(project);
  if (!normalizedProject.page_count_verified) {
    return { status: 409, data: { error: 'Verified marker sync requires a verified physical-PDF page denominator.' } };
  }

  const docId = googleDocIdFromUrl(project?.google_doc_url);
  if (!docId) return { status: 200, data: { marker_found: false, unchanged: true } };

  let response;
  try {
    response = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`, {
      redirect: 'follow',
      headers: { 'user-agent': 'Haydari-Translation-Workbench/1.0' },
    });
  } catch {
    return { status: 502, data: { error: 'Could not read the public English Google Doc export.' } };
  }
  if (!response.ok) {
    return {
      status: 502,
      data: {
        error: 'Public English Google Doc export is unavailable.',
        source_status: response.status,
      },
    };
  }

  const text = await response.text();
  const matches = [...text.matchAll(/⟦WBPROGRESS:(\d+):(\d+):(\d+)⟧/g)];
  if (!matches.length) return { status: 200, data: { marker_found: false, unchanged: true } };

  const match = matches[matches.length - 1];
  const markerProject = Number(match[1]);
  const pages = Number(match[2]);
  const total = Number(match[3]);
  if (markerProject !== Number(project.id)) {
    return { status: 409, data: { error: 'Workbench progress marker project id does not match this project.' } };
  }
  if (
    !Number.isInteger(pages) || pages < 0 ||
    !Number.isInteger(total) || total <= 0 ||
    total !== Number(project.pages || 0) ||
    pages > total
  ) {
    return { status: 409, data: { error: 'Workbench progress marker does not match the verified physical-PDF denominator.' } };
  }

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return {
    status: 200,
    data: {
      marker_found: true,
      marker_pages: pages,
      marker_total: total,
      export_sha256: hex(digest),
    },
  };
}

export async function setTranslationFocus(db, assignee, projectId) {
  if (!TRANSLATORS.has(assignee)) throw new Error('Invalid translation assignee.');
  await db.prepare(`
    INSERT INTO translation_focus(assignee, project_id, updated_at)
    VALUES(?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(assignee) DO UPDATE SET project_id=excluded.project_id, updated_at=excluded.updated_at
  `).bind(assignee, projectId).run();
}

export async function syncTranslationFocusForProject(db, project, actor = 'Unknown') {
  if (!project?.id) return;

  if (project.status !== 'in_progress') {
    await db.prepare('DELETE FROM translation_focus WHERE project_id = ?').bind(project.id).run();
    return;
  }

  if (TRANSLATORS.has(project.assignee)) {
    await db.prepare('DELETE FROM translation_focus WHERE project_id = ? AND assignee <> ?').bind(project.id, project.assignee).run();
    await setTranslationFocus(db, project.assignee, project.id);
    return;
  }

  if (project.assignee === 'Both' && TRANSLATORS.has(actor)) {
    await setTranslationFocus(db, actor, project.id);
  }
}

export async function resolveCurrentTranslation(db, assignee) {
  if (!TRANSLATORS.has(assignee)) return null;

  const explicit = await db.prepare(`
    SELECT p.*
    FROM translation_focus f
    JOIN projects p ON p.id=f.project_id
    WHERE f.assignee=? AND p.status='in_progress' AND (p.assignee=? OR p.assignee='Both')
    LIMIT 1
  `).bind(assignee, assignee).first();
  if (explicit) return { project: explicit, focus_source: 'explicit' };

  const derived = await db.prepare(`
    SELECT *
    FROM projects
    WHERE status='in_progress' AND (assignee=? OR assignee='Both')
    ORDER BY COALESCE(translation_progress_at, updated_at, created_at) DESC, id DESC
    LIMIT 1
  `).bind(assignee).first();
  return derived ? { project: derived, focus_source: 'derived' } : null;
}

function projectResumeNoteProjection(project, effectivePages, totalPages) {
  const note=textOrNull(project?.notes);
  if (!note) return { project_notes:null, project_notes_warning:null };

  const checkpoint=note.match(/Verified physical source-page checkpoint:\s*(\d+)\s*\/\s*(\d+)/i);
  const continuePage=note.match(/Continue sequentially from physical source page\s+(\d+)/i);
  const saysActive=/\bTranslation active\b/i.test(note);
  const staleCheckpoint=Boolean(checkpoint && (
    Number(checkpoint[1]) !== Number(effectivePages) ||
    (totalPages > 0 && Number(checkpoint[2]) !== Number(totalPages))
  ));
  const stalePhase=project?.status !== 'in_progress' && (saysActive || continuePage);

  if (staleCheckpoint || stalePhase) {
    return {
      project_notes:null,
      project_notes_warning:'A volatile translation-resume note was withheld because it conflicts with authoritative workflow/progress state.',
    };
  }
  return { project_notes:note, project_notes_warning:null };
}

function translationResumeInstruction(project, nextSourcePage, totalPages) {
  if (project?.status === 'not_started') {
    return 'Translation has not started. Link/open the English Book, verify source identity and the canonical PDF, then begin at physical source page 1.';
  }
  if (project?.status === 'in_progress') {
    if (Number.isInteger(nextSourcePage) && nextSourcePage > 0) {
      return `Open the linked English Doc, confirm the highest verified WBPROGRESS marker and [[NEXT_BATCH]] sentinel, then continue from physical source page ${nextSourcePage} using the canonical PDF plus any stored recovery witness.`;
    }
    return `Verified source-page progress has reached the source total${totalPages ? ` of ${totalPages} pages` : ''}. Do not translate further; reconcile the workflow stage before additional source-page work.`;
  }
  if (project?.status === 'review') {
    return 'Translation text is complete. Do not resume source-page translation. Continue the Needs Formatting pass; formatting, review, and publication remain separate gates.';
  }
  if (project?.status === 'completed') {
    return 'The book is in Needs Review. Do not resume source-page translation. Continue human review and resolve review findings before Publish Ready.';
  }
  if (project?.status === 'published') {
    return project?.published_at
      ? 'The book is Publish Ready and already marked Published. Do not resume translation; only publication maintenance or an explicit workflow rewind can reopen translation work.'
      : 'The book is Publish Ready. Do not resume source-page translation; actual publication is a separate action.';
  }
  return 'Workflow state is not recognized. Do not resume translation until the project state is reconciled.';
}

export async function getTranslationContext(db, request, projectId) {
  const project = await db.prepare(`
    SELECT p.*, EXISTS(SELECT 1 FROM project_covers c WHERE c.project_id=p.id) AS has_uploaded_cover
    FROM projects p
    WHERE p.id=?
  `).bind(projectId).first();
  if (!project) return null;

  const [checkpoint, sourcePack, markerResult] = await Promise.all([
    db.prepare('SELECT * FROM translation_progress_checkpoints WHERE project_id=? ORDER BY id DESC LIMIT 1').bind(projectId).first(),
    db.prepare('SELECT * FROM translation_source_packs WHERE project_id=?').bind(projectId).first(),
    readPublicProgressMarker(project),
  ]);

  const normalizedProject = normalizeProject(project);
  const storedPages = Math.max(0, Number(project.translated_pages || 0));
  const totalPages = Math.max(0, Number(project.pages || 0));
  const hasCheckpointSourceIdentity = /^[a-f0-9]{64}$/.test(String(checkpoint?.source_pdf_sha256 || '').toLowerCase());
  const markerUsable =
    normalizedProject.page_count_verified === true &&
    markerResult.status === 200 &&
    markerResult.data?.marker_found === true &&
    hasCheckpointSourceIdentity;
  const markerPages = markerUsable ? Number(markerResult.data.marker_pages) : null;
  const effectivePages = markerPages === null ? storedPages : Math.max(storedPages, markerPages);
  const progressState =
    markerPages !== null && markerPages > storedPages ? 'verified-marker-ahead-of-d1' :
    markerPages !== null && markerPages < storedPages ? 'd1-ahead-of-marker' :
    'synchronized-or-d1-only';

  let focusedFor = [];
  if (project.status === 'in_progress') {
    const focusRows = await db.prepare('SELECT assignee FROM translation_focus WHERE project_id=? ORDER BY assignee').bind(projectId).all();
    focusedFor = (focusRows.results || []).map(row => row.assignee);
  }

  const nextSourcePage=totalPages && effectivePages < totalPages ? effectivePages + 1 : null;
  const projectedNotes=projectResumeNoteProjection(project,effectivePages,totalPages);
  const normalizedSourcePack=normalizeSourcePack(sourcePack);
  const sourcePackProjection=project.status === 'in_progress'
    ? { ...normalizedSourcePack, archived_resume_note:null }
    : { ...normalizedSourcePack, archived_resume_note:normalizedSourcePack.resume_note, resume_note:null };

  const origin = new URL(request.url).origin;
  return {
    context_version: 'translation-fast-start-v1',
    project: normalizedProject,
    source: {
      workbench_pdf_url: `${origin}/api/pdf/${project.id}`,
      canonical_pdf_url: project.source_pdf_url || null,
      physical_pages: totalPages || null,
      page_basis: normalizedProject.page_count_basis || 'physical_pdf',
      page_count_verified: normalizedProject.page_count_verified === true,
      pdf_status: project.pdf_status || null,
      pdf_checked_at: project.pdf_checked_at || null,
      pdf_check_note: project.pdf_check_note || null,
      source_pdf_sha256: checkpoint?.source_pdf_sha256 || null,
    },
    target: {
      google_doc_url: project.google_doc_url || null,
      google_doc_id: googleDocIdFromUrl(project.google_doc_url),
      last_checkpoint_revision: checkpoint?.google_doc_revision || null,
    },
    progress: {
      stored_translated_pages: storedPages,
      live_marker_pages: markerPages,
      effective_translated_pages: effectivePages,
      total_pages: totalPages || null,
      next_source_page: nextSourcePage,
      state: progressState,
      marker: totalPages ? `⟦WBPROGRESS:${project.id}:${effectivePages}:${totalPages}⟧` : null,
      sentinel: '[[NEXT_BATCH]]',
      marker_export_sha256: markerUsable ? markerResult.data.export_sha256 : null,
      marker_warning:
        markerUsable || markerResult.status === 200
          ? null
          : markerResult.data?.error || 'Progress marker could not be verified.',
    },
    source_pack: sourcePackProjection,
    resume: {
      phase: project.status,
      project_notes: projectedNotes.project_notes,
      project_notes_warning: projectedNotes.project_notes_warning,
      focused_for: focusedFor,
      instruction: translationResumeInstruction(project,nextSourcePage,totalPages),
    },
  };
}

/* Evidence-presence preflight for translation runners.
   This checks checkpoint completeness, not the truth of a critic's judgment. */
export function assessTranslationEvidence(report, wholeBook=false) {
  const blockers=[],warnings=[];
  const text=v=>typeof v==='string'&&v.trim().length>0;
  if (!text(report?.source_hash)) blockers.push('missing canonical source hash');
  if (!text(report?.target_revision)) blockers.push('missing manuscript revision');
  const units=Array.isArray(report?.units)?report.units:[];
  if (!units.length) blockers.push('empty source-unit denominator');
  const from=Number(report?.from_page), to=Number(report?.to_page), total=Number(report?.source_total_pages);
  if (!Number.isInteger(from)||from<1||!Number.isInteger(to)||to<from||
      !Number.isInteger(total)||total<to) blockers.push('invalid declared physical-page range');
  if (wholeBook && (from!==1||to!==total)) blockers.push('whole-book claim must span every physical source page');

  const ids=new Set();
  for (const unit of units) {
    if (!text(unit.id)||ids.has(unit.id)) blockers.push('missing or duplicate source-unit id');
    if (text(unit.id)) ids.add(unit.id);
    if (!Number.isInteger(unit.source_page)||unit.source_page<1) blockers.push('source unit lacks physical page');
    if (!text(unit.target_anchor)||unit.status!=='VERIFIED') blockers.push('source unit not verified against English target');
  }
  if(Number.isInteger(from)&&Number.isInteger(to)&&from>0&&to>=from){
    const pages=new Set(units.filter(u=>Number.isInteger(u.source_page)).map(u=>u.source_page));
    for(let n=from;n<=to;n++)if(!pages.has(n)) blockers.push('source page '+n+' has no accounted-for unit, including verified blank-page exceptions');
    if(units.some(u=>u.source_page<from||u.source_page>to))blockers.push('source unit outside declared physical-page range');
  }
  const required=['independent_critic','ambiguity_review','terminology_review','batch_formatting'];
  if (wholeBook) required.push('full_render','native_toc','publication_review','regression');
  for (const name of required) {
    const check=report?.checks?.[name];
    if (check?.status!=='PASS'||!text(check.evidence_ref)||check.target_revision!==report?.target_revision) {
      blockers.push(name+' lacks revision-matched PASS evidence');
    }
  }
  const questionKeys=new Set();
  for (const q of (Array.isArray(report?.questions)?report.questions:[])) {
    if (!text(q.question_key)||questionKeys.has(q.question_key)) blockers.push('missing or duplicate translation question key');
    if (text(q.question_key)) questionKeys.add(q.question_key);
    if (!text(q.arabic_text)||!text(q.source_location)||!text(q.provisional_english)) blockers.push('question lacks source/context/provisional translation');
  }
  if (report?.metrics?.suspected_truncation===true) warnings.push('possible omitted or compressed text');
  if (report?.metrics?.unusual_speed===true) warnings.push('translation pace anomaly');
  if (report?.metrics?.zero_question_streak===true) warnings.push('challenge persistent absence of questions without inventing ambiguity');
  if (report?.metrics?.terminology_drift===true) warnings.push('possible glossary inconsistency');
  return {ready:blockers.length===0,blockers:[...new Set(blockers)],warnings};
}
