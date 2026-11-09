# 0.14 — mülakat provası ve pilot gözlemi

4 Kasım 2026

## Puanı artırmak için uygulananlar

| İhtiyaç | Uygulanan davranış | Hâlâ gerekli kanıt |
|---|---|---|
| Aday kayıtlarını görüşmede anlatabilsin | Seçilen deneyim ve metin vakasından soru ve takip sorusu; cevap, öz kontrol ve en fazla beş ayrı deneme | Gerçek adayın anlatımını daha anlaşılır bulup bulmadığı |
| Hangi dayanak eksik görülebilsin | Dosyada seçilen kayıtlardaki boş alan soruları ve güncel insan görüşü durumu | Yazılan dayanağın doğruluğu ve kalitesi |
| Hazırlık akışı provaya ulaşsın | Hedef tarihine yakın veya dönüşümlü günde, günlük bütçe içinde 10 dakikalık prova; başlangıç sınavı korunur | Gerçek kullanımda göreve erişim ve tekrar kullanım |
| Eski cevap yeni kaynağa karışmasın | Tam kaynak metni ve soru eşleşmesi; değişiklikte ayrı prova kaydı, ilk denemeler değişmez | İki gerçek cihazda uçtan uca kabul |
| Pilot düzeltme kararı üretsin | Beş görev için yardımsız / yardımla / takıldı / denenmedi, isteğe bağlı süre/yol/cihaz; yöneticiye görev özeti | Gerçek katılımcı kayıtları |
| Ücretli paket hipotezi sınansın | Ücretsiz / fiyat ve kapsam sonrası ücretli denemeyi düşünebilir / kararsız / tekrar kullanmam tercihi | Gerçek fiyat teklifi, ödeme ve tekrar kullanım |

## Yeniden değerlendirme

Önceki ağırlıklar korunur. Bu puan öznel ürün incelemesidir; psikometrik geçerlilik veya kullanıcı araştırması sonucu değildir.

| Alan | 0.13 | 0.14 |
|---|---:|---:|
| Aday için değer | 22/25 | 22/25 |
| İçerik derinliği | 18/20 | 18/20 |
| Geri bildirim ve gelişim döngüsü | 15/20 | 16/20 |
| Kullanım kolaylığı | 16/20 | 17/20 |
| Ticari hazırlık | 9/15 | 9/15 |
| **Toplam** | **80/100** | **82/100** |

Provada yeniden deneme ve dosyadan günlük plana geçiş tamamlandı. Ticari puan artırılmadı: gözlem formu hazırlamak gerçek talep/ödeme doğrulaması değildir. Görsel tarayıcı doğrulaması önceki erişim engeli nedeniyle bu turda da yapılmadı. Gerçek telefon, canlı iki hesap ve aday pilotu halen açık kabul adımlarıdır.

## Kayıt ve kapsam

Prova soruları yalnız dosyada açıkça seçilmiş deneyimlerden ve bu cihazdaki teslim edilmiş metin vakalarından oluşur. CV, ilan, vaka taslağı ve seçilmeyen kayıtlar kaynak yapılmaz. Dosya yüklemelerinde otomatik metin okuma eklenmedi. Prova metinleri aday öz değerlendirmesidir; otomatik kalite puanı veya işe uygunluk kararı yoktur. Prova notları mülakat dosyasına otomatik eklenmez. Tam cihaz yedeği ve adayın açıkça hesabına kaydettiği hazırlık kaydı bunları taşır. Eski provayı silmek kaynak deneyim/vakayı silmez; kaynak değiştiğinde eski prova yeni cevaba taşınmaz.

Pilot görev gözlemleri mevcut deneyim geri bildirimine isteğe bağlı eklendi; önceki kayıtlar geçerlidir. Süreler öz bildirimdir. Yönetici özeti geri bildirim veren kişi sayısını ve görev durumlarını gösterir; tüm davetlilerin katılımı veya başarı yüzdesi diye sunmaz. Ücretli kullanım tercihi satın alma veya fiyat onayı sayılmaz. Erişim kitlesi, domain, davet ve ödeme hizmeti değiştirilmedi. Ağ üzerinden AI çağrısı eklenmedi.

## Doğrulama

- `check-rehearsal.cjs`: seçili kaynaklar, özel metin/taslak dışlaması, kaynak değişikliği, değişmeyen eski deneme, yedek, bütçe, başlangıç sınavının korunması ve seçimden çıkarılan notların gizlenmesi.
- `check-cycle-integration.mjs`: gerçek servis işleyicisinde isteğe bağlı pilot gözlemleri, eski form uyumu, geçersiz durum/süre reddi, güncelleme ve yalnız yönetici özeti.
- Önceki gelişim, aday deneyimi, yükleme, hazırlık, dosya erişimi ve hesap geri yükleme kontrolleri korunur.

## Yapılabilecek sonraki işler

Önce 5–10 aday ve 2–3 İK uzmanı pilotu. Gerçek telefonda indirme/yazdırma ve yazı yazma; iki gerçek hesapta teslim–atama–görüş–revizyon; farklı cihazda kaydı yükleme. Katılımcı adaylar ve uzmanlar henüz atanmadı, davet gönderilmedi. Çalışmanın gözlem düzeni PILOT-PROTOCOL.md içinde. Daha yüksek puanı özellik sayısıyla değil bu adımlardaki bulgular ve düzeltmelerle değerlendir.
