(function (root) {
  'use strict';
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
    pick = a => a[R(0, a.length - 1)],
    shuffle = a => {
      a = a.slice();
      for (let i = a.length - 1; i > 0; i--) {
        let j = R(0, i);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    hash = s => {
      let n = 2166136261;
      for (let c of s) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
      return (n >>> 0).toString(16);
    };
  // Every passage is authored around a different inference, not merely a changed department name.
  const passages = [
    [
      'scope-pilot',
      'Bir pilot uygulamaya yalnızca gündüz vardiyasından gönüllüler katılmıştır. Katılımcıların hata oranı azalmıştır. Gece vardiyası ve gönüllü olmayan çalışanlar hakkında veri toplanmamıştır.',
      [
        ['Gece vardiyasında da aynı etki oluşmuştur.', 'Belirlenemez'],
        ['Pilot grupta hata oranı azalmıştır.', 'Doğru'],
        ['Gece vardiyasında hata oranı artmıştır.', 'Belirlenemez'],
      ],
    ],
    [
      'target-relative',
      'Bir ekip hedefini %20, başka bir ekip %10 aşmıştır. İki ekibin hedef miktarları ve çalışan sayıları açıklanmamıştır.',
      [
        ['İlk ekibin gerçekleşen toplam üretimi kesinlikle daha yüksektir.', 'Belirlenemez'],
        ['İlk ekibin hedefini aşma yüzdesi daha yüksektir.', 'Doğru'],
        ['İkinci ekip hedefinin altında kalmıştır.', 'Yanlış'],
      ],
    ],
    [
      'response-bias',
      'Müşteri anketi yalnızca yanıt verenlerin değerlendirmelerini içerir. Anket gönderilenlerin %30’u yanıt vermiş, yanıtlayanların %80’i memnun olduğunu belirtmiştir.',
      [
        ['Anket gönderilenlerin en az %24’ü memnun olduğunu belirtmiştir.', 'Doğru'],
        ['Tüm müşterilerin %80’i memnundur.', 'Belirlenemez'],
        ['Anket gönderilen herkes yanıtlamıştır.', 'Yanlış'],
      ],
    ],
    [
      'date-scope',
      'Yeni kontrol kuralı 1 Haziran ve sonrasında açılan kayıtlar için geçerlidir. Önceki kayıtların eski kuralla kapanacağı açıklanmıştır. 31 Mayıs’ta açılan bir kayıt 3 Haziran’da kapanmıştır.',
      [
        ['Bu kayıt yeni kontrol kuralıyla kapanmalıdır.', 'Yanlış'],
        ['Bu kayıt için açılış tarihi kural seçiminde belirleyicidir.', 'Doğru'],
        ['Bu kaydın kapanışında hata yapılmıştır.', 'Belirlenemez'],
      ],
    ],
    [
      'stock-flow',
      'Ay başında 120 açık talep vardır. Ay içinde 80 yeni talep açılmış, toplam 150 talep kapatılmıştır. Başka bir kayıt hareketi olmamıştır.',
      [
        ['Ay sonunda 50 açık talep vardır.', 'Doğru'],
        ['Kapanan 150 talebin tamamı ay içinde açılmıştır.', 'Yanlış'],
        ['Ay başındaki taleplerin tamamı kapanmıştır.', 'Belirlenemez'],
      ],
    ],
    [
      'causal-comparison',
      'Bir mağazada yeni planla satış artmıştır. Aynı dönemde ürün fiyatları düşmüş ve reklam harcaması yükselmiştir. Karşılaştırma mağazası kullanılmamıştır.',
      [
        ['Satış artışına yalnızca yeni planın neden olduğu kanıtlanmıştır.', 'Yanlış'],
        ['Dönem içinde satış artışı gözlenmiştir.', 'Doğru'],
        ['Fiyat değişiminin satışa hiçbir etkisi olmamıştır.', 'Belirlenemez'],
      ],
    ],
    [
      'conditional-access',
      'Eğitimi tamamlayanlara başvuru hakkı verilir. Başvurunun kabulü için ayrıca uygulama sınavını geçmek gerekir. Deniz eğitimi tamamlamış, sınava henüz girmemiştir.',
      [
        ['Deniz başvuruda bulunabilir.', 'Doğru'],
        ['Deniz’in başvurusu kesin kabul edilmiştir.', 'Yanlış'],
        ['Deniz sınavı ilk girişte geçecektir.', 'Belirlenemez'],
      ],
    ],
    [
      'subset-survey',
      'Teknik birimde 60 kişi, destek biriminde 40 kişi çalışır. Her iki birimde de 20 kişi uzaktan çalışmaktadır. Başka birim yoktur.',
      [
        ['Toplam çalışanların %40’ı uzaktan çalışmaktadır.', 'Doğru'],
        ['Teknik birimde uzaktan çalışanların oranı daha yüksektir.', 'Yanlış'],
        ['Uzaktan çalışanların hepsi aynı gün çalışmaktadır.', 'Belirlenemez'],
      ],
    ],
    [
      'deadline',
      'Bir belge en geç cuma günü teslim edilirse zamanında sayılacaktır. Perşembe teslim edilen belge kontrol için pazartesiye kadar bekletilmiştir.',
      [
        ['Belge teslim süresi açısından zamanındadır.', 'Doğru'],
        ['Kontrolün pazartesiye kalması belgeyi geç teslim edilmiş yapar.', 'Yanlış'],
        ['Belgede eksik bilgi vardır.', 'Belirlenemez'],
      ],
    ],
    [
      'capacity-not-use',
      'Bir sistem saatte en fazla 400 kayıt işleyebilir. Dün sekiz saat açık kalmış, işlenen gerçek kayıt sayısı açıklanmamıştır.',
      [
        ['Dün tam 3.200 kayıt işlenmiştir.', 'Belirlenemez'],
        ['Dün 3.200’den fazla kayıt işlenmiş olamaz.', 'Doğru'],
        ['Sistem dün en az bir kayıt işlemiştir.', 'Belirlenemez'],
      ],
    ],
    [
      'average-distribution',
      'İki takımın kişi başına ortalama işlem süresi aynıdır. Bireysel sürelerin dağılımı ve takım büyüklükleri bilinmemektedir.',
      [
        ['Her iki takımdaki en yavaş çalışan aynı sürede işlem yapar.', 'Belirlenemez'],
        ['Takımların belirtilen ortalama süreleri eşittir.', 'Doğru'],
        ['Takımların tüm çalışanlarının işlem süresi aynıdır.', 'Belirlenemez'],
      ],
    ],
    [
      'mandatory-not-only',
      'Yüksek riskli tüm kayıtlar ikinci kontrolden geçer. Gerektiğinde düşük riskli kayıtlar da ikinci kontrole alınabilir. Bir kaydın ikinci kontrolden geçtiği bilinmektedir.',
      [
        ['Bu kayıt kesinlikle yüksek risklidir.', 'Belirlenemez'],
        ['Yüksek riskli bir kayıt ikinci kontrolsüz kapatılabilir.', 'Yanlış'],
        ['İkinci kontrol, tek başına yüksek riskli olmayı kanıtlamaz.', 'Doğru'],
      ],
    ],
    [
      'budget-vs-cost',
      'Bir proje için onaylanan bütçe artırılmıştır. Harcama yapılmadan önce ek onay gereklidir. Ek onay henüz verilmemiştir.',
      [
        ['Bütçe artışı fiilî harcamanın arttığını gösterir.', 'Belirlenemez'],
        ['Bütçe artışı tek başına harcama yetkisi vermez.', 'Doğru'],
        ['Ek onay verilmiştir.', 'Yanlış'],
      ],
    ],
    [
      'missing-followup',
      'Bir eğitime 50 kişi başlamış, sonuç anketini 35 kişi doldurmuştur. Bu 35 kişinin tamamı eğitimi yararlı bulduğunu bildirmiştir. Diğerleri hakkında bilgi yoktur.',
      [
        ['Eğitime başlayanların tamamı eğitimi yararlı bulmuştur.', 'Belirlenemez'],
        ['En az 35 katılımcı yararlı bulduğunu bildirmiştir.', 'Doğru'],
        ['Anketi doldurmayanların tamamı memnun değildir.', 'Belirlenemez'],
      ],
    ],
    [
      'weighted-change',
      'Her iki şubenin kendi içindeki hata oranı düşmüştür. Şubelerin toplam işlem içindeki ağırlıkları değişmiştir. Toplam hata oranı verilmemiştir.',
      [
        ['Toplam hata oranı kesinlikle düşmüştür.', 'Belirlenemez'],
        ['Her şubede kendi hata oranında düşüş vardır.', 'Doğru'],
        ['Şubelerin işlem payları sabit kalmıştır.', 'Yanlış'],
      ],
    ],
    [
      'unless-exception',
      'Başvurular normalde otomatik kapanır. İtiraz açılan başvurular otomatik kapanmaz; ayrıca incelemeye alınır. Bir başvuruya itiraz açılmıştır.',
      [
        ['Bu başvuru otomatik kapanır.', 'Yanlış'],
        ['Bu başvuru incelemeye alınır.', 'Doğru'],
        ['İtiraz haklı bulunmuştur.', 'Belirlenemez'],
      ],
    ],
    [
      'ranking-limits',
      'Üç teklifin yalnızca fiyatları sıralanmıştır. Teslim süresi, kalite ve hizmet koşulları hakkında bilgi verilmemiştir.',
      [
        ['En ucuz teklif her ölçüte göre en iyi tekliftir.', 'Belirlenemez'],
        ['Fiyat sırası tek başına teslim süresini belirlemez.', 'Doğru'],
        ['En pahalı teklifin kalitesi daha düşüktür.', 'Belirlenemez'],
      ],
    ],
    [
      'prevalence',
      'Bir incelemede yalnızca sorun bildiren kullanıcılar aranmıştır. Görüşülenlerin çoğu sistemin yavaş olduğunu söylemiştir. Sorun bildirmeyenler araştırmaya alınmamıştır.',
      [
        ['Tüm kullanıcıların çoğu sistemi yavaş bulmaktadır.', 'Belirlenemez'],
        ['Görüşülen grup tüm kullanıcıları rastgele temsil edecek şekilde seçilmiştir.', 'Yanlış'],
        ['Görüşülenlerin çoğu yavaşlık bildirmiştir.', 'Doğru'],
      ],
    ],
    [
      'parallel-times',
      'İki iş aynı anda başlayabilir. Birinci iş 20, ikinci iş 30 dakika sürer. Son kontrol, ikisi de bittikten sonra başlar ve 10 dakika sürer.',
      [
        ['Başlangıçtan son kontrolün bitimine en az 40 dakika gerekir.', 'Doğru'],
        ['İki iş zorunlu olarak arka arkaya yapılmalıdır.', 'Yanlış'],
        ['Son kontrol ilk 20 dakika içinde başlar.', 'Yanlış'],
      ],
    ],
    [
      'cumulative',
      'Bir rapor günlük adetleri değil, ay başından beri biriken toplamları göstermektedir. Salı toplamı 90, çarşamba toplamı 140 olarak verilmiştir.',
      [
        ['Çarşamba günü 50 işlem yapılmıştır.', 'Doğru'],
        ['Çarşamba günü 140 yeni işlem yapılmıştır.', 'Yanlış'],
        ['Salı günü tek başına 90 işlem yapılmıştır.', 'Belirlenemez'],
      ],
    ],
  ];
  const argumentsBank = [
    [
      'selection',
      'Gönüllü eğitim katılımcılarının hata oranı düştü. Yönetim, eğitimi herkese verince aynı düşüşün olacağını düşünüyor.',
      'Gönüllüler eğitim öncesinde de diğerlerinden daha deneyimli ve daha düşük hata oranına sahipti.',
      [
        'Eğitim çevrim içi verildi.',
        'Katılımcılar eğitimi yararlı buldu.',
        'Eğitim notları herkesle paylaşıldı.',
        'Yönetim yeni eğitimler planlıyor.',
      ],
      'Gönüllü grubun seçimi, etkinin herkese genellenmesini sınırlar.',
    ],
    [
      'cointervention',
      'Yeni rota yazılımından sonra teslimatlar hızlandı. Yönetim hızlanmayı yalnızca yazılıma bağlıyor.',
      'Aynı tarihte teslimat bölgesi daraltıldı ve ek araçlar devreye girdi.',
      [
        'Yazılımın arayüzü yenilendi.',
        'Bazı sürücüler yazılımı beğendi.',
        'Yazılım farklı cihazlarda çalışıyor.',
        'Teslimat hızı raporlanıyor.',
      ],
      'Aynı anda değişen kaynak ve kapsam alternatif açıklamalardır.',
    ],
    [
      'denominator',
      'Kayıp ürün adedi geçen aya göre düştü. Yönetim kayıp riskinin kesin azaldığını söylüyor.',
      'İşlenen toplam ürün adedi kayıp adedinden daha büyük oranda düştü.',
      [
        'Kayıplar haftalık da izleniyor.',
        'Yeni depo düzenli görünüyor.',
        'Ay sonu raporu erken hazırlandı.',
        'Ürünler barkodlu izleniyor.',
      ],
      'Adet azalırken birim başına kayıp riski artmış olabilir; payda gerekir.',
    ],
    [
      'regression',
      'En kötü performans gösteren beş ekibe uyarı yapıldı. Ertesi ay sonuçlar iyileşti; yönetim iyileşmeyi uyarıya bağlıyor.',
      'Önceki aylarda uyarı almayan, geçici olarak kötü sonuçlu ekiplerde de benzer düzelme görülüyordu.',
      [
        'Uyarı yazılı yapıldı.',
        'Ekiplerin adları rapora kondu.',
        'Aynı KPI her ay izleniyor.',
        'Yöneticiler sonuçları okudu.',
      ],
      'Geçici uç sonuçlardan olağan seviyeye dönüş alternatif açıklamadır.',
    ],
    [
      'reverse-cause',
      'Daha sık destek isteyen çalışanlar daha çok hata yapıyor. Yönetim destek istemenin hataya yol açtığını düşünüyor.',
      'Zor görevler verilen çalışanlar hem daha sık destek istiyor hem de daha çok hatayla karşılaşıyor.',
      [
        'Destek birimi her gün açık.',
        'Bazı çalışanlar yazılı iletişim kullanıyor.',
        'Destek talepleri kaydediliyor.',
        'Ekip eğitim almak istiyor.',
      ],
      'Görev zorluğu hem destek ihtiyacını hem hatayı açıklayabilir.',
    ],
    [
      'measurement-change',
      'Yeni denetimden sonra hata sayısı arttı. Yönetim üretim kalitesinin bozulduğu sonucuna vardı.',
      'Yeni denetim önce görünmeyen küçük hataları da kaydetmeye başladı.',
      [
        'Denetim ekibi rapor yazıyor.',
        'Üretim aynı binada yapılıyor.',
        'Ürünler aynı etiketle gönderiliyor.',
        'Yöneticiler denetimi destekliyor.',
      ],
      'Ölçümün duyarlılığı artınca kalite bozulmadan kayıtlı hata artabilir.',
    ],
    [
      'nonresponse',
      'Ankete yanıt veren müşteriler yüksek memnuniyet bildirdi. Yönetim tüm müşterilerin memnuniyetinin yükseldiğini söylüyor.',
      'Önceki döneme göre daha az kişi yanıt verdi ve şikâyet eden müşteriler yanıtlayanlar arasında az temsil edildi.',
      [
        'Anketin yazı tipi değişti.',
        'Sonuçlar grafikle paylaşıldı.',
        'Anket beş soru içeriyordu.',
        'Müşteriler farklı saatlerde alışveriş yaptı.',
      ],
      'Yanıtlayanların yapısındaki değişim genel memnuniyet çıkarımını zayıflatır.',
    ],
    [
      'composition',
      'Her iki ürün grubunda iade oranı düştü. Yönetim toplam iade oranının da kesin düşeceğini söylüyor.',
      'Satışlar düşük iadeli gruptan yüksek iadeli gruba kaydı.',
      [
        'İade raporu aylık hazırlanıyor.',
        'Her iki ürün grubu satışta kaldı.',
        'Bazı ürünlerin rengi değişti.',
        'İadeler kayıt altına alındı.',
      ],
      'Grupların ağırlıkları değiştiğinde toplam oran farklı hareket edebilir.',
    ],
    [
      'survivorship',
      'Şirketten ayrılmayan çalışanların performansı yüksek. Yönetim işe aldığı tüm çalışanların aynı düzeyde başarılı olduğunu düşünüyor.',
      'Düşük performans nedeniyle ayrılanlar incelemeye dahil edilmedi.',
      [
        'Performans yılda iki kez inceleniyor.',
        'Bazı çalışanlar farklı ekiplerde.',
        'Rapor elektronik ortamda hazırlandı.',
        'Yeni işe alımlar sürüyor.',
      ],
      'Yalnızca kalanları incelemek, ayrılanları dışarıda bırakır.',
    ],
    [
      'time-window',
      'Bir kampanyadan sonraki hafta satış arttı. Yönetim kampanyanın yıllık satışları kalıcı artıracağını savunuyor.',
      'Artışın önemli bölümü sonraki haftalarda yapılacak alımların erkene çekilmesinden kaynaklandı.',
      [
        'Kampanya bir hafta sürdü.',
        'Reklam görselleri yenilendi.',
        'Ürünler farklı raflarda sergilendi.',
        'Müşteriler kampanyayı gördü.',
      ],
      'Satışın zaman içinde öne çekilmesi kalıcı toplam artış anlamına gelmez.',
    ],
    [
      'control-trend',
      'Yeni prosedür uygulanan birimde verim yükseldi. Yönetim artışı prosedürün etkisi saydı.',
      'Prosedürü uygulamayan benzer birimlerde de aynı dönemde eşit verim artışı görüldü.',
      [
        'Prosedür yazılı dağıtıldı.',
        'Birim yöneticisi raporu imzaladı.',
        'Çalışanlar toplantıya katıldı.',
        'Verim her hafta hesaplanıyor.',
      ],
      'Ortak dönem etkisi prosedüre özgü açıklamayı zayıflatır.',
    ],
    [
      'aggregate-vs-person',
      'Ortalama işlem süresi düştü. Yönetim her çalışanın hızlandığı sonucuna vardı.',
      'Toplam işlerin daha büyük bölümü zaten hızlı olan çalışanlara verildi.',
      [
        'Bazı çalışanların masası değişti.',
        'Çalışanlar aynı yazılımı kullanıyor.',
        'Süreler saniye cinsinden tutuluyor.',
        'İşlem sayıları raporlanıyor.',
      ],
      'İşlerin çalışanlar arasındaki dağılımı ortalamayı değiştirebilir.',
    ],
    [
      'substitution',
      'Yeni otomasyonla veri girişinde harcanan zaman azaldı. Yönetim toplam iş gücü ihtiyacının aynı miktarda azalacağını söylüyor.',
      'Otomasyon çıktılarının kontrolü ve istisnaların düzeltilmesi yeni iş yükü yarattı.',
      [
        'Veri giriş ekranı kaldırıldı.',
        'Otomasyon bir sunucuda çalışıyor.',
        'Günlük rapor otomatik üretiliyor.',
        'Bazı kullanıcılar aracı beğeniyor.',
      ],
      'Bir adımda kazanılan süre başka adımlarda yeni iş yüküyle dengelenebilir.',
    ],
    [
      'outcome-proxy',
      'Eğitim sonunda bilgi testi puanları yükseldi. Yönetim iş başındaki hata oranının kesin düşeceğini düşünüyor.',
      'Test ezberlenen tanımları ölçüyor; iş başında gerekli uygulama kararlarını kapsamıyor.',
      [
        'Eğitim materyalleri renkliydi.',
        'Katılımcılar sınava zamanında girdi.',
        'Test aynı gün yapıldı.',
        'Eğitimin adı değişmedi.',
      ],
      'Ölçülen bilgi ile beklenen iş davranışı aynı olmayabilir.',
    ],
    [
      'base-rate',
      'Bir alarm sistemi hatalı kayıtların çoğunu yakalıyor. Yönetim her alarmın büyük olasılıkla gerçek hata olduğunu savunuyor.',
      'Gerçek hatalar çok nadir; doğru kayıtların küçük bir bölümüne verilen yanlış alarmlar, gerçek alarmlardan sayıca daha fazla.',
      [
        'Sistem uyarıları ekranda gösteriyor.',
        'Kontrol ekibi alarmları görüyor.',
        'Sistem her gün çalışıyor.',
        'Alarmlar saat bilgisi taşıyor.',
      ],
      'Hata yaygınlığı ve yanlış alarm adedi bilinmeden alarmın doğruluğu çıkarılamaz.',
    ],
    [
      'resource-uncontrolled',
      'İki ekibin toplam çıktısı karşılaştırıldı. Yönetim daha çok çıktı üreten ekibin kişi başına daha verimli olduğunu söyledi.',
      'Daha yüksek çıktı üreten ekipte iki kat çalışan ve daha uzun çalışma süresi vardı.',
      [
        'Her iki ekip aynı ay çalıştı.',
        'Üretimler sayılarak kaydedildi.',
        'Rapor bir toplantıda sunuldu.',
        'Ekipler aynı şehirdeydi.',
      ],
      'Toplam çıktı, çalışan ve süre gibi girdilere oranlanmadan verimlilik değildir.',
    ],
  ];
  const processes = [
    [
      'erişim',
      'Bir kullanıcı, yetkisi olduğu halde uygulamaya giremediğini bildirdi.',
      'Bu bildirimi inceleyen ekip, erişim günlüğündeki reddetme nedenini buldu.',
      'Bulunan neden, yetki kaydının kimlik sistemiyle eşleşmediğini gösterdi.',
      'Bu eşleşme sorunu giderildikten sonra aynı kullanıcıyla yeniden deneme yapıldı.',
      'Yeniden denemede erişim sağlandığı için kayıt kapatıldı.',
    ],
    [
      'enerji',
      'Bir tesiste gece tüketiminin olağanın üzerinde olduğu fark edildi.',
      'Bu fazlalığın kaynağını bulmak için gece sayaç verileri ekipmanlarla eşleştirildi.',
      'Eşleştirme, kullanılmayan bir hattın açık kaldığını ortaya çıkardı.',
      'Bu bulgunun ardından hat için otomatik kapanma ayarı yapıldı.',
      'Ayarın etkisi sonraki gecelerin tüketimi izlenerek kontrol edildi.',
    ],
    [
      'tedarik',
      'Bir malzemenin teslimatlarında tekrar eden gecikmeler görüldü.',
      'Bu gecikmelerin hangi aşamada oluştuğunu görmek için sipariş zamanları ayrıştırıldı.',
      'Ayrıştırılan kayıtlarda beklemenin çoğunun iç onayda oluştuğu anlaşıldı.',
      'Bu nedenle düşük tutarlı siparişlerde onay adımı sadeleştirildi.',
      'Sadeleştirmeden sonraki teslimat kayıtları önceki dönemle karşılaştırıldı.',
    ],
    [
      'müşteri',
      'Bir hizmette aynı konuya ilişkin şikâyetler artmaya başladı.',
      'Bu şikâyetlerin ortak noktasını bulmak için görüşme kayıtları sınıflandırıldı.',
      'Sınıflandırma, talimatın bir cümlesinin sık yanlış anlaşıldığını gösterdi.',
      'Bunun üzerine söz konusu cümle örneklerle yeniden yazıldı.',
      'Yeni metnin etkisi benzer görüşmelerdeki tekrar soru sayısıyla izlendi.',
    ],
    [
      'stok',
      'Sayımda sistem ile fiziksel stok arasında fark bulundu.',
      'Bu farkın kaynağını araştıran ekip son hareketleri zaman sırasına koydu.',
      'Sıralanan hareketlerde bir transferin iki kez kaydedildiği görüldü.',
      'Çift kaydın düzeltilmesinden sonra stoklar tekrar karşılaştırıldı.',
      'Tekrar karşılaştırmada fark kalmadığı için inceleme sonuçlandırıldı.',
    ],
    [
      'bakım',
      'Bir ekipmanın duruş süresi beklenenin üzerine çıktı.',
      'Bu artışı açıklamak için duruş nedenleri ayrı gruplara ayrıldı.',
      'Gruplama, uzun beklemenin yedek parça temininde oluştuğunu gösterdi.',
      'Bu bulguyla kritik parçalar için asgari stok tanımlandı.',
      'Tanımdan sonraki arızalarda parça bekleme süresi yeniden ölçüldü.',
    ],
    [
      'rapor',
      'İki bölüm aynı gösterge için farklı sonuçlar yayımladı.',
      'Bu farkı araştırmak üzere kullanılan hesap tanımları karşılaştırıldı.',
      'Karşılaştırmada bölümlerden birinin iptal edilen işleri de toplama kattığı anlaşıldı.',
      'Bunun ardından kapsam tanımı ortak bir sözlükte netleştirildi.',
      'Sözlük uygulandıktan sonra iki bölümün sonuçları yeniden denetlendi.',
    ],
    [
      'işe-uyum',
      'Yeni başlayanların bir uygulamada sık destek istediği fark edildi.',
      'Bu taleplerin içeriği hangi adımda zorlanıldığını bulmak için incelendi.',
      'İnceleme, ortak sorunun veri yükleme sırası olduğunu gösterdi.',
      'Bu sorun için kısa bir uygulama rehberi hazırlandı.',
      'Rehber yayımlandıktan sonra aynı konuda gelen talepler izlendi.',
    ],
    [
      'ödeme',
      'Bir ödeme listesinde beklenmeyen mükerrer tutarlar görüldü.',
      'Bu tutarları araştıran ekip belgelerin referans numaralarını eşleştirdi.',
      'Eşleştirme, aynı belgenin farklı biçimlerde iki kez yüklendiğini ortaya çıkardı.',
      'Bunun üzerine yüklemeden önce numaraları normalleştiren kontrol eklendi.',
      'Kontrol eklendikten sonra yeni listelerde mükerrerlik yeniden arandı.',
    ],
    [
      'randevu',
      'Bir hizmet noktasında kuyruk süresi uzadı.',
      'Bu uzamanın saatlere dağılımı randevu kayıtlarından incelendi.',
      'İnceleme, aynı aralığa farklı sürelerde işlerin eşit sayıda alındığını gösterdi.',
      'Bu nedenle randevu kapasitesi işlem süresine göre yeniden düzenlendi.',
      'Düzenleme sonrası bekleme süreleri benzer günlerle karşılaştırıldı.',
    ],
    [
      'kalite',
      'Bir üründe sevkiyat sonrası hasar bildirimi arttı.',
      'Bu bildirimler ambalaj ve taşıma koşullarına göre ayrıldı.',
      'Ayrım, belirli bir ambalaj türünde hasarın yoğunlaştığını gösterdi.',
      'Bu ambalaj için koruyucu parça eklenen bir pilot uygulama başlatıldı.',
      'Pilot sonuçları incelenerek değişikliğin yaygınlaştırılıp yaygınlaştırılmayacağına karar verildi.',
    ],
    [
      'proje',
      'Bir projenin planlanan bitiş tarihi aşıldı.',
      'Bu gecikmenin nedenini görmek için bağımlı işler yeniden sıralandı.',
      'Sıralama, iki ekibin aynı uzman kaynağını aynı anda beklediğini gösterdi.',
      'Bu nedenle ortak kaynak için çakışmayan çalışma aralıkları ayrıldı.',
      'Yeni plana göre ilerleme takip edilerek bitiş tahmini güncellendi.',
    ],
  ];
  const desc = {
    all: (a, b) => `${a} içindeki herkes ${b} içindedir.`,
    none: (a, b) => `${a} ile ${b} kesişmez.`,
    some: (a, b) => `${a} ile ${b} ortak en az bir kişi içerir.`,
    notall: (a, b) => `${a} içinde olup ${b} dışında kalan en az bir kişi vardır.`,
    exists: a => `${a} içinde en az bir kişi vardır.`,
  };
  function holds(world, p) {
    let [op, a, b] = p,
      cells = Array.from({ length: 8 }, (_, i) => i).filter(i => (world >> i) & 1),
      A = i => !!((i >> a) & 1),
      B = i => !!((i >> b) & 1);
    return op === 'all'
      ? cells.every(i => !A(i) || B(i))
      : op === 'none'
        ? cells.every(i => !A(i) || !B(i))
        : op === 'some'
          ? cells.some(i => A(i) && B(i))
          : op === 'notall'
            ? cells.some(i => A(i) && !B(i))
            : cells.some(A);
  }
  const premisePool = [];
  for (let a = 0; a < 3; a++) {
    premisePool.push(['exists', a]);
    for (let b = 0; b < 3; b++)
      if (a !== b) for (let op of ['all', 'none', 'some', 'notall']) premisePool.push([op, a, b]);
  }
  function syllogism(level) {
    for (let attempts = 0; attempts < 300; attempts++) {
      let target = R(1, 255),
        pool = shuffle(premisePool.filter(p => holds(target, p))),
        premises = pool.slice(0, level + 1),
        worlds = Array.from({ length: 255 }, (_, i) => i + 1).filter(w => premises.every(p => holds(w, p)));
      if (worlds.length < 2) continue;
      let remaining = premisePool.filter(p => !premises.some(s => JSON.stringify(p) === JSON.stringify(s))),
        yes = remaining.filter(p => worlds.every(w => holds(w, p))),
        no = remaining.filter(p => worlds.some(w => !holds(w, p)));
      if (yes.length && no.length >= 4)
        return { premises, worlds, answer: pick(yes), wrong: shuffle(no).slice(0, 4) };
    }
    throw Error('Cannot generate verbal constraints');
  }
  const wording = p => desc[p[0]](...p.slice(1).map(i => ['A grubu', 'B grubu', 'C grubu'][i]));
  function create(type, level = 2) {
    let q = '',
      visual = '',
      answer,
      options,
      exp = '',
      hint = '',
      proof = {},
      template = '',
      errorTags = {};
    if (type === 0) {
      let mode = R(0, 3),
        limit = R(3, 8),
        age = R(1, 12),
        risk = R(0, 1),
        approval = R(0, 1),
        complete = R(0, 1),
        blocked = R(0, 1),
        eligible =
          mode === 0
            ? (age <= limit || risk) && approval
            : mode === 1
              ? complete && approval && !blocked
              : mode === 2
                ? (risk || complete) && !blocked
                : ((risk && approval) || complete) && !blocked;
      let policies = [
        `Bekleme süresi en fazla ${limit} gün olan veya kritik işaretli talepler adaydır. İşleme geçmek için ayrıca onay gerekir.`,
        `Hem evrakı tamamlanan hem onaylanan talepler işleme geçebilir. Bloke kaydı olan talepler, diğer koşullardan bağımsız olarak bekletilir.`,
        `Kritik talepler ile evrakı tamamlanan talepler işleme adaydır. Bloke kaydı adaylığı geçersiz kılar.`,
        `Kritik ve onaylı olan ya da evrakı tamamlanan talepler adaydır. Ancak bloke olanlar işleme geçemez.`,
      ];
      q = 'Politikanın tamamına göre yargıyı değerlendir.';
      visual =
        policies[mode] +
        `<br><br>Talep: ${age} gündür bekliyor. Kritik: ${risk ? 'evet' : 'hayır'}. Onay: ${approval ? 'var' : 'yok'}. Evrak: ${complete ? 'tamam' : 'eksik'}. Bloke: ${blocked ? 'var' : 'yok'}.<p>“Talep işleme geçebilir.”</p>`;
      answer = eligible ? 'Doğru' : 'Yanlış';
      options = ['Doğru', 'Yanlış', 'Belirlenemez'];
      exp = `${policies[mode]} Talepte bu koşulların birlikte değerlendirilmesi ${answer.toLocaleLowerCase('tr')} sonucunu verir. Adaylık, onay ve engelleyici koşulu ayrı denetle.`;
      hint = '“Ve”, “veya” ve “ancak” bağlarını ayrı koşullar olarak yaz.';
      proof = { kind: 'verbal-policy', mode, limit, age, risk, approval, complete, blocked };
      template = 'policy-' + mode;
    }
    if (type === 1) {
      let allowed =
          level === 1
            ? ['deadline', 'stock-flow', 'parallel-times', 'date-scope', 'cumulative', 'capacity-not-use']
            : level === 3
              ? [
                  'scope-pilot',
                  'target-relative',
                  'causal-comparison',
                  'average-distribution',
                  'weighted-change',
                  'prevalence',
                ]
              : null,
        p = pick(allowed ? passages.filter(p => allowed.includes(p[0])) : passages),
        [claim, status] = pick(p[2]);
      q = 'Yalnızca metindeki bilgiye göre yargıyı değerlendir.';
      visual = p[1] + `<p>“${claim}”</p>`;
      answer = status;
      options = ['Doğru', 'Yanlış', 'Belirlenemez'];
      exp = `Sonuç: ${status}. ${status === 'Belirlenemez' ? 'Metin bu yargıyı doğrulayacak veya çürütecek yeterli bilgi vermiyor.' : status === 'Yanlış' ? 'Yargı, metinde açıkça verilen bilgi veya kapsamla çelişiyor.' : 'Yargı, metindeki bilgi ve sınırların doğrudan sonucudur.'} “Olabilir” ile “kesindir” ifadelerini ayır.`;
      hint = 'İncelenen grubun, dönemin, paydanın ve kanıtlanan sonucun kapsamını kontrol et.';
      proof = { kind: 'verbal-passage', key: p[0], claim, status };
      template = 'passage-' + p[0];
    }
    if (type === 2) {
      let s = syllogism(level);
      q = 'Verilenlerin tümü doğruysa hangisi zorunlu olarak doğrudur?';
      visual =
        '<p>A: eğitimini tamamlayanlar; B: proje yetkilileri; C: uzaktan çalışanlar.</p>' +
        s.premises.map(wording).join('<br>');
      answer = wording(s.answer);
      options = [answer, ...s.wrong.map(wording)];
      exp = `Doğru çıkarım: ${answer} Bu sonuç, verilenlerle tutarlı her olasılıkta korunur. Diğer seçeneklerde “tüm”, “hiçbir” ve “en az bir” kapsamını genişletmek veya ilişkiyi tersine çevirmek zorunlu bir sonuç vermez.`;
      for (let p of s.wrong) errorTags[wording(p)] = 'niceleyici-kapsam';
      hint =
        '“Tüm A, B’dir” ifadesinin tersini varsayma. Varlık bildiren bir öncül olup olmadığını kontrol et.';
      proof = { kind: 'verbal-models', premises: s.premises, conclusion: s.answer, wrong: s.wrong };
      template = 'quantifiers-' + level;
    }
    if (type === 3) {
      let allowed =
          level === 1
            ? ['selection', 'cointervention', 'denominator', 'measurement-change', 'resource-uncontrolled']
            : level === 3
              ? ['regression', 'composition', 'survivorship', 'time-window', 'outcome-proxy', 'base-rate']
              : null,
        p = pick(allowed ? argumentsBank.filter(p => allowed.includes(p[0])) : argumentsBank);
      q = 'Sonucu en güçlü biçimde zayıflatan ek bilgi hangisidir?';
      visual = p[1];
      answer = p[2];
      options = [answer, ...p[3]];
      exp = p[4];
      hint = 'Sonucu açıklayabilecek başka neden, kapsam farkı veya ölçüm değişikliği ara.';
      proof = { kind: 'verbal-argument', key: p[0] };
      template = 'argument-' + p[0];
    }
    if (type === 4) {
      let p = pick(processes),
        sentences = p.slice(1);
      if (level === 1) sentences = sentences.slice(0, 4);
      if (level === 3)
        sentences.push(
          'Bu son değerlendirmenin dayanakları, sonraki gözden geçirmede kullanılmak üzere kayıt altına alındı.'
        );
      let indices = sentences.map((_, i) => i),
        order = shuffle(indices),
        labels = {};
      order.forEach((n, i) => (labels[n] = String.fromCharCode(65 + i)));
      q = 'Cümlelerin tutarlı bir paragraf oluşturduğu sıra hangisidir?';
      visual = order.map((n, i) => `<b>${String.fromCharCode(65 + i)}.</b> ${sentences[n]}`).join('<br><br>');
      answer = indices.map(n => labels[n]).join(' → ');
      let wrong = indices.slice(1).map((_, i) => {
        let a = indices.slice();
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        return a.map(n => labels[n]).join(' → ');
      });
      options = [answer, ...wrong.slice(0, 4)];
      exp =
        'Sorun tanıtılır; onu inceleyen adımın ardından inceleme bulgusu gelir. Müdahale bu bulguya dayanır. Son cümlede müdahalenin sonrası izlenir. “Bu”, “bunun üzerine” ve “sonra” göndermelerinin hangi olaya bağlı olduğunu kontrol et.';
      hint = 'Bir olayın sonucunu, o olayı tanıtan cümleden önce yerleştirme.';
      proof = { kind: 'verbal-order', key: p[0], order, labels };
      template = 'order-' + p[0];
    }
    if (type === 5) {
      let mode = level === 1 ? pick([1, 3]) : level === 3 ? pick([0, 2, 4, 5]) : R(0, 5),
        texts = [
          [
            'Yalnızca eğitimi ve yetkisi tamam olanlar başvurabilir; bu iki koşul kabulü garanti etmez.',
            'Başvurabilenlerin hem eğitimi hem yetkisi tamamdır; bu koşullar tek başına kabul anlamına gelmez.',
            [
              'Eğitim veya yetkiden biri yeterlidir.',
              'İki koşulu sağlayan herkes kabul edilmiştir.',
              'Kabul edilmeyenlerin hiçbiri eğitim almamıştır.',
              'Yetkisi olan herkes başvurabilir.',
            ],
          ],
          [
            'Talep ancak onay alınırsa kapanır; onay alınması tek başına kapanmayı zorunlu kılmaz.',
            'Kapanan talebin onayı vardır; onaylı her talebin kapandığı söylenemez.',
            [
              'Onaylı tüm talepler kapalıdır.',
              'Kapanmayan taleplerin onayı yoktur.',
              'Onay talebin kapanması için gereksizdir.',
              'Onayı olmayan bazı talepler kapanabilir.',
            ],
          ],
          [
            'Bloke yoksa ve belgeler tamamsa kayıt açılır. Bu iki koşul birlikte yeterlidir; tek açılma yolu oldukları söylenmemiştir.',
            'Blokesiz ve belgeleri tam her kayıt açılır; başka bir yolla açılan kayıt bulunabilir.',
            [
              'Açık her kaydın belgeleri tamdır.',
              'Belgeleri eksik hiçbir kayıt açılamaz.',
              'Bloke olmaması tek başına yeterlidir.',
              'Belgeleri tam olması tek başına yeterlidir.',
            ],
          ],
          [
            'Her başvuru incelenmiştir; fakat her başvuru kabul edilmemiştir.',
            'Tüm başvurular incelenmiş ve en az bir başvuru kabul edilmemiştir.',
            [
              'Hiçbir başvuru kabul edilmemiştir.',
              'Bazı başvurular incelenmemiştir.',
              'Tüm incelenenler kabul edilmiştir.',
              'Kabul edilen başvuru kesinlikle vardır.',
            ],
          ],
          [
            'İki kaynaktan en az biri doğrulanmalı; ikisinin birden doğrulanması zorunlu değildir.',
            'Bir kaynak doğrulanması yeterli olabilir; iki kaynağın birlikte doğrulanması şart değildir.',
            [
              'İki kaynak da doğrulanmalıdır.',
              'Kaynaklardan hiçbiri doğrulanmayabilir.',
              'Yalnızca ilk kaynak doğrulanabilir.',
              'İki kaynağın birden doğrulanması yasaktır.',
            ],
          ],
          [
            'İstisna izni verilmedikçe süre uzatılamaz; izin verilen her süre mutlaka uzatılmaz.',
            'Süresi uzatılanların istisna izni vardır; izin tek başına uzatma garantisi değildir.',
            [
              'İzin verilen tüm süreler uzatılır.',
              'Uzatılmayan hiçbir süreye izin verilmemiştir.',
              'İzin olmadan uzatma yapılabilir.',
              'İstisna izni uzatma için gerekli değildir.',
            ],
          ],
        ][mode];
      q = 'Cümlenin kapsamını en doğru koruyan ifade hangisidir?';
      visual = texts[0];
      answer = texts[1];
      options = [answer, ...texts[2]];
      exp =
        'Gerekli koşul ile yeterli koşulu, “her” ile “hiçbir” ve “en az bir” ile “yalnızca bir” ifadelerini ayır. Doğru seçenek kapsamı genişletmez veya tersine çevirmez.';
      hint = 'Önce zorunlu koşulu belirle; sonra koşulun tek başına sonucu garanti edip etmediğine bak.';
      proof = { kind: 'verbal-scope', mode };
      template = 'scope-' + mode;
    }
    if (!options.includes(answer)) options.push(answer);
    options = shuffle(options);
    let reasons = {};
    for (let o of options)
      if (o !== answer)
        reasons[o] = errorTags[o]
          ? 'Niceleyici veya kapsamı genişletme; ilişkiyi tersine çevirme olasılığı.'
          : 'Bu seçenek, verilen bilgiye dayanmayan bir çıkarım veya kapsam değişimi içerir. Seçim nedenini çözümle karşılaştır.';
    return {
      cat: 'verbal',
      type,
      level,
      q,
      visual: '<div class="passage">' + visual + '</div>',
      options,
      answer,
      exp,
      hint,
      hints: [
        hint,
        'Yorumunu yalnızca verilen metne dayandır. Eksik bilgiyi gündelik varsayımlarla tamamlama.',
      ],
      distractorReasons: reasons,
      errorTags,
      proof,
      templateId: 'verbal-v4-' + template,
      bankVersion: 4,
      engineVersion: 2,
      id: hash(q + visual + answer),
      target: 75,
    };
  }
  root.Verbal = { create, holds, passages, argumentsBank, processes, version: 4 };
})(typeof window === 'undefined' ? globalThis : window);
