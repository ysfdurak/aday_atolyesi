# Rol seçenekleri: dil ve şık dağılımı incelemesi

31 Ekim 2026 · İçerik 0.4.1

174 tek cevaplı sorunun önceki sürümünde en yüksek puanlı seçenek 172 soruda en uzun seçenekti (%98,9; eşit uzunluklar dahil). Ham kaynakta doğru harfler A:40, B:48, C:45, D:41 idi. Toplam harf dengesi ana sorun değildi; uzunluk ipucu ve gruplarda tekrarlanan anahtar sırası belirgindi.

174 tek cevaplı ve 7 iki eylemli sorunun seçenekleri elle yeniden yazıldı. Altı sıralama sorusunda bağımlılık metinleri korundu; başlangıç görünüm sırası artık soruya göre değişir. Yanlış seçeneklerdeki bazı karikatür ifadeler, yanlış varsayım, eksik kontrol, erken karar veya kısmi çözüm içeren alternatiflerle değiştirildi. Metinler boş sözcükle uzatılmadı. Uzunluk için birden fazla tam, yazılmış alternatif arasından editoryal seçim yapıldı; çalışma sırasında metin üreten, kesen veya dolduran işlem yoktur.

| En yüksek puanlı seçeneğin karakter uzunluğu sırası | Soru adedi |
|---|---:|
| Kısa (eşitlikte alt sıra) | 44 |
| Orta-kısa | 44 |
| Orta-uzun | 44 |
| Uzun | 42 |

Eşit uzunluklar dahil en uzun doğru seçenek sayısı 47/174 (%27,0).

Kelime sayısı sıralaması: 59 / 34 / 35 / 46. Bu sayılar aday verisi veya psikometrik geçerlik göstergesi değildir. Her sorunun seçenekleri arasındaki en yüksek/en düşük karakter uzunluğu oranı 1,8'in altındadır. İncelenen pozisyon paketlerinde en uzun seçeneği işaretlemenin anahtarla eşleşmesi en çok %43,2 oldu; bu da tek başına çeldirici kalitesini veya ölçüm gücünü doğrulamaz.

## Görünüm ve puanlama

Her aktif paketin tek cevaplı sorularında en yüksek puanlı cevabın A–D konumları en fazla bir soru farkla dağıtılır. Düzenli A-B-C-D döngüsü kullanılmaz, art arda üç aynı harf gelmesi engellenir. Soru içindeki diğer seçenekler de karıştırılır. Görünüm aynı profil ve paket kapsamında yenilemede sabittir. Harfler kayıt kimliği değildir: cevaplar özgün seçenek indeksiyle kaydedilir. Gerekçe harfleri aynı görünüm eşlemesini kullanır. Puan anahtarları ve senaryo kimlikleri değiştirilmedi.

Bir paket değiştirilirse görünüm harfleri değişebilir; metin ve kanonik yanıt eşleşmesi korunur. Bu denge sınav güvenliği veya rastgele atama iddiası değildir. Arayüzden erişilebilen hazırlık içeriği işe alım seçme sınavı olarak doğrulanmış sayılmaz.

## Önceki yanıtlar

Değişmiş seçenek metinleriyle eski yanıtlar yeniden yorumlanmaz. Önceki sürüm açıldığında aktif ve pozisyon oturumları özgün soru/seçenek metinleriyle editionArchive içine alınır. Yeni içerikte yanıtlar boş başlar. Arşiv, görünür “Önceki yanıtları indir” düğmesiyle JSON olarak indirilir ve ortak yedekte saklanır. Yükleme aynı arşivi tekrar oluşturmaz. Eski yedek içe aktarımı da aynı sürüm geçişinden geçer. Ortak özet eski sürüm yanıtlarını yeni çalışma tamamlanmış sayısına katmaz.

## Kontroller ve sınırlar

check-role-editorial.cjs: 104 pozisyon/kıdem/derinlik paketi, 1–200 soru için harf dengesi, üçlü tekrar engeli, sabit görünüm, puan ve gerekçe eşleşmesi, özgün metinle arşivleme, arşiv indirme eylemi ve tekrar yükleme.

check-rol.cjs: 76 özgün senaryonun kimlikleri, kapsamı ve puan anahtarları; 187 durum ve 24 yetkinlik. Soru metni sabitliği ile seçenek metni sabitliği artık ayrıdır: bu sürümde seçenek değişikliği amaçlıdır.

Tarayıcıda veri analisti paketi, cevap kaydı, gerekçe harfleri, ileri/geri geçiş ve sayfa yenilemeden sonra aynı cevap/metin eşleşmesi kontrol edildi. Rol/pozisyon ve ortak yedek/özet kontrolleri geçti.

Uzmanların alternatiflerin senaryo içinde makullüğünü ve puan gerekçelerini incelemesi, ardından aday pilotunda çeldirici seçilme oranlarının ölçülmesi hâlâ gereklidir. Uzunluk dengelemesi bu aşamaların yerine geçmez.
