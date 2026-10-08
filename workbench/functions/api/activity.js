import { json } from '../_lib.js';

export async function onRequestGet(context) {
  const projection = new URL(context.request.url).searchParams.get('projection');
  if (projection === 'ui') {
    // Return the complete event list with only the three historical fields
    // used by pace, correction, and completion-transition reconstruction.
    // The default archival API continues returning full immutable snapshots.
    const { results } = await context.env.DB.prepare(
      `SELECT a.id, a.project_id, a.actor, a.action, a.created_at, p.title_ar,
              CASE WHEN json_valid(a.before_json) THEN json_object(
                'status', json_extract(a.before_json, '$.status'),
                'translated_pages', json_extract(a.before_json, '$.translated_pages'),
                'pages', json_extract(a.before_json, '$.pages')
              ) ELSE NULL END AS before_json,
              CASE WHEN json_valid(a.after_json) THEN json_object(
                'status', json_extract(a.after_json, '$.status'),
                'translated_pages', json_extract(a.after_json, '$.translated_pages'),
                'pages', json_extract(a.after_json, '$.pages')
              ) ELSE NULL END AS after_json
         FROM activity a LEFT JOIN projects p ON p.id=a.project_id
        ORDER BY a.created_at DESC, a.id DESC`
    ).all();
    return json({ activity: results || [] });
  }

  const [activity, paceEvents] = await Promise.all([
    context.env.DB.prepare(
      `SELECT a.id, a.project_id, a.actor, a.action, a.before_json, a.after_json, a.created_at,
              p.title_ar
         FROM activity a
         LEFT JOIN projects p ON p.id = a.project_id
        ORDER BY a.created_at DESC, a.id DESC`
    ).all(),
    context.env.DB.prepare(
      `SELECT a.id, a.project_id, a.actor, a.action, a.before_json, a.after_json, a.created_at,
              p.title_ar
         FROM activity a
         LEFT JOIN projects p ON p.id = a.project_id
        WHERE a.action IN ('translation progress','translation progress correction')
          AND a.created_at >= datetime('now','-90 days')
        ORDER BY a.created_at ASC, a.id ASC`
    ).all(),
  ]);
  return json({
    activity: activity.results || [],
    pace_events: paceEvents.results || [],
  });
}
