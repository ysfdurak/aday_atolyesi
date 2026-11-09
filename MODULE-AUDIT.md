# Birleşik modüllerin kaynak ve kapsam kontrolü

## Seçenek düzenlemesi — içerik 0.4.1

174 tek cevaplı ve 7 plan sorusunun seçenekleri uzunluk/dil açısından düzenlendi. Önceki 172/174 en uzun doğru seçenek örüntüsü giderildi. Paket bazında harf dengesi, sabit görünüm/kanonik yanıt eşlemesi ve eski sürümün özgün metinlerle indirilebilir arşivi eklendi. Ayrıntı ve sınırlar: ROLE-OPTION-REVIEW.md. Aşağıdaki 0.11 ve önceki kaynak karşılaştırmaları geçmiş kapsamı açıklar; bu sürümde 76 eski sorunun seçenek metinleri de bilinçli olarak güncellendi. Kimlik, senaryo ve puanları korunur.


## Güncel sürüm 0.11 — pozisyon ve bağlam

Aşağıdaki önceki kaynak karşılaştırmasının üzerine rol içeriği 0.4.0 geliştirildi: 20 pozisyon, 4 sorumluluk kapsamı, 24 yetkinlik, 187 bağımsız durum. Önceki 112 durum korunur; 55 yeni yetkinlik durumu ve 20 pozisyona özel durum eklenir. Her paket tüm bankayı içermez. Pozisyon/aile, seçilen yetkinlik ve derinlik kapsamı belirler. Pozisyon-kıdem değişiminde eski yanıtlar ayrı oturumda korunur ve geri yüklenir.

Yeni alanlar: sistem analizi, süreç, kök neden/deney, proje, finans, risk, kalite, dijital otomasyon, paydaş, sonuç, strateji ve ticari muhakeme. Her alanın davranış beklentisi, riski, görüşme sorusu, gelişim görevi ve gözlem göstergesi vardır. Pozisyon haritaları meslek normu değil, hazırlanmış çalışma önerileridir.

Zihin Parkuru: pozisyon üç alanı; kıdem ilk tasarım düzeyini önerir. Son 30 günün öğrenme modundaki ipucusuz gerçek yanıtları kullanılır. Aynı düzeyde son 24 yanıtta >=%85 bir üst düzeyi denemeyi, <%55 bir alt düzeyde pekiştirmeyi önerir; sınırlar 1–3. Daha az kanıtta son çalışılan düzey korunur. Eşikler ürün tasarımıdır, psikometrik kalibrasyon değildir; tekrar yanıtlar bağımsız maddeler olarak doğrulanmış sayılmaz. Genel 36 soruluk / 40 dakikalık dengeli deneme değişmez.

Mizaç: özgün 96 ifade, 6 senaryo ve puanlama korunur. Yeni panel pozisyon, dört beyan edilmiş iş koşulu, gerçek deneyim, destek ihtiyacı ve küçük deneyi ayrı kaydeder. İdeal kişilik, meslek uyum yüzdesi veya başarı tahmini üretmez. Bağlam değişimi tercih puanını değiştirmez.

Kaynaklar: content/positions.json, position-context.template.js, competencies-v040.json ve position-items.json. Derleme bu dosyalardan ortak pozisyon betiğini, rol bankasını ve modül sözleşmesini yeniden üretir. check-positions.cjs 52 geçerli pozisyon/kıdem bileşimini; check-position-modules.cjs gerçek modüllerin hedefli parkurunu, Mizaç puan değişmezliğini ve rol kayıt dönüşünü kontrol eder. Tarayıcıda veri analisti paketi, 12 soruluk hedefli parkur ve Mizaç örnek/ayrıntılı rapor paneli kontrol edildi.

Kalan içerik kalitesi işi: uzman madde incelemesi, adaylarla anlaşılabilirlik pilotu, görev alanına göre kapsam ve güçlük kalibrasyonu. Bu sürüm bunları tamamlanmış saymaz. Ayrım için başvuru: https://www.onetcenter.org/content.html ; buradaki eşleştirmeler ve eşikler O*NET tarafından doğrulanmış değildir.

## Önceki kaynak karşılaştırması (0.10)

31 Ekim 2026. Hedef yalnız Aday Atölyesi içindeki kopyalardır; ayrı üç Site değiştirilmedi.

| Modül | Karşılaştırılan kaynak | Bulgu ve işlem |
|---|---|---|
| Rol Atölyesi | 29beb956b4d55ebe3d25919d78903e9e5647e4cf | Birleşik üründe 0.1.0 / 24 soru / 8 yetkinlik kalmıştı. Kaynaktaki 0.2.0 / 76 soru / 12 yetkinlik taşındı; mevcut soru metinleri ve anahtarları korunarak 36 profesyonel/bireysel durum eklendi. Birleşik içerik 0.3.0: 112 soru. |
| Mizaç | 477acfc37873d5d1835d71ab7c7e89c9928ada84 | Motor, 96 ifade, 6 senaryo, 8 tercih/16 alt boyut ve ayrıntılı rapor kaynakla eşleşiyordu. Birleşik aday özetinde kalite notları görünmüyordu: eklendi. Geçersiz/eksik yanıtın rapor ve ortak özet tamamlanmasına geçmesi engellendi. |
| Zihin Parkuru | 8112ef0a05e0513bfdb0782c6998ad53204f4e4f | Soru motoru, ek bankalar, koç, keşif, sınav ve pilot dosyaları kaynakla eşleşti. Farklar aday diline uyarlanan arayüz ve ortak dönüş bağlantılarıydı. Bağımsız çözüm, oturum, koç, sınav ve pilot kontrolleri geçti. |

## Rol kapsamı

Yedi seçenek: ekip lideri; operasyon/depo ekip yöneticisi; iş/süreç/veri analisti; operasyon/lojistik uzmanı; proje/destek uzmanı; yeni mezun; özel paket.

On iki yetkinlik: ekip geliştirme, delegasyon, performans yönetimi, çatışma yönetimi, karar/problem çözme, iş/öncelik yönetimi, değişim/iş birliği, adil/sorumlu yaklaşım, iletişim/beklenti netliği, müşteri/hizmet odağı, analitik düşünme/veri okuryazarlığı, öğrenme çevikliği/öz gelişim.

Yönetici olmayan rotalara ekip geliştirme, delegasyon ve çalışan performansı soruları otomatik verilmez. Genel profesyonel durumlara ek olarak analist, operasyon uzmanı ve proje uzmanı için ayrı durumlar vardır. Yeni mezun soruları doğrudan çalışan yönetimi gerektirmez. Teknik meslek yeterliliği sınavı veya uzmanlaşmış SQL/WMS/finans sertifikasyonu iddiası yoktur.

Yetkinlik kartından doğrudan paket seçilebilir. Standart/geniş derinlik, gerçek rol uygunluğu ve seçilen yetkinlikler üzerinden soru adetlerini hesaplar. Adetler eşitlenmez. Oturum içinde yetkinliklere geçiş ve soru havuzunda rol/yetkinlik/metin filtreleri bulunur. Öncelik, sırayı değiştirir; cevap puanını değiştirmez. Önceden yanıtsız sorunun gerekçesi havuz önizlemesinde açılmaz. Tarayıcıda çalışan eğitim içeriği güvenli işe alım sınavı değildir.

Eski 24 ve kaynak 76 sorunun sabit kimlikleri, metni, seçenekleri ve anahtarı korundu. 0.1.0/0.2.0 oturumları silinmez; genişleyen kapsamda tamamlanma yeniden hesaplanır. Soru ve profil kapsamı değişince dışarıda kalan yanıtlar yeni rapora katılmaz. Kısmi kapsam için alan indeksi oluşturulmaz. Ortak özet yalnız aktif soruların sayılarını ve gerçek tamamlanmayı kullanır. Yeni sorular aynı anahtarı veya kişilik tercihlerini mesleğe uygunluk puanına dönüştürmez.

## Yeniden oluşmaması için

- role-base-v020.json, karşılaştırılan özgün 76 sorunun sabit kaynağıdır.
- role-expansion.json, 36 yeni sorunun düzenlenebilir kaynağıdır.
- build-role-bank.cjs, rol bankasını üretir; check-rol.cjs eski sorularda sessiz değişikliği ve rol sızıntısını yakalar.
- build-module-contracts.cjs, ortak özetin kapsam sözleşmesini gerçek bankadan ve Mizaç motorundan üretir. Yayın derlemesi bunu çalıştırır; sabit 24/8 gibi eski arayüz adetlerine dayanılmaz.
- check-modules-integration.cjs, beş hedef rolün gerçek modül köprüsünden geçişini, Mizaç geçersiz/örnek kayıt izolasyonunu ve ortak sayıları doğrular.

Soru sayısı, içerik geçerliği kanıtı değildir. Anahtarlar ve yorum eşikleri uzman incelemesi, aday anlaşılabilirlik pilotu ve ölçme araştırması bekliyor. Zihin Parkuru güçlük etiketleri normlanmış değil; Mizaç öz bildirimdir. Bunlar teknik düzeltmelerle tamamlanmış sayılmaz.
