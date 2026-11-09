# Pilot öncesi kabul listesi — 0.15

4 Kasım 2026 · Aday Atölyesi

Bu liste önceki incelemede belirlenen sekiz alanın bu turdaki kapsamını sabitler. “Uygulandı / otomatik kontrol geçti” ile gerçek cihaz ve katılımcı kabulünü ayırır. Yeni özellik sayısı, ürünün ölçüm geçerliliği veya ticari doğrulaması sayılmaz.

| Alan | Uygulanan / denetlenen | Kabul dayanağı |
|---|---|---|
| Pozisyon derinliği | 20 pozisyonun tamamında hedef, üç davranış beklentisi, somut çıktı, üç görüşme sorusu ve birbiriyle bağlı vaka yolu; dört kıdem/sorumluluk odağı | check-prepilot: tekil 20 pozisyon, gerçek vaka/aktarım eşleşmesi. Yeni pozisyon normu veya her pozisyona ayrı teknik sınav iddiası yok. |
| Rol soruları | Mevcut 187 madde ve seçenek dengesi tekrar denetlendi. 24 yetkinlikte karşı koşul soruları, adayın kendi seçimine bağlı gerekçesi ve kararını değiştirecek koşul kaydı eklendi; raporda aynı seçime bağlı öz açıklama görünür | check-role-editorial, check-rol, check-positions, check-prepilot. Uzunluk/anahtar dağılımı, seçenek-gerekçe eşleşmesi ve 104 paket yapılandırması. Metinlerin psikometrik ayırt ediciliği doğrulanmış sayılmaz. |
| Zihin Parkuru | Mevcut 60 sayısal kurgu ve farklı çözüm aileleri tekrar kontrol edildi; altı alanda gerçek yanlış yanıta bağlı hata defteri, adayın hata hipotezi, yeniden çözüm yöntemi ve sonraki soru kontrolü eklendi. Gelişim raporu ilgili yanlışa gider | Sekiz zihin kontrol grubu; bağımsız çözücüler, tam UI model akışları, aynı katsayı ailesinin yapısal çeşitlilik sayılmaması. Hata notu sınav puanını değiştirmez; görülmüş soru yeni ölçüm sayılmaz. |
| Mizaç | Sekiz boyutta pozisyon/kıdem bağlamına bağlı olay, ters örnek, destek koşulu, deney ve gözlem notları. Eksik/demo raporda kişisel kayıt yapılmaz. Kayıt hatası görünür hale getirildi | check-mizac, check-modules-integration, check-prepilot. 96 madde ve 16 alt boyutta ters kodlama korunur; yeni notlar puanı değiştirmez. |
| Dosyayla çalışma | PDF/DOCX/XLSX teslim zinciri, ilk/son indirme, çıktı bazında referans/değişim karşılaştırması, hesabında kayıtlı görüşme özeti, açıkça cihaza aktarma, seçilen özetin mülakat dosyası ve provada kullanılması | check-cycle-integration, check-prepilot ve yerel Worker/D1/R2 testi. Dosya otomatik okunmaz; özet ve sayfa/hücre referansları aday beyanıdır. |
| Değerlendirici deneyimi | Teslim araması, görüş durumu filtresi; aynı zincirde önceki dosyalar ve bu teslimlere bağlı görüşler; vaka ölçütleri; sekmede korunabilen ve ayrıca hesabına kaydedilebilen taslak | Atanmış revizyonun yalnız kendi atalarını görme, farklı aday reddi, yetki geri alınınca erişimin kapanması ve değişmeyen eski notlar servis testinden geçti. |
| Aday akışı | Dört seçimlik kısa başlangıç; güncel rehber; dosyadan görüşmeye bağlantılar; mobil genişlik ve okunabilirlik için biçimler; filtreleme formları yeniden kurmaz | Plan bütçesi, temel deneme koruması, seçili içerik, kaynak değişimi ve yedek kontrolleri. Yeni ekranların görsel tarayıcı kabulü aşağıda açık. |
| Teknik sağlamlık | Dosya notlarında eski sürümle yazma reddi, aynı anda ilk kayıt güvenliği, kaynak/kişi/sürüm sınırları, geç gelen hesap yanıtının yeni sayfayı ezmemesi; okunamayan cihaz kaydını ham dışa aktarma/geri yükleme/sınırlı sıfırlama ekranı | Yerel Worker gerçek D1/R2 bağları, SQLite servis testleri, yedek sınırları, sekme taslaklarının kişi/sürüm ayrımı ve kurtarma tespiti. |

## Dosya ve kaynak sınırları

Dosya karşılaştırması sayfa/hücre/bölüm referanslarını kullanıcıdan alır; uygulama Office/PDF metnini çıkarmaya veya alıntıyı doğrulamaya çalışmaz. Dosyanın kendi biçimi/boyutu ve dosya içeriğinin uzantıyla uyumu kontrol edilir. İlk–son notu ilgili teslim zincirindeki sabit ilk ve son kimliklerine bağlanır. Daha yeni teslimden sonra eski notlar okunur; eski teslimin üzerine güncel not gibi yazılamaz.

Bir revizyona atanmış değerlendirici o revizyonun atası olan önceki dosyaları da inceleyebilir. Farklı zincir, kişi veya vaka için bu atama yetki vermez; rol/atama her istekte güncel veriden kontrol edilir. Bu değişiklik ayrıca dosya indirme yetkisinde uygulanır. Aday, başkasının karşılaştırma veya görüşme özetini yazamaz.

Cihaza aktarılan dosya özeti, özgün dosyanın kopyası veya doğrulanmış ayrıştırması değildir. Belirli teslim anındaki aday özeti olarak saklanır; daha yeni dosya gönderilince otomatik güncellenmez. Aday hangi özeti mülakat dosyasına koyacağını seçer. Dahil edilmeyen özet ve iç kullanıcı kimliği dışa çıkmaz. Kaynak metin veya seçilen cevap değişirse eski prova/gerekçe yeni cevaba taşınmaz.

Vakalardaki çıktı sayısı, o vakanın yayımlanmış sürümündeki beklenen çıktılara göre belirlenir (mevcut vakalarda dört veya beş). Yeni notlar aynı sayıyı ve numaraları kullanır; önceki vaka sürümleri/teslimler değiştirilmedi. Word/Excel içindeki numaralar ayrıca denetlenmiştir.

## Otomatik kontrol sonucu

29 kontrol grubu çalıştırıldı: kök profil/plan/yedek; yeni pilot kabul, prova, gelişim; aday deneyimi; yükleme/yeniden deneme; dosya döngüsü; pilot servis ve istemci; gerçek yerel Worker/D1/R2; sekiz zihin grubu; rol, seçenek dengesi, mizaç, pozisyon ve modül bütünleşmesi; vaka, öğrenme, dosya bütünlüğü ve 20 DOCX/20 XLSX.

Soru bankası kontrolleri çok sayıda üretilmiş soruyu ve bağımsız çözümleri denetler. Sentetik veriler yazılım doğrulamasıdır; gerçek aday öğrenmesi veya psikometrik geçerlilik kanıtı değildir. Başlangıç JavaScript'ine eklenen küçük akış dosyaları nedeniyle önceki sürümün hız yüzdesi bu sürüm için tekrar iddia edilmez. Gerçek cihaz/ağ süreleri ölçülmedi.

## Açık kabul adımları — tamamlandı sayılmıyor

1. Yeni ekranların masaüstü ve gerçek telefonda görsel/klavye/indirme-yazdırma kontrolü. Önceki tarayıcı erişimi güvenlik politikasıyla engellendiği için bu turda aynı işlem veya alternatif erişim yolu yeniden denenmedi.
2. İki gerçek hesapla canlı giriş, aday teslimi, atanmış değerlendirici incelemesi, revizyon ve başka cihazda devam. Yerel otomatik iki kullanıcı testi, bu canlı kontrolün yerine geçmez.
3. Pilot katılımcılarını ve değerlendiricileri seçme, geri bildirim süresini belirleme; ardından erişim izinlerini kullanıcı kararıyla açma. Bu turda davet gönderilmedi ve mevcut yalnız-sahip erişimi değiştirilmedi.
4. Gerçek aday pilotu, bağımsız uzman madde incelemesi/psikometrik çalışma ve gerçek ücretli talep denemesi. Bunlar özellik geliştirerek tamamlanmış sayılamaz.

Kaynak ve içerik tarafındaki bu kapsam uygulandı. Bu açık kabul adımları nedeniyle ürün “tüm saha doğrulamaları tamamlandı / herkese açık pilot yayını hazır” diye etiketlenmez. Pilot gözlem düzeni PILOT-PROTOCOL.md içindedir.
