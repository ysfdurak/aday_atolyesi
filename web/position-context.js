(function (root) {
  'use strict';
  const KEY = 'aa-position-v1',
    levels = {
      entry: 'Başlangıç / yeni mezun',
      experienced: 'Deneyimli uzman',
      senior: 'Kıdemli / başuzman',
      lead: 'Yönetim kapsamı',
    };
  const positions = [{"id":"process_analyst","name":"Süreç geliştirme analisti","roleType":"analyst","commonRole":"analyst","focus":["surec","kokneden","analitik","paydas","sonuc"],"domains":["quant","logic","attention"],"context":"Kanal, süreç ve veri tanımlarını birleştirerek iyileştirme seçenekleri üretir.","people":false},{"id":"business_analyst","name":"İş / sistem analisti","roleType":"analyst","commonRole":"analyst","focus":["sistem","paydas","proje","risk","iletisim"],"domains":["logic","verbal","attention"],"context":"İhtiyacı kabul ölçütüne, sistem davranışına ve paydaş kararına bağlar.","people":false},{"id":"data_analyst","name":"Veri analisti","roleType":"analyst","commonRole":"analyst","focus":["analitik","dijital","risk","iletisim","sonuc"],"domains":["quant","logic","num"],"context":"Veri kalitesi, analiz tasarımı ve çıkarım sınırlarıyla çalışır.","people":false},{"id":"bi_analyst","name":"Raporlama / iş zekâsı uzmanı","roleType":"analyst","commonRole":"analyst","focus":["analitik","sistem","dijital","kalite","paydas"],"domains":["quant","attention","logic"],"context":"Ölçüt sözlüğü, rapor tutarlılığı ve kullanıcı kararını birlikte ele alır.","people":false},{"id":"warehouse_ops","name":"Depo operasyon uzmanı","roleType":"operations_specialist","commonRole":"operations","focus":["plan","risk","kalite","surec","sonuc"],"domains":["attention","quant","logic"],"context":"Kesim saati, kayıt doğruluğu, iş akışı ve istisna takibi üzerinde çalışır.","people":false},{"id":"inventory","name":"Stok kontrol uzmanı","roleType":"operations_specialist","commonRole":"operations","focus":["kalite","risk","analitik","kokneden","sonuc"],"domains":["attention","quant","num"],"context":"Fiziksel kayıt uyuşmazlıklarını ve stok hareketinin izini araştırır.","people":false},{"id":"planning","name":"Planlama uzmanı","roleType":"operations_specialist","commonRole":"operations","focus":["plan","proje","analitik","finans","risk"],"domains":["quant","logic","num"],"context":"Kapasite, bağımlılık, tahmin ve hizmet etkisini birlikte planlar.","people":false},{"id":"quality","name":"Kalite uzmanı","roleType":"specialist","commonRole":"custom","focus":["kalite","kokneden","risk","surec","paydas"],"domains":["attention","logic","quant"],"context":"Örnekleme, standart, kontrol ve düzeltici faaliyetlerle çalışır.","people":false},{"id":"improvement","name":"Operasyonel mükemmellik / yalın uzmanı","roleType":"specialist","commonRole":"analyst","focus":["surec","kokneden","finans","degisim","sonuc"],"domains":["quant","logic","attention"],"context":"Sistem etkisi, deney, sürdürülebilir kazanç ve standartlaştırmayı birleştirir.","people":false},{"id":"project","name":"Proje uzmanı / koordinatörü","roleType":"specialist","commonRole":"custom","focus":["proje","paydas","risk","plan","sonuc"],"domains":["logic","verbal","quant"],"context":"Bağımlılık, kapsam, kabul ve değişiklik takibini yürütür.","people":false},{"id":"hr","name":"İnsan kaynakları uzmanı","roleType":"specialist","commonRole":"custom","focus":["paydas","adalet","risk","analitik","iletisim"],"domains":["verbal","attention","logic"],"context":"İşle ilgili ölçüt, kayıt tutarlılığı ve süreçte adil uygulama üzerinde çalışır.","people":false},{"id":"finance","name":"Finans / bütçe uzmanı","roleType":"analyst","commonRole":"analyst","focus":["finans","analitik","risk","kalite","iletisim"],"domains":["quant","num","attention"],"context":"Bütçe sapması, nakit, varsayım ve karar etkisini açıklar.","people":false},{"id":"sales","name":"Satış / müşteri yöneticisi","roleType":"specialist","commonRole":"custom","focus":["ticari","musteri","paydas","finans","sonuc"],"domains":["verbal","quant","logic"],"context":"Müşteri ihtiyacını, katkıyı, taahhüdü ve izlemeyi birlikte ele alır.","people":false},{"id":"procurement","name":"Satın alma uzmanı","roleType":"specialist","commonRole":"custom","focus":["ticari","risk","finans","paydas","kalite"],"domains":["quant","verbal","logic"],"context":"Toplam maliyet, tedarik riski ve teklif koşullarını karşılaştırır.","people":false},{"id":"customer","name":"Müşteri deneyimi / hizmet uzmanı","roleType":"specialist","commonRole":"custom","focus":["musteri","iletisim","kokneden","surec","sonuc"],"domains":["verbal","attention","logic"],"context":"Tekrarlanan başvuruları ve hizmetin gerçek sonucunu izler.","people":false},{"id":"team_lead","name":"Ekip lideri","roleType":"team","commonRole":"lead","focus":["gelisim","delegasyon","performans","plan","iletisim"],"domains":["logic","verbal","attention"],"context":"İşle birlikte ekip kapasitesini ve gelişimini yönetir.","people":true},{"id":"warehouse_manager","name":"Depo / operasyon yöneticisi","roleType":"operations","commonRole":"lead","focus":["plan","risk","finans","surec","performans","strateji"],"domains":["quant","logic","attention"],"context":"Kaynak, hizmet, güvenlik ve işletme etkisini birlikte yönetir.","people":true},{"id":"process_manager","name":"Süreç / operasyonel mükemmellik yöneticisi","roleType":"team","commonRole":"lead","focus":["strateji","surec","finans","degisim","paydas"],"domains":["quant","logic","verbal"],"context":"Yerel iyileştirmeleri şirket hedefi ve değişim kapasitesiyle bağlar.","people":true},{"id":"project_manager","name":"Proje yöneticisi","roleType":"team","commonRole":"lead","focus":["proje","risk","paydas","finans","delegasyon"],"domains":["logic","quant","verbal"],"context":"Portföy, kaynak, kapsam ve paydaş kararlarını koordine eder.","people":true},{"id":"graduate","name":"Yeni mezun / ilk iş adayı","roleType":"graduate","commonRole":"graduate","focus":["ogrenme","plan","iletisim","adalet","sonuc"],"domains":["verbal","logic","attention"],"context":"İlk görevleri netleştirme, öğrenme ve iş takibi üzerinde çalışır.","people":false}];
  function get(id) {
    return positions.find(p => p.id === id) || null;
  }
  function valid(p) {
    return (
      p &&
      p.schema === 1 &&
      get(p.positionId) &&
      levels[p.seniority] &&
      (!get(p.positionId).people || p.seniority === 'lead')
    );
  }
  function load(storage) {
    try {
      const own = JSON.parse(storage.getItem(KEY));
      if (valid(own)) return own;
      const profile = JSON.parse(storage.getItem('aa-state-v1'))?.profile;
      if (get(profile?.positionId))
        return {
          schema: 1,
          positionId: profile.positionId,
          seniority: get(profile.positionId).people ? 'lead' : profile.seniority || 'entry',
        };
    } catch {}
    return null;
  }
  function save(storage, p) {
    if (!valid(p)) throw Error('Pozisyon ve kıdem seçimini kontrol et.');
    storage.setItem(KEY, JSON.stringify(p));
    return p;
  }
  function priorities(id, dimensions) {
    const pos = get(id);
    return Object.fromEntries(
      dimensions.map(d => [
        d.id,
        pos?.focus.includes(d.id)
          ? 2
          : pos?.people &&
              [
                'gelisim',
                'delegasyon',
                'performans',
                'catisma',
                'karar',
                'plan',
                'adalet',
                'iletisim',
              ].includes(d.id)
            ? 1
            : !pos?.people && ['karar', 'plan', 'iletisim', 'adalet', 'ogrenme'].includes(d.id)
              ? 1
              : 0,
      ])
    );
  }
  function recommendation(context, answers = [], now = Date.now()) {
    const pos = get(context?.positionId);
    if (!pos) return null;
    const base = ['senior', 'lead'].includes(context.seniority) ? 2 : 1;
    const domains = pos.domains.map(id => {
      const all = answers
          .filter(
            a =>
              a.cat === id &&
              !a.sample &&
              !a.synthetic &&
              !a.hinted &&
              a.mode === 'learn' &&
              Number.isInteger(a.level) &&
              a.level >= 1 &&
              a.level <= 3 &&
              typeof a.correct === 'boolean' &&
              Number.isFinite(a.at) &&
              now - a.at >= 0 &&
              now - a.at <= 30 * 86400000
          )
          .sort((a, b) => a.at - b.at)
          .slice(-60),
        current = all.at(-1)?.level || base,
        atLevel = all.filter(a => a.level === current).slice(-24);
      let level = current,
        reason = all.length
          ? 'Son çalıştığın düzey korunuyor; değiştirmek için henüz yeterli ipucusuz yanıt yok.'
          : 'Pozisyon ve kıdeme göre başlangıç önerisi; henüz yeterli çalışma kanıtı yok.';
      if (atLevel.length >= 24) {
        const rate = atLevel.filter(a => a.correct).length / atLevel.length;
        if (rate >= 0.85) {
          level = Math.min(3, current + 1);
          reason = 'Son 24 ipucusuz öğrenme yanıtında en az %85 doğruluk; bir üst düzeyi deneme önerisi.';
        } else if (rate < 0.55) {
          level = Math.max(1, current - 1);
          reason =
            'Son 24 ipucusuz öğrenme yanıtında %55 altında doğruluk; temel yaklaşımı pekiştirme önerisi.';
        } else reason = 'Son 24 ipucusuz öğrenme yanıtına göre mevcut düzeyde çalışma önerisi.';
      }
      return { id, level, n: atLevel.length, reason };
    });
    return {
      position: pos,
      seniority: context.seniority,
      domains,
      level: Math.max(1, Math.min(3, Math.round(domains.reduce((n, d) => n + d.level, 0) / domains.length))),
      note: 'Tasarlanmış hazırlık önerisidir; mesleğin gerçek sınavı, yetenek düzeyi veya işe uygunluk ölçümü değildir. Zaman baskısı düzey kararına katılmaz.',
    };
  }
  root.Positions = { KEY, positions, levels, get, valid, load, save, priorities, recommendation };
  if (typeof module !== 'undefined') module.exports = root.Positions;
})(typeof window === 'undefined' ? globalThis : window);
