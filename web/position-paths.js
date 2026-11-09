(function (root) {
  'use strict';
  // Curated preparation paths reuse existing deep cases; these are not job norms.
  const rows = [
    [
      'business_analyst',
      'kpi-paradoksu',
      'İhtiyacı ölçülebilir kabul koşuluna bağla.',
      [
        'İş ihtiyacı ile talep edilen çözümü ayır.',
        'Veri tanımındaki uyuşmazlığı örnek kayıtla göster.',
        'Değişikliğin kabulünü ve açık kalan kararı belirt.',
      ],
      'Bir gereksinim ve kabul notu: sorun, kapsam, veri tanımı, iki kabul örneği ve karar sahibi.',
      [
        'Paydaşlar aynı terimle farklı ne kastediyordu?',
        'Çözümden önce hangi ihtiyacı teyit ettin?',
        'Hangi kabul örneği önerini çürütür?',
      ],
    ],
    [
      'data_analyst',
      'kampanya-karari',
      'Bir farkı gözlemekle nedenini göstermek arasındaki sınırı açıkla.',
      [
        'Karşılaştırılan grupların kapsamını kontrol et.',
        'Seçilim ve karıştırıcı koşulları ayır.',
        'Karar için hangi ek gözlemin gerekli olduğunu belirt.',
      ],
      'Bir analiz notu: analiz birimi, karşılaştırma, alternatif açıklamalar ve doğrulama tasarımı.',
      [
        'Gruplar neden doğrudan karşılaştırılamayabilir?',
        'Hangi değişkeni kontrol etmek isterdin?',
        'İlişkiyi nedensellikten nasıl ayırdın?',
      ],
    ],
    [
      'bi_analyst',
      'kpi-paradoksu',
      'Raporu ortak ölçü tanımı ve karar ihtiyacına bağla.',
      [
        'Payda, dönem ve kayıt kapsamını yaz.',
        'Rapor farkının kaynağını izlenebilir göster.',
        'Kullanıcı kararını ve kabul kontrolünü belirt.',
      ],
      'Bir gösterge sözlüğü ve mutabakat notu: tanım, kaynak, güncelleme ve istisna kontrolü.',
      [
        'Aynı adlı iki ölçü hangi nedenle ayrıştı?',
        'Kaynak kayda nasıl geri dönersin?',
        'Bu gösterge hangi kararı destekliyor?',
      ],
    ],
    [
      'inventory',
      'parti-kalitesi',
      'Stok farkını kayıt zinciri ve kontrol kararıyla araştır.',
      [
        'Fiziksel gözlemi sistem kaydından ayır.',
        'Örneklem ve ürün/parti kapsamını açıkla.',
        'Düzeltme yetkisini ve yeniden kontrolü belirt.',
      ],
      'Bir fark inceleme notu: kayıt izi, teyit ihtiyacı, geçici kontrol ve kalıcı önlem.',
      [
        'Farkın zamanını ve kapsamını nasıl daralttın?',
        'Sayım düzeltmesi kök nedeni çözer mi?',
        'Hangi kaydı bağımsız teyit edersin?',
      ],
    ],
    [
      'planning',
      'yatirim-kapasitesi',
      'Talep, kapasite ve belirsizlik altında uygulanabilir plan üret.',
      [
        'Dönem ve kapasite birimlerini eşleştir.',
        'Darboğaz ile toplam kapasiteyi ayır.',
        'Planı değiştirecek tetikleyiciyi belirle.',
      ],
      'Bir kapasite planı: temel varsayım, iki senaryo, kısıt ve yeniden planlama koşulu.',
      [
        'Talep yanılırsa hangi kaynak etkilenir?',
        'Kapasiteyi hangi birimle karşılaştırdın?',
        'Plan hangi eşikte güncellenir?',
      ],
    ],
    [
      'quality',
      'parti-kalitesi',
      'Bulgu, kapsam ve karar riskini aynı incelemede görünür kıl.',
      [
        'Parti ve örneklem kapsamını açıkla.',
        'Uygunsuzluk kararıyla neden hipotezini ayır.',
        'Koruma, teyit ve tekrar kontrolünü belirt.',
      ],
      'Bir kalite karar notu: kanıt, etkilenen kapsam, işlem yetkisi ve yeniden kontrol.',
      [
        'Örneklem tüm partiyi temsil ediyor mu?',
        'Geçici koruma ile kalıcı önlemi nasıl ayırdın?',
        'Yanlış kabulün ve yanlış reddin etkisi nedir?',
      ],
    ],
    [
      'improvement',
      'vardiya-darbogazi',
      'İyileştirme önerisini mevcut akış ve sınanabilir etkiye bağla.',
      [
        'Bekleme, işlem ve kapasiteyi ayır.',
        'Kök neden hipotezini gözlemle sınırla.',
        'Yerel kazancın sonraki adıma etkisini incele.',
      ],
      'Bir küçük deneme A3 notu: mevcut durum, neden hipotezi, değişiklik ve etki kontrolü.',
      [
        'Akışı mı yerel işi mi hızlandırdın?',
        'Kazancı hangi başlangıç düzeyiyle kıyasladın?',
        'Deneme hangi gözlemle durdurulur?',
      ],
    ],
    [
      'project',
      'proje-kisitlari',
      'Bağımlılık, kapsam ve teslim kararını görünür kıl.',
      [
        'Faaliyet bağımlılıklarını ve kritik kısıtı ayır.',
        'Kapsam değişikliğinin etkisini belirt.',
        'Karar sahibini ve takip tarihini açıkla.',
      ],
      'Bir teslim toparlama notu: bağımlılık, seçenek, sorumlu ve karar bekleyen konu.',
      [
        'Hangi gecikme gerçekten son tarihi etkiliyor?',
        'Kapsam azaltmanın kabulü kimde?',
        'Güncel durumu ne sıklıkta teyit edersin?',
      ],
    ],
    [
      'hr',
      'aday-hunisi',
      'Aday sürecini adil, izlenebilir ve ölçü tanımları açık biçimde incele.',
      [
        'Huni aşamalarının paydalarını eşleştir.',
        'Süreç bulgusunu kişi yargısından ayır.',
        'Aday deneyimi ve veri kapsamını birlikte ele al.',
      ],
      'Bir aday süreci incelemesi: aşama tanımı, darboğaz, adalet riski ve pilot aksiyon.',
      [
        'Aşamalar arasındaki oran neyi gizleyebilir?',
        'Eksik aday kaydı kararını nasıl etkiler?',
        'Aynı değerlendirme dayanağını nasıl korursun?',
      ],
    ],
    [
      'finance',
      'butce-sapmasi',
      'Sapmayı muhasebe dönemi, faaliyet etkisi ve nakit yönünden ayır.',
      [
        'Hacim, fiyat ve dönem etkisini ayrıştır.',
        'Kâr etkisiyle nakit zamanını karıştırma.',
        'Kontrol edilebilir aksiyon ve teyit ihtiyacını belirt.',
      ],
      'Bir sapma açıklama notu: kaynak, etki ayrımı, aksiyon sahibi ve tekrar kontrolü.',
      [
        'Sapma hangi varsayıma duyarlı?',
        'Muhasebe sonucu nakitte ne zaman görünür?',
        'Tek seferlik etkiyi nasıl ayırdın?',
      ],
    ],
    [
      'sales',
      'buyuk-musteri',
      'Gelir hedefini katkı, tahsilat ve hizmet taahhüdüyle birlikte değerlendir.',
      [
        'Müşteri talebinin toplam etkisini açıkla.',
        'İskonto ve hizmet koşullarını birlikte incele.',
        'Müzakere sınırını ve onay ihtiyacını belirt.',
      ],
      'Bir müşteri karar notu: teklif seçenekleri, katkı/nakit etkisi ve taahhüt sınırları.',
      [
        'Büyüyen ciro neden daha düşük katkı yaratabilir?',
        'Hangi koşulda teklifi değiştirmelisin?',
        'Operasyonun veremeyeceği sözü nasıl ele alırsın?',
      ],
    ],
    [
      'procurement',
      'kapasite-ortakligi',
      'Tedarik kararını toplam maliyet, süreklilik ve sözleşme riskiyle savun.',
      [
        'Birim fiyat dışındaki maliyetleri açıkla.',
        'Kapasite güvencesi ve alternatif kaynağı incele.',
        'Karar/onay ve izleme koşulunu belirt.',
      ],
      'Bir tedarik karşılaştırması: toplam etki, risk, alternatif ve sözleşme kontrolü.',
      [
        'Ucuz teklif hangi koşulda pahalılaşır?',
        'Tedarik kesilirse alternatifin nedir?',
        'Hangi taahhüdü yazılı teyit edersin?',
      ],
    ],
    [
      'customer',
      'musteri-toparlanma',
      'Hizmet sorununu müşteri etkisi ve uygulanabilir çözümle ele al.',
      [
        'Belirtiyi süreç nedeninden ayır.',
        'Segment ve sözleşme farklarını incele.',
        'Müşteriye vaat ile iç aksiyonu eşleştir.',
      ],
      'Bir hizmet toparlama notu: etki, öncelik, iletişim ve tekrar kontrolü.',
      [
        'En çok şikâyet eden en çok etkilenen mi?',
        'Verdiğin söz hangi kaynağa bağlı?',
        'Tekrar sorunu nasıl fark edeceksin?',
      ],
    ],
    [
      'warehouse_manager',
      'ekip-yuku',
      'Çıktıyı kapasite, güvenli uygulama ve yetki sınırlarıyla yönet.',
      [
        'Beceriye göre kullanılabilir kapasiteyi ayır.',
        'Kaynak aktarımının yan etkisini incele.',
        'Destek, sorumluluk ve kontrol ritmini tanımla.',
      ],
      'Bir operasyon karar planı: yük, seçenek, yetki/onay ve izleme düzeni.',
      [
        'Kaynak aktarımı diğer ekibi nasıl etkiler?',
        'Hedef ile güvenliği nasıl birlikte ele aldın?',
        'Hangi bulguda planı durdurursun?',
      ],
    ],
    [
      'process_manager',
      'doksan-gun-toparlanma',
      'Dönüşüm önceliklerini nakit, hizmet ve uygulama kapasitesiyle birleştir.',
      [
        'Belirti, neden ve yönetim kısıtını ayır.',
        'Aksiyonların bağımlılıklarını sırala.',
        'Ölçüm, sahiplik ve durdurma koşulunu açıkla.',
      ],
      'Bir 90 günlük dönüşüm notu: mevcut durum, seçenekler, sahiplik ve karar eşikleri.',
      [
        'Birlikte başlatılmaması gereken işler hangileri?',
        'Kazanımın sürdüğünü nasıl anlarsın?',
        'Hangi sonucu kendi katkına bağlayamazsın?',
      ],
    ],
    [
      'project_manager',
      'proje-kisitlari',
      'Kapsam, zaman ve kaynak kararlarını paydaş kabulüyle savun.',
      [
        'Kritik bağımlılıkları ve kaynak çakışmasını açıkla.',
        'Takas kararlarını ve kabul yetkisini belirt.',
        'Belirsizlik ve değişiklik yönetimini görünür kıl.',
      ],
      'Bir proje yönlendirme notu: seçenekler, teslim etkisi, kabul kararı ve risk takibi.',
      [
        'Hangi takası kim onaylayacak?',
        'Planın en zayıf varsayımı nedir?',
        'Yeni risk geldiğinde hangi kararı yeniden açarsın?',
      ],
    ],
    [
      'graduate',
      'gelen-kutusu',
      'İlk işte talebi anla, önceliğini açıkla ve doğru yerde teyit iste.',
      [
        'Bildiğin bilgi ile varsayımını ayır.',
        'Teslim ve yetki sınırını netleştir.',
        'Küçük ilk çıktı ve geri bildirim adımını belirt.',
      ],
      'Bir işe başlangıç notu: talepler, öncelik gerekçesi, teyit soruları ve ilk çıktı.',
      [
        'Tek başına hangi kararı alabilirsin?',
        'Kime hangi bilgiyi sorarsın?',
        'Yetişmeyecek işi ne zaman bildirirsin?',
      ],
    ],
  ];
  const transfers = {
    'kpi-paradoksu': 'kampanya-karari',
    'kampanya-karari': 'musteri-toparlanma',
    'parti-kalitesi': 'hizmet-kesintisi',
    'yatirim-kapasitesi': 'butce-sapmasi',
    'vardiya-darbogazi': 'ekip-yuku',
    'proje-kisitlari': 'vardiya-darbogazi',
    'aday-hunisi': 'kpi-paradoksu',
    'butce-sapmasi': 'yatirim-kapasitesi',
    'buyuk-musteri': 'nakit-toparlanma',
    'kapasite-ortakligi': 'yatirim-kapasitesi',
    'musteri-toparlanma': 'kampanya-karari',
    'ekip-yuku': 'geri-bildirim',
    'doksan-gun-toparlanma': 'nakit-toparlanma',
    'gelen-kutusu': 'hizmet-kesintisi',
  };
  root.POSITION_PATHS = rows.map(([positionId, first, goal, expectations, work, interview]) => ({
    id: positionId,
    positionId,
    name: root.Positions.get(positionId).name,
    first,
    transfer: transfers[first],
    goal,
    expectations,
    work,
    interview,
  }));
  root.SENIORITY_EXPECTATIONS = {
    entry: [
      'Bilmediğin bilgiyi ve teyit edeceğin kişiyi belirt.',
      'Kendi yetkindeki ilk adımı ve teslim koşulunu açıkla.',
    ],
    experienced: [
      'Seçenekleri kaynak, etki ve riskle karşılaştır.',
      'Bağımlılıkları ve kendi karar sınırını açıkla.',
    ],
    senior: [
      'Birden fazla süreç ve paydaş etkisini incele.',
      'Varsayım değişikliğinde karar eşiğini ve sürdürülebilir kontrolü belirt.',
    ],
    lead: [
      'Kaynak ve yetki dağılımını gerekçelendir.',
      'Ekip sorumluluğunu, desteği ve takip düzenini açıkla.',
    ],
  };
})(window);
