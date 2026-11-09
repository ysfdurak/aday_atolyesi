// İK değerlendirmesinde ölçüt seviyeleri.
// Her vaka sürümünün ölçütleri pilot-review-catalog.json içindedir. Değerlendirici her ölçüt için
// 0–3 arası bir seviye ve isteğe bağlı kısa dayanak notu girer. Seviyeler toplanıp tek bir puana
// dönüştürülmez; adaya ölçüt bazında gösterilir.
export const LEVELS = [
  'Henüz gösterilmedi',
  'Kısmen: dayanak veya gerekçe eksik',
  'Karşılanıyor: sınırda açıklık var',
  'Dayanaklı biçimde karşılanıyor',
];

export function rubricFor(catalog, caseId, version) {
  return catalog.find(c => c.id === caseId && c.version === version)?.rubric || [];
}

/**
 * @param {unknown} value istemciden gelen ölçüt dizisi (yoksa undefined)
 * @param {Array<{name:string}>} rubric
 * @param {{publish:boolean}} options yayımlamada her ölçüte seviye zorunludur, taslakta boş olabilir
 */
export function validateCriteria(value, rubric, { publish }) {
  if (value === undefined || value === null) {
    if (publish && rubric.length) throw Error('Her ölçüt için bir seviye seç.');
    return undefined;
  }
  if (!Array.isArray(value) || value.length !== rubric.length) throw Error('Ölçüt alanları eksik.');
  return value.map((c, i) => {
    if (!c || typeof c !== 'object' || Array.isArray(c)) throw Error('Ölçüt alanı geçersiz.');
    const level = c.level;
    if (level === null || level === undefined || level === '') {
      if (publish) throw Error('Her ölçüt için bir seviye seç.');
    } else if (!Number.isInteger(level) || level < 0 || level > 3) throw Error('Ölçüt seviyesi 0–3 olmalı.');
    const note = c.note ?? '';
    if (typeof note !== 'string' || note.length > 600)
      throw Error('Ölçüt notu en fazla 600 karakter olabilir.');
    return { name: rubric[i].name, level: Number.isInteger(level) ? level : null, note: note.trim() };
  });
}
