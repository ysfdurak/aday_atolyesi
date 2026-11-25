# Sürüm geçmişi

## 0.23.4 · 25 Kasım 2026

- **Arama motoru (canonical):** Sayfanın standart adresi `workspace.html` yerine `https://aday.ysfdurak.com/workspace` oldu (`og:url` de). Cloudflare `.html` uzantılı adresi uzantısız adrese yönlendirdiği için eski canonical, Google'ı yönlendiren bir adrese gönderiyordu; Search Console'da sayfa "alternatif sayfa / yönlendirmeli" olarak dizin dışında kalıyordu.

## 0.23.3 · 22 Kasım 2026

- **Kullanım ölçümü ve geri bildirim:** `aday.ysfdurak.com` demosu ortak ölçüm servisine (olcum.ysfdurak.com) bağlandı (`web/olcum.js`). Yalnız ekran adı (`#` sonrasının ilk parçası), aktif süre, cihaz türü ve dil gider; vaka cevapları, CV, dosyalar, ad, e-posta ve IP gitmez, çerez yok, DNT/GPC'ye uyulur. Kendi sunucusuna kurulan kopyalar dışarıya istek atmaz. Kenar menüsünde ve sayfa altında "Geri bildirim ver" bağlantısı; servis yüklenmezse görünmez. CSP'ye yalnız bu adres eklendi; "Verilerin nerede saklanır?" tablosuna bir satır eklendi.

## 0.23.2 · 19 Kasım 2026

- **Kendi dosyanı tarayıcıda kontrol et (vitrin):** Canlı demoda kendi dosyan sunucuya gönderilmez, ama teslim alanındaki "Kendi dosyanı yalnız bu tarayıcıda kontrol et" ile biçim ve boyut, Word'de her beklenen çıktının numarasıyla başlayan bir bölüm olup olmadığı ve kelime sayısı kontrol edilir (mammoth, tarayıcıda). Dosya hiçbir yere gitmez.
- **Lint:** 48 uyarı temizlendi; CI artık uyarıya izin vermiyor (`--max-warnings=0`).

## 0.23.1 · 19 Kasım 2026

Güvenlik gözden geçirmesi.

- **Eski çerez biçimi kabul edilmez:** `candidate|vitrin-aday-<kimlik>` biçimindeki eski çerezler artık geçersiz. O kimlikler değişiklikten önce ortak yönetici ve değerlendirici ekranlarında görünüyordu; alan anahtarı olarak kabul edilseydi o ekranları görmüş biri bu ziyaretçinin yeni alanına girebilirdi.
- **Alan açma sınırı:** Her yeni alan D1'e ~25 yazma ve R2'ye 3 dosya demek. Betikle sınırsız alan açılıp günlük kota tüketilmesin diye günde en fazla 1.500, aynı IP'den saatte en fazla 20 yeni alan kurulur (`MAX_SCOPES_DAY`, `MAX_SCOPES_IP_HOUR`); aşınca 503 ve açıklama döner. Var olan alanlar etkilenmez. IP, Cloudflare'in yazdığı `CF-Connecting-IP`'den okunur (Workers'ta istemci bunu değiştiremez).

## 0.23.0 · 19 Kasım 2026

Canlı vitrinde ziyaretçiye özel alan ve yalnız örnek dosya (gizlilik).

- **Önceki durum:** Değerlendirici ve yönetici hesapları ortaktı. Bir ziyaretçi gerçek özgeçmişini veya şirket dosyasını yüklerse, gece silinene kadar bu rolleri seçen başka bir ziyaretçi görebilirdi.
- **Ziyaretçiye özel alan:** Üç rolün hesabı da tarayıcıya ait rastgele alan kimliğiyle biter. `vitrinScope` (pilot-service) teslim listesi, dosya, atama, değerlendirme, taslak, üye, rol, sayaç ve kör değerlendirme ayarını alana göre süzer; yönetici de yalnız kendi alanını görür. Örnekler her alana ilk istekte yüklenir. Eski ortak hesap çerezleri geçersizdir.
- **Yalnız hazır örnek dosya:** Teslim gövdesi seçilen vakanın kurgusal cevap dosyasıyla aynı değilse sunucu reddeder (`guardUpload`). Arayüzde dosya seçme alanı yerine örnek notu ve indirme bağlantısı çıkar; vaka listesi örneği olan vakalarla sınırlıdır.
- **Kabul testi** (`tests/check-vitrin.mjs`): iki bağımsız ziyaretçi örnek akışı tamamlar ve hiçbir rolde birbirinin teslimini göremez, indiremez, atayamaz, değerlendiremez; kendi dosyası ve başka vakanın örneği reddedilir.
- Vitrin dışında (`AA_VITRIN=0`) davranış değişmez.

## 0.22.1 · 19 Kasım 2026

- **Puanlanmış örnek teslim** (`#ornek-teslim`, `CalibrationUI.sampleView`): Henüz çalışma yokken ana sayfada sayaçların üstünde giriş kartı çıkar. Ekran kurgusal bir teslimi ölçüt ölçüt gösterir: verilen düzey (0–3 ölçeği), **neden bu düzey**, ölçütte aranan ve bir üst düzeyin örnek cevabı. Puanlar toplanmaz.
- **Cevaba özel gerekçe:** `content/rubric-examples.json` içine `reasons` alanı eklendi (şimdilik ilk vaka, 4 ölçüt × 3 düzey). Gerekçe yoksa seviye tanımı (anchors) gösterilir. Yeni vakaya gerekçe eklemek için aynı yapıyı doldur, sonra `node tools/build-rubric-examples.mjs`. Taslak etiketi sürer.

## 0.22.0 · 19 Kasım 2026

İK değerlendirmesinde yapılandırılmış değerlendirme (OPM yaklaşımı): aynı ölçek, seviye örnekleri ve değerlendiriciler arası kalibrasyon.

- **Ölçüt örnek cevapları:** 20 vakanın 104 ölçütünün her biri için zayıf (1), yeterli (2) ve güçlü (3) cevap örneği (`content/rubric-examples.json` → `web/rubric-examples.js`). Değerlendirme formunda her ölçütün altında açılır. Hepsi **uzman incelemesi bekleyen taslak** olarak etiketlidir.
- **Değerlendirici kalibrasyonu** (`#kalibrasyon`, `web/calibration-ui.js`): iki değerlendirici aynı sentetik teslimi ölçüt bazında bağımsız puanlar. Ekran farkın hangi ölçütten geldiğini gösterir (en büyük fark, aynı seviye sayısı, satır bazında A/B/fark). Sentetik teslim örnek cevaplardan sabit biçimde kurulur; taslak referans seviyesi karşılaştırmadan sonra açılır. Toplam puan üretilmez. Kayıt yalnız tarayıcıda (`aa-kalibrasyon-v1`).
- **Okunabilirlik:** 12 px altındaki yazılar (etiket, üst başlık, bazı mobil metinler) 12 px'e çıkarıldı.
- **Kontrol:** `tests/check-calibration.cjs` örneklerin bütün ölçütleri kapsadığını, üretilmiş dosyanın güncel olduğunu ve fark kaynağının doğru bulunduğunu denetler.

## 0.21.1 · 16 Kasım 2026

- **İngilizce tur yalnızca açıldığı sekmede sürer.** Önceki sürüm `?lang=en` seçimini tarayıcıya kalıcı yazıyordu; sonra normal adresle açılan Türkçe uygulamada da rehber çıkıyordu. Artık seçim `sessionStorage`'da tutulur, eski kalıcı kayıt ilk açılışta silinir.

## 0.21.0 · 15 Kasım 2026

İngilizce okuyan ziyaretçiler için tanıtım turu. Uygulama Türkçe kalır.

- **`?lang=en` turu** (`web/en-tour.js`): her ekran ve üç modül için İngilizce rehber paneli (aday yazmaya başlayınca küçülür), menü/sekme/başlık altında İngilizce karşılıklar. Seçim aynı sekmede sürer (0.21.1'den beri); `?lang=tr` kapatır. Yazdırırken görünmez.
- **İngilizce vitrin vakası:** "Koru Distribution — Daily operations plan" (`web/cases/en/`): belgeler, tablolar, görevler, ölçütler, referans çözüm, Word/Excel çalışma dosyaları, CSV'ler ve metin paketi. Dosyaları `python3 tools/build-en-showcase.py` Türkçe dosyalardan üretir.
- **Canlı demo girişi** de turu yükler; kök adres (`/?lang=en`) çalışma alanına yönlenirken sorgu değerlerini korur.
- **Kontrol:** `tests/check-en-showcase.mjs` İngilizce vakanın Türkçe vakayla aynı yapıda ve aynı sürümde olduğunu, dosyalarının yerinde olduğunu denetler.

## 0.20.0 · 15 Kasım 2026

İçerik, tasarım ve öğreticilik incelemesi.

- **İlk ziyaret:** Çalışma alanında "Nasıl ilerlersin?" kartı (3 adım). Gelişim raporu boşken teknik terimler yerine "Raporun dolması için üç adım" gösterilir.
- **Deneyim formu:** Zorunlu alanlar önde; kaynak, alternatif, öğrenme ve risk alanları "Anlatımını güçlendir" bölümünde toplanır (doluysa açık gelir). Doldurulmuş, kurgusal bir örnek kayıt eklendi.
- **Rehber:** 11 terimlik "Sık kullanılan terimler" sözlüğü; rehber sayfası menüde yanlış bölümü işaretlemiyor.
- **Vaka ekranı:** "İki yol var" notu başlık ve görev özetinin altına taşındı (telefonda ilk ekranı kaplamıyor).
- **Telefon:** Zihin'in alt menüsü artık Aday Atölyesi çubuğunun altında kalmıyor; Mizaç menüsü tek satırda yatay kayar.
- **Erişilebilirlik:** Ana uygulama ve üç modülde renk karşıtlığı WCAG AA'ya çekildi; başlık sırası ve sayfa bölgeleri düzeltildi. axe denetimi masaüstü ve telefonda 0 ihlal.
- **Dil:** Geliştirici ifadeleri ("Bu sürümde çalışıyor", "İlk geliştirme sürümü", "Geliştirme sırası") kullanıcıya dönük ifadelerle değişti; yan yana düğmeler arasına boşluk eklendi.

## 0.19.1 · 15 Kasım 2026

- Eski GitHub Pages adresi (`ysfdurak.github.io/aday_atolyesi`) canlı demoya, aynı sayfaya yönlenir. Statik sürüm `?static=1` ile açılır.
- Canlı demoda %11 hata oranı giderildi: tablo kurulumu ve örnek yükleme artık istekler arasında paylaşılan Promise kullanmıyor (Cloudflare "promise was created by a request that has since ended" hatası); eşzamanlı ilk isteklerde örnekler yalnız bir kez yüklenir.
- Worker yalnız uygulama yollarını işler; bot taramaları (`.env`, `config.php` vb.) uygulama çalıştırılmadan hızlı 404 alır. İşlemci süresi düşer.
- Örnek geri bildirimin tarihi geçmişe ayarlandı.

## 0.19.0 · 15 Kasım 2026

Canlı demo: **aday.ysfdurak.com**.

- **Cloudflare yayın ayarı** (`wrangler.jsonc`): Worker `aday-atolyesi`, D1 veritabanı ve R2 dosya kovası ilk yayında otomatik oluşur, gece görevi tanımlı.
- **Vitrin modu** (`server/vitrin.mjs`): rol seçerek şifresiz giriş; her ziyaretçiye ayrı aday hesabı, ortak değerlendirici ve yönetici hesabı; kimlik yalnız çerezden okunur, istemcinin gönderdiği kimlik başlıkları silinir.
- **Otomatik tablo kurulumu:** boş veritabanında tablolar ilk istekte `drizzle/` migration'larından kurulur (`server/migrations.mjs`, `aa_schema` tablosu).
- **Örnek veri ve gece sıfırlama:** üç kurgusal teslim (yayımlanmış ölçütlü geri bildirim, gecikmiş, atanmamış); her gece 03.00'te (TSİ) bütün kayıtlar ve dosyalar silinip örnekler yeniden yüklenir.
- **Demo korumaları:** 3 MB dosya sınırı; ortak değerlendirici hesabının rolü düşürülemez (`PROTECTED_MEMBERS`); giriş sayfasında ve Hesap ekranında "gerçek kişisel bilgi yükleme" uyarısı.
- Yeni test `tests/check-vitrin.mjs`; yayın ve işletme rehberi `docs/YAYIN.md`.

## 0.18.1 · 9 Kasım 2026

- **GitHub Pages'te çalışan statik demo.** Uygulama artık `ysfdurak.github.io/aday_atolyesi` adresinde telefondan da açılıyor. Kökten başlayan yollar yayın klasörüne göre çözülüyor; modül sayfaları ortak dosyaları göreli yoldan yüklüyor.
- **Statik mod notu:** Bu sürümde hesap, dosya teslimi, İK değerlendirmesi ve otomatik hesap kaydı kapalı. Uygulamanın üstünde, Hesap ekranında, vaka ve gelişim ekranlarında ve modül alt çubuğunda bu durum yazıyor; README'ye de not eklendi.
- README'de `127.0.0.1` demo adresinin yalnızca komutu çalıştıran bilgisayarda açıldığı belirtildi.

## 0.18.0 · 9 Kasım 2026

İK değerlendirmesi ve aday akışı revizyonu.

- **Ölçüt seviyeli geri bildirim:** Değerlendirici her vaka ölçütü için 0–3 arası seviye seçer (seviye tanımları formda görünür) ve isteğe bağlı dayanak yazar. Seviyeler toplanmaz, tek puana dönüşmez; adaya ölçüt bazında çubuklarla gösterilir. Çıktı notları kısaltıldı: dayanak ve sonraki adım tek satır.
- **Ekranda dosya önizleme:** Word, Excel ve PDF teslimleri indirmeden açılır. Aday dosyası betik çalıştıramayan bir çerçevede gösterilir; Excel için ek kütüphane yerine küçük, yerleşik bir okuyucu kullanılır.
- **Kör değerlendirme:** Yönetici açtığında değerlendiriciler aday e-postası, kullanıcı kimliği ve dosya adı yerine sabit bir takma ad (ör. “Aday A-4DB451”) görür. İndirilen dosyanın adı da gizlenir.
- **Kuyruk yönetimi:** Bekleyen teslimler en eskiden başlar; her teslimde bekleme süresi ve 3 günlük hedefi aşma uyarısı. Yöneticide bekleyen/geciken/atanmamış sayıları, tek değerlendiriciye veya eşit dağıtarak toplu atama.
- **Role göre ekran:** Değerlendirici ve yönetici, aday metni yerine kendi işine yönelik başlık görür.
- **Plan ekranı:** Günlük listenin üstünde “Şimdi yapılacak tek adım” kartı.
- **Mizaç:** 96 ifade üç kısa oturuma bölündü; oturum sonlarında yanıtlar kaydedilir ve plana dönülebilir. Ara puan gösterilmez.
- **Hitap:** Vaka görevleri, Word/Excel cevap alanları ve Mizaç aday raporu “sen” hitabına geçti.
- Veritabanı: `0004_blind_review_settings` migration'ı (`pilot_settings` tablosu). Yeni test: `tests/check-review.mjs`.

## 0.17.0 · 9 Kasım 2026

Kullanım kolaylığı ve kod düzeni revizyonu.

- **Gezinme:** Menü 13 öğeden 7 başlığa indi. Mülakat hazırlığı (deneyim örnekleri, mülakat dosyası, prova, CV), Gelişimim (gelişim raporu, modül sonuçları) ve Hesap ve ayarlar alt sekmelerle açılır. Mobil alt çubukta Vakalar ve Mülakat eklendi.
- **Vaka ekranı:** Geniş ekranda belgeler ve cevap alanları yan yana. Her çıktıda kelime sayacı (vaka sınırı varsa uyarı), tek tıkla yapı şablonu, isteğe bağlı süre tutucu ve teslim öncesi öz kontrol listesi.
- **İki teslim yolu ayrıldı:** Ekrandaki metin teslimi “Bitirdim, referansla karşılaştır” olarak adlandırıldı; değerlendiriciye yalnız dosya tesliminin gittiği vaka ekranında açıkça yazıyor.
- **Vaka havuzu:** Devam eden ve hedef role uygun vakalar önce, sonra kolaydan zora sıralanır; uygun vakalarda “Hedefine uygun” etiketi.
- **Otomatik hesap kaydı:** Hesabım ekranından açılabilir. Değişiklikler birkaç dakikada bir gönderilir; başka cihazda daha yeni kayıt varsa üzerine yazılmaz ve otomatik kayıt durur.
- **Metin:** Vaka metinlerinde sayı ve noktalama çevresindeki 400'e yakın eksik boşluk düzeltildi; Word/Excel paketleri yeniden üretildi. “Assessment Atölyesi” adı “Vaka Atölyesi” oldu. Mizaç aday ekranlarında hitap “sen” olarak birleştirildi. Tekrarlanan uyarılar “Nasıl çalışır?” sayfasında “Verilerin nerede saklanır?” bölümünde toplandı.
- **Hatalar:** Zihin Parkuru menüsündeki iki öğenin yazı boyutu, herkese görünen sabit “YD” rozeti, misafir kullanıcıda her sayfada oluşan 401 istekleri ve eksik favicon düzeltildi.
- **Kod:** Kaynak dosyalar Prettier ile okunabilir biçime getirildi. Kök dizin `tests/`, `tools/`, `server/`, `docs/` olarak düzenlendi. Kullanılmayan şablon bileşenleri ve 20 bağımlılık kaldırıldı. Kimlik okuma `server/identity.mjs` modülüne ayrıldı ve başlık adları ortam değişkeniyle değiştirilebilir. ESLint hataları giderildi, CI'a lint adımı eklendi.

## 0.16.0 · 9 Kasım 2026

- Bir teslim sunucuda kabul edildiğinde, liste yenilenemese de aday teslim kodunu görür.
- Savunma ve aktarım isteği ekranda açılan son dosya teslimine bağlanır. Daha yeni bir revizyon eski ekrandan gönderilen isteği geçersiz kılar.
- İK incelemesi teslim zinciri ve ölçütlere odaklanır. Adayın hesapta tuttuğu kişisel dosya notlarına erişim teslim sahibine ayrılır.
- Teslim araması ve görüş filtresi liste yenilemelerinde korunur. Bir taslak yükleme hatası sonrası yeniden deneme yapılabilir.
- Örnek aday, değerlendirici ve yönetici rolleriyle yerel demo, kurulum dokümanları ve CI iş akışı eklenir.

## 0.15.1

Geçerli rol seçimi geçmişinin kayıt kurtarma ekranını yanlış tetiklemesi düzeltildi. Sorunlu kayıt türü ekranda gösterilir.

Önceki geliştirme ve doğrulamalar [geliştirme geçmişinde](docs/HISTORY.md) yer alır.
