# Aday, İK ve kullanım deneyimi incelemesi

4 Kasım 2026 · Aday Atölyesi 0.12

Bu inceleme mevcut kaynak, gerçek tarayıcı akışları ve kayıt sözleşmeleri üzerinden yapılmıştır. Gerçek aday araştırması veya psikometrik doğrulama yerine geçmez.

| Bakış | Görülen eksik | Uygulanan iyileştirme |
|---|---|---|
| Aday · nereden devam edeceğim? | Ana sayfa genel tanıtıma ağırlık veriyor; çalışma sonuçları dağınık. | Tek sonraki adım, kapsam kartları, vaka/deneyim/dosya erişimi. Hedef yoksa kısa hedef başlangıcı. Eksik rol paketi için yanıltıcı varsayılan soru adedi yerine paket seçimi. |
| Aday · yazdığım kaybolmasın | Deneyim ve hedef formu taslakları gezinmede kaybolabiliyor; deneyim düzenlenemiyor. | Yerel taslak, geri dönüşte doldurulmuş form, aynı kimlikle düzenleme ve arama. Taslak, tamamlanmış örnek sayılmaz. |
| İK · aday ne yaptı? | Durum/eylem/sonuç kaydı, karar gerekçesi ve sonucun dayanağını ayrı açmıyor. | Kaynak türü, kişisel katkı, sonuç dayanağı, alternatif, öğrenme/aktarım ve dış etken alanları; eksik alanlara özgü takip soruları. İş/proje/eğitim/gönüllülük beyanları ve kurgusal alıştırma ayrı etiketlenir. |
| Yönetici · sonuç hangi kanıta dayanıyor? | Ayrı raporlar, görüşmede izlenebilir bir örnek dosyasına dönüşmüyor. | Adayın seçtiği kayıtlarla mülakat dosyası, önizleme, JSON ve yazdırma/PDF. Seçilmeyen örnek, CV, ilan ve taslak dosyaya alınmaz. |
| İK · hangi teslime hangi görüş? | Toplama görünümünde eski görüşün yeni yanıt için sanılması riski. | Dosyada sadece son teslim kimliğiyle eşleşen insan görüşü gösterilir. Yeni revizyona eski geri bildirim otomatik bağlanmaz. Değerlendirici uzmanlığı doğrulanmış sayılmaz. |
| Aday · doğru vakayı bulmak | Düzey/tür/rol dışında metin ve çalışma durumu araması yok. | Türkçe metin araması, yeni/taslak/teslim durumu, sıfır sonuç açıklaması ve tek düğmeyle filtreleri temizleme. Hesaptaki dosya durumu ile yerel metin durumu ayrıştırılır. |
| Mobil / klavye | Uzun yatay sekmeler; masaüstünde alt menüler ekran dışına taşabiliyor. | Kompakt mobil açılır menü, dört bağlantılı alt gezinme; kaydırılabilir masaüstü menüsü. İçeriğe geçiş, sayfa odağı, seçili sayfa işareti, Escape ile menü kapatma, azaltılmış hareket. |
| Hız | İlk açılışta 618.045 bayt vaka/arşiv verisi, bütün sayfalarda yükleniyor. | 60.668 bayt hafif katalog. Tam belgeler ve arşiv vaka/teslim veya yedek doğrulama gerektiğinde yüklenir. Başlangıç betikleri defer edilir. |
| Süreklilik | Geç yüklenen belge isteği, kullanıcının geçtiği yeni ekranı değiştirebilir. Hesap durum yenilemesi sayfayı yeniden kurabiliyor. | Yükleme istekleri paylaşılır; yeni sayfaya geçildiyse eski sonuç gösterilmez. Hata/yeniden deneme görünümü. Durum güncellemesi formu yeniden kurmaz; ana sayfa kartları odak kaybı yaratmadan güncellenir. |
| Kayıt açıklığı | Ayarlarda yalnız tarayıcıdan yedekle taşıma anlatılıyor; hesap kaydıyla devam yolu yeterince açık değil. | Cihaz taslağı, açıkça hesaba kaydetme ve yeni cihazda yükleme açıklaması; güncel rehber ve kayıt şeridi. |

## Hız ölçümünün kapsamı

Önceki sürümün index.html betikleri toplamı 766.239 bayt, yeni ilk açılış betikleri yaklaşık 235 KB: sıkıştırılmamış kaynak boyutunda yaklaşık %69 azalma. Bu, sayfanın duvar saatiyle %69 daha hızlı açıldığını söylemez. Ağ, gzip/cache, cihaz ve hesap yanıt süreleri ayrıca ölçülmelidir. Vakaya ilk girişte tam belgeler yine indirilir. Hafif katalog ile tam katalog, 25 rol/zaman bileşiminde aynı hazırlık planını üretir.

## Doğrulama

- Masaüstü: örnek taslağı yazma, başka ekrana gidip dönme, arşive kaydetme, aynı kaydı düzenleme, kaynak türünü değiştirme ve yalnız seçili kaydı dosya önizlemesine alma.
- 390 px iframe: kompakt menü/alt gezinme, hedef taslağı, hedef kaydı ve plan ekranı. Ana sayfada görünür gövde 375 px ve scrollWidth 375 px; yatay sayfa taşması yok. Gerçek telefon işletim sistemi testi değildir.
- Son vaka filtresinin tarayıcı kontrolünde önizlemeye geçiş URL güvenlik kapısınca reddedildi. Kısıt aşılmadı. Filtreler gerçek bağlanan olay işleyicileriyle kod üzerinden doğrulandı; nihai filtre görünümünün ek tarayıcı kontrolü tamamlanmadı.
- check-candidate-experience.cjs: yalnız seçili çıktı, özel alanların dışarıda kalması, eski/yeni yedekler, XSS kaçışı, güncel teslime bağlı görüş, eksik dayanak soruları, metadata/tam katalog eşdeğerliği ve gerçek filtre işleyicileri.
- check-workspace-loading.cjs: ortak bağımlılık isteği, sıralı yükleme, başarısızlık/yeniden deneme, geç yanıtın yeni sayfayı ezmemesi ve durum yenilemesinin formu değiştirmemesi.
- Mevcut vaka, öğrenme döngüsü, yedek, ortak modül ve rol seçenek denge kontrolleri korunur.

## Kalan doğrulama

1. Gerçek adaylarla anlaşılabilirlik, alan sayısı ve işe yarayan çıktı pilotu; gerçek telefonda klavye, indirme/yazdırma ve yavaş ağ ölçümleri.
2. İki gerçek hesapla üretimde teslim, atanmış değerlendirici, geri bildirim ve başka cihazda kayıt yükleme kabul testi.
3. Bağımsız uzman madde incelemesi ve psikometrik çalışma. Metinlerin doldurulması, kaynak notu yazılması veya dosya seçimi mesleki beceriyi doğrulamaz.
4. Dosya ile gönderilmiş PDF/Word/Excel içeriği tarayıcıda otomatik okunup bu dosyaya taşınmaz. O teslimler Hesabım ve teslimler ekranından açılır; mülakat dosyasına bu cihazdaki teslim edilmiş metin çalışmaları alınır.

Bu değişiklik kaynak projede kalır; domain, erişim kitlesi, davet veya ödeme değişikliği yapılmaz. Ağ üzerinden AI çağrısı eklenmez.
