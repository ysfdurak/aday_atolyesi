export const pilotTasks = ['source', 'practice', 'revision', 'transfer', 'rehearsal'];
export function validateObservations(value) {
  if (value === undefined) return undefined;
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    !['analyst', 'operations', 'lead', 'other', ''].includes(value.path) ||
    !['phone', 'tablet', 'desktop', ''].includes(value.device) ||
    !['free', 'paid', 'unsure', 'no', ''].includes(value.nextUse) ||
    !value.tasks ||
    typeof value.tasks !== 'object' ||
    Array.isArray(value.tasks) ||
    Object.keys(value.tasks).some(k => !pilotTasks.includes(k))
  )
    throw Error('Pilot gözlem alanlarını kontrol et.');
  const tasks = {};
  for (const id of pilotTasks) {
    const t = value.tasks[id];
    if (t === undefined) continue;
    if (
      !t ||
      Array.isArray(t) ||
      !['not_tried', 'alone', 'help', 'blocked'].includes(t.status) ||
      (t.minutes !== null && (!Number.isInteger(t.minutes) || t.minutes < 0 || t.minutes > 1440))
    )
      throw Error('Görev durumunu ve 0–1440 dakika aralığını kontrol et.');
    if (t.status === 'not_tried' && t.minutes !== null) throw Error('Denenmeyen görev için süre girme.');
    tasks[id] = { status: t.status, minutes: t.minutes };
  }
  return { path: value.path, device: value.device, nextUse: value.nextUse, tasks };
}
export function summarizeObservations(rows) {
  const result = {
    respondents: rows.length,
    observed: 0,
    tasks: Object.fromEntries(
      pilotTasks.map(id => [id, { alone: 0, help: 0, blocked: 0, not_tried: 0, reported: 0, minutes: [] }])
    ),
  };
  for (const r of rows) {
    const o = r.payload?.observations;
    if (!o) continue;
    result.observed++;
    for (const id of pilotTasks) {
      const t = o.tasks?.[id];
      if (!t) continue;
      const s = result.tasks[id];
      s.reported++;
      s[t.status]++;
      if (t.minutes !== null && t.status !== 'not_tried') s.minutes.push(t.minutes);
    }
  }
  return result;
}
