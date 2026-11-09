# Sürüm geçmişi

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
