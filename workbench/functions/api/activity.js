import { json } from '../_lib.js';

export async function onRequestGet(context) {
  const projection = new URL(context.request.url).searchParams.get('projection');
  if (projection === 'ui') {
    // Preserve the complete event list for Activity, but omit snapshots that
    // its cards never display. Only translation page deltas need historical
    // before/after evidence for pace and progress corrections.
    const { results } = await context.env.DB.prepare(
      `SELECT a.id, a.project_id, a.actor, a.action, a.created_at, p.title_ar,
              CASE WHEN a.action IN ('translation progress','translation progress correction')
                   THEN a.before_json ELSE NULL END AS before_json,
              CASE WHEN a.action IN ('translation progress','translation progress correction')
                   THEN a.after_json ELSE NULL END AS after_json
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
