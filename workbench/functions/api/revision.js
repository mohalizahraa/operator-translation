import { json } from '../_lib.js';

export async function onRequestGet(context) {
  const latest = await context.env.DB.prepare(`
    SELECT
      (SELECT COALESCE(MAX(id), 0) FROM activity) AS activity_revision,
      (SELECT COALESCE(MAX(created_at), '') FROM activity) AS activity_changed_at,
      (SELECT COALESCE(MAX(updated_at), '') FROM projects) AS project_revision,
      (SELECT COALESCE(MAX(updated_at), '') FROM project_covers) AS cover_revision,
      (
        SELECT COALESCE(GROUP_CONCAT(key || '=' || value, '|'), '')
        FROM (SELECT key, value FROM workbench_meta ORDER BY key)
      ) AS meta_revision
  `).first();

  const revision = [
    latest?.activity_revision ?? 0,
    latest?.project_revision || '',
    latest?.cover_revision || '',
    latest?.meta_revision || '',
  ].join('::');

  const changedAt = [
    latest?.activity_changed_at,
    latest?.project_revision,
    latest?.cover_revision,
  ].filter(Boolean).sort().at(-1) || null;

  return json({ revision, changed_at: changedAt });
}
