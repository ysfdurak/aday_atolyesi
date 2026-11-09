export function cycleState(c, submissions, note = {}) {
  const files = submissions
    .filter(s => s.case_id === c.id && s.version === c.version)
    .sort(
      (a, b) =>
        a.created.localeCompare(b.created) ||
        (a.sequence || 0) - (b.sequence || 0) ||
        a.id.localeCompare(b.id)
    );
  const latest = files.at(-1);
  if (!latest) return null;
  const byId = new Map(files.map(s => [s.id, s]));
  let first = latest,
    seen = new Set();
  while (first.parent_id && byId.has(first.parent_id) && !seen.has(first.id)) {
    seen.add(first.id);
    first = byId.get(first.parent_id);
  }
  const data = note.rootId === first.id ? note : { rootId: first.id, practice: {} };
  const revised = latest.id !== first.id,
    reviewed = !!first.reviewed,
    practiced = Object.values(data.practice || {}).some(a => a?.trim()),
    defended = data.defenseSubmissionId === latest.id && !!data.defense?.trim(),
    transfer = defended && data.transfer?.submissionId === latest.id ? data.transfer : null;
  let phase = !reviewed
    ? 'review'
    : !practiced
      ? 'practice'
      : !revised
        ? 'revision'
        : !defended
          ? 'defense'
          : !transfer
            ? 'transfer'
            : 'new-context';
  if (
    transfer &&
    submissions.some(
      s =>
        s.case_id === c.learning.transfer &&
        (Array.isArray(transfer.existingIds) ? !transfer.existingIds.includes(s.id) : s.created > transfer.at)
    )
  )
    phase = 'complete';
  const labels = {
    review: [
      'Değerlendirici geri bildirimini bekle',
      'Teslimin alındı. Geri bildirim geldiğinde bu adım güncellenir. Beklerken başka bir çalışmayı sürdürebilirsin.',
    ],
    practice: [
      'Geri bildirimden kısa alıştırmaya geç',
      'Dosyana verilen geri bildirimi oku ve seçtiğin kısa alıştırmayı yanıtla.',
    ],
    revision: [
      'Dosyanı gerekçesiyle revize et',
      'İlk dosyan korunur. Değişiklik notuyla aynı teslimin revizyonunu gönder.',
    ],
    defense: [
      'Yeni bilgi karşısında kararını savun',
      'Yeni bilgi kartını incele; revize ettiğin kararın gerekçesini yaz.',
    ],
    transfer: ['Yeni bağlam çalışmasını başlat', 'Bağlantıyı kurup yeni şirketin dosyasında çalış.'],
    'new-context': [
      'Yeni şirket dosyasını teslim et',
      'Bağlantıdan sonra yeni vaka için özgün bir dosya teslimi bekleniyor.',
    ],
    complete: [
      'Gelişim döngüsü çalışma kayıtları tamamlandı',
      'Bu durum çalışma kayıtlarını gösterir; kalite veya işe uygunluk puanı değildir.',
    ],
  };
  return {
    caseId: c.id,
    version: c.version,
    phase,
    title: labels[phase][0],
    detail: labels[phase][1],
    href: '#pilot/' + (phase === 'new-context' ? c.learning.transfer : c.id),
    savedAt: latest.created,
    rootId: first.id,
    latestId: latest.id,
    submitted: true,
    reviewed,
    revised,
    complete: phase === 'complete',
    data,
  };
}
