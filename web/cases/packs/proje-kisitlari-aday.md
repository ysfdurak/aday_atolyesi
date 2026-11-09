# Atlas Sistemler — Proje teslimi

Özgün sentetik hazırlık vakası · 3.0.0 · Düzey 2 · Yaklaşık 65 dakika

Atlas Sistemler, iç raporlama aracını canlıya almak için proje takvimini kesinleştirecek. İş birimine dokuz iş günlük bir takvim iletilmiş. Proje koordinatörü olarak sponsor toplantısına dosya hazırlıyorsun.

## Aday görevi

Aşağıdaki şirket dosyası temelinde istenen çıktıları hazırlayıp teslim etmen bekleniyor. Kararın ve kullanılacak çalışma yaklaşımı sana ait.

## D01 / Şirket dosyası / Atlas Sistemler

Atlas Sistemler, 120 çalışanlı bir iş yazılımı şirketidir. İç raporlama aracı finans ve satış ekiplerinin ortak kullanımına hazırlanıyor. Projede bir analist, bir geliştirici, bir test uzmanı ve ürün sahibi görev alıyor; başka ekiplerden destek kalıcı olarak ayrılmamış.

İş birimleri pilot ekranı daha önce gördü, ancak gerçek veri bağlantısı ve kabul testi tamamlanmadı. Canlıya geçiş tarihi aylık yönetim toplantısında sözlü olarak duyuruldu. Ürün sahibi haftanın belirli günlerinde erişilebilir; vaka takviminde gereken günlerde toplantıya katılabileceğini bildirdi. Erişim yetkisi ve dış ekip sözleşmesi bilgi güvenliği sürecinden geçer. İç geliştirici başka projeye bu süre içinde atanmayacaktır. Sen proje koordinatörüsün; teknik kapsamı veya iş birimi kabulünü tek başına değiştiremiyorsun.

## D02 / Organizasyon ve görev çerçevesi

Yürürlükteki görev dağılımından alınan kayıt. Tablodaki kişiler kurgusaldır. Vaka kapsamındaki görevin, ilgili karar toplantısının dosyasını ve önerisini hazırlamaktır. Nihai onaylar aşağıdaki yapı içinde verilir.

|Birim / kişi|Sorumluluk|Karar / onay alanı|
|---|---|---|
|Sponsor / Pelin|Proje bütçesi|Kaynak ve dış ekip kararı|
|Ürün sahibi / Kerem|İş kapsamı|Kabul ve yayın onayı|
|Geliştirici / Ada|B ve C işleri|Teknik uygulama|
|Koordinatör / sen|Takvim ve toplantı|Öneri ve kayıt|

## D03 / Görev ağı

Süreler tam iş günüdür. Görevler bölünmeden yürütülür. Öncül iş bittiği günün ertesi günü bağımlı iş başlayabilir. A iki gün sürerse A’ya bağlı iş gün 3’te başlayabilir. B ve C’nin kaynak kaydı aynı geliştiriciyi gösterir.

|ID|Görev|Süre gün|Öncül|Kaynak|
|---|---|---|---|---|
|A|Gereksinimi netleştir|2|Yok|Analist|
|B|Veri bağlantısı|3|A|Geliştirici|
|C|Rapor ekranı|4|A|Aynı geliştirici|
|D|Kabul testi|2|B ve C|Test uzmanı|
|E|Canlıya geçiş onayı|1|D|Ürün sahibi|

## D04 / Seçenekler

Dış ekip C işini dört günde tamamlamak için 12.000 TL teklif verdi; A’nın teslimi sonrasında başlayabiliyor. Erişim ve teslim kabulü için proje sahibinin onayı gerekiyor. İç geliştiricide ek çalışma, B ve C toplamını bir gün kısaltabilecek şekilde teklif edildi.

## D05 / Kapsam sınırı

B ve C mevcut kabul kapsamındadır. Kısmi teslim ve kapsam değişikliği ürün sahibinin kararına bağlıdır. Test uzmanı ve ürün sahibi takvimde belirtilen günlerde erişilebilir. Takvimde resmi tatil yoktur.

## D06 / Önceki küçük projeler / gerçekleşen süre

Aşağıdaki kayıtlar bilgi dosyasının dönemsel ekidir. Ayrı bir tablo olduğu için başka belgelerdeki tutar veya adetlerin üzerine kendiliğinden eklenmez. Dönem ve kapsam sütunları kayıtların ait olduğu grubu gösterir.

|Proje|Gereksinim gün|Geliştirme gün|Test gün|Kabul notu|
|---|---|---|---|---|
|P 01|2|5|2|İlk turda kabul|
|P 02|3|6|3|Bir ek alan|
|P 03|2|7|2|İlk turda kabul|
|P 04|2|4|3|Veri eşleşmesi|
|P 05|3|7|2|İlk turda kabul|
|P 06|2|6|3|Yetki kaydı|

## D07 / İş birimi talepleri

İlgili bölümün çalışma sisteminden alınmış kurgusal kayıtlar. Açıklama alanları kayıt sahibinin dönem içindeki notlarıdır; yönetim tarafından doğrulanmış neden sonuç değerlendirmesi değildir.

|Talep|Kaynak|Mevcut durum|Kayıt|
|---|---|---|---|
|Satış toplamı|Satış|Kapsamda|B verisi|
|Bütçe görünümü|Finans|Kapsamda|C ekranı|
|Yetki grupları|İki bölüm|Kabulde|D kontrolü|
|Filtre açıklamaları|Satış|Kapsamda|C ekranı|
|Renk değişikliği|Pazarlama|Beklemede|Onay yok|
|Excel çıktısı|Finans|Kapsamda|D testi|
|Mobil düzen|Satış|Sonraki sürüm|Onaylı|
|Yayın kaydı|Ürün sahibi|Zorunlu|E toplantısı|

## D08 / İç yazışmalar / toplantı öncesi

Sponsor: “Dokuz gün bilgisi paylaşıldı. Müşteriye dış teslim değil, şirket içi taahhüt; yeni bilgi varsa toplantıda açıkça görmek istiyorum. Dış ekip için ek bütçe ayrılabilir ama sözleşme süresini teyit etmedik.”

Geliştirici: “B ve C aynı geliştirme ortamını kullanıyor. B bitmeden C’ye teknik olarak başlanabilir; ancak ikisini de ben yapacağım. Tahminler, görevler üzerinde tam gün çalışabileceğim varsayımına dayanıyor.”

Test uzmanı: “Kabul kriterlerinin son listesi ürün sahibinde. Veri bağlantısı ile ekran aynı sürümde gelirse test başlayabilir. Sonraki sürümde yapılacak talepleri bu teslimden ayıran listeyi görmek istiyorum.”

## D09 / İşleyiş ve toplantı kayıtları

Ana görev süreleri bu vaka için planlama taahhüdüdür; geçmiş proje listesi birebir süre eşdeğerliği değildir. Takvim iş günü bazlıdır. Dış ekipte C işinin süresi dört gün olarak teklif edilmiştir; bilgi güvenliği onayı için ayrıca süre sözü verilmemiştir. Toplantı sonunda sponsorun yazılı kararı alınacaktır.

## Beklenen çıktılar

1. Proje takvimi ve kaynak çizelgesi. Mevcut durum, önerilen hedef/beklenti ve seçiminin gerekçesi bu çıktıda yer almalıdır.
2. Sponsorun karar vereceği seçenekler dosyası.
3. Önerilen teslim kapsamına ait kabul ve devir belgesi.
4. İş birimine gönderilecek proje durumu mesajı.

Açık uçlu yanıtların otomatik yetkinlik puanlaması yoktur. Vaka hazırlık içindir; gerçek değerlendirme merkezi eşdeğerliği veya işe alınma garantisi sunmaz. Referans çözüm, ilk çözüm tesliminden sonra uygulamada açılır.
