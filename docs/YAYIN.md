# Yayın rehberi: aday.ysfdurak.com canlı demosu

Bu belge uygulamanın internette nasıl çalıştığını, nasıl yayınlandığını ve bir sorun çıkarsa nereye bakılacağını anlatır. Amaç, kodu açmadan "bu nasıl çalışıyor?" sorusuna cevap verebilmek.

## Kısaca

| Adres | Ne | Sunucu var mı? |
| --- | --- | --- |
| `aday.ysfdurak.com` | Tam canlı demo: hesap, dosya teslimi, İK değerlendirmesi, kör değerlendirme | Evet: Cloudflare Workers + D1 + R2 |
| `ysfdurak.github.io/aday_atolyesi` | Canlı demoya yönlendirme (aynı sayfaya gider). Statik sürüm `?static=1` ile açılır | Hayır (GitHub Pages) |
| `npm run demo` | Bilgisayarda tam demo, kayıtlar bellekte | Bilgisayarın kendisi |

## Canlı demo nasıl çalışır?

Uygulama tek bir **Cloudflare Worker** olarak çalışır. Worker üç şeye bağlıdır:

- **Statik dosyalar** (`web/` klasörü; derlemede `public/` üzerinden yüklenir): arayüz, vakalar, Word/Excel dosyaları.
- **D1 veritabanı** (`aday-atolyesi-db`): üyeler, teslim kayıtları, geri bildirimler, hesap yedekleri.
- **R2 dosya kovası** (`aday-atolyesi-dosyalar`): adayların yüklediği PDF/Word/Excel dosyaları.

Ayarların hepsi kök dizindeki `wrangler.jsonc` dosyasındadır. Veritabanı ve kova adları burada yazılıdır ama kimlikleri yoktur: ilk yayında Cloudflare ikisini de kendisi oluşturur.

### Vitrin modu (`AA_VITRIN = "1"`)

Canlı demo herkese açık bir vitrindir ama her ziyaretçinin alanı ayrıdır. Bu mod `server/vitrin.mjs` dosyasında ve `worker/index.ts` içinde çalışır:

1. **Giriş:** `/signin-with-chatgpt` adresi rol seçme sayfası gösterir (aday, İK değerlendiricisi, pilot yöneticisi). Şifre yoktur. Seçilen rol tarayıcıya bir çerezle (`aa_vitrin`) yazılır.
2. **Her ziyaretçinin alanı ayrıdır:** Tarayıcı ilk girişte rastgele bir alan kimliği (UUID) alır. Üç rolün hesabı da bu alana aittir: `vitrin-aday-<alan>`, `vitrin-degerlendirici-<alan>`, `vitrin-yonetici-<alan>`. Rol değiştirince aynı alanda kalınır; aday olarak gönderdiğini yönetici olarak görürsün.
3. **Alanlar birbirini görmez:** `server/pilot-service.mjs` içindeki `vitrinScope` her sorguyu alana göre süzer: teslim listesi, dosya indirme, atama, değerlendirme, taslak, üye listesi, rol değişikliği, sayaçlar ve kör değerlendirme ayarı. Yönetici de yalnız kendi alanını görür. Vitrin dışında (`AA_VITRIN=0`) alan boştur, davranış değişmez. `tests/check-vitrin.mjs` iki bağımsız ziyaretçiyle bunu sınar.
3a. **Yalnız hazır örnek dosya:** Teslimde dosya, seçilen vakanın hazır kurgusal cevap dosyasıyla bayt bayt aynı olmalıdır (`guardUpload`); başka her dosya sunucuda reddedilir. Arayüzde dosya seçme alanı yerine "hazır kurgusal örnek" notu ve indirme bağlantısı (`/vitrin-ornek?case=…`) çıkar. Böylece gerçek özgeçmiş veya şirket dosyası vitrine hiç girmez.
4. **Kimlik yalnız çerezden okunur:** İstemci kendi isteğine kimlik başlığı (`oai-authenticated-user-*`) eklese bile Worker bunları siler. Böylece kimse başka biri gibi davranamaz.
5. **Tablolar kendiliğinden kurulur:** İlk istekte `server/migrations.mjs` listesindeki tablolar kurulur. Hangi kurulumun yapıldığı `aa_schema` tablosunda tutulur; yeni bir migration eklenirse bir sonraki istekte yalnız o çalışır.
6. **Örnek veri:** Her alana ilk istekte üç kurgusal aday teslimi yüklenir: biri ölçütlü geri bildirimle yayımlanmış, biri değerlendiricide 4 gündür bekliyor (hedef süre aşılmış), biri atanmamış. Böylece değerlendirici ve yönetici rolleri boş ekranla karşılaşmaz.
7. **Gece sıfırlama:** Her gece 00:00 UTC'de (03:00 TSİ) Cloudflare zamanlanmış görevi çalışır. Bütün alanların kayıtları ve dosyaları silinir; bir alan bir sonraki istekte örneklerle yeniden kurulur.
8. **Hızlı 404:** Statik dosyalar Worker çalışmadan sunulur. Worker'a yalnız `/`, `/api/pilot`, `/vitrin-ornek` ve giriş/çıkış yolları gelir; başka her istek (ör. botların `.env`, `config.php`, `dump.sql` taramaları) uygulama çalıştırılmadan 404 alır.
9. **Eşzamanlı istekler:** Cloudflare bir isteğin başlattığı işi başka bir isteğin beklemesine izin vermez ("This promise was created by a request that has since ended" hatası). Bu yüzden tablo kurulumu ve örnek yükleme istekler arasında paylaşılan bir iş olarak değil, aynı anda iki istek çalıştırsa da güvenli olacak şekilde yazıldı; bir alanın örneklerini yalnız `vitrin_seeded:<alan>` işaretini ilk alan istek yükler.
10. **Sınırlar:** İstek gövdesi en fazla 3 MB. Bir ziyaretçi rolleri ancak kendi alanında değiştirebilir; başkasının demosunu bozamaz.

## Yayın akışı

Depo Cloudflare Workers Builds'e bağlıdır. `main` dalına her gönderimde Cloudflare:

1. `npm ci` ile paketleri kurar,
2. `npm run build` ile derler (`web/` → `public/`, Worker kodu ve ayarlar `dist/` altına),
3. `npx wrangler deploy` ile yayınlar.

### İlk kurulum (bir kez, Cloudflare panelinde)

1. **Workers & Pages → Create → Import a repository** → `ysfdurak/aday_atolyesi`.
2. Proje adı: `aday-atolyesi`. Derleme komutu: `npm run build`. Yayın komutu: `npx wrangler deploy`. Üretim dalı: `main`.
3. İlk yayın bitince **Settings → Domains & Routes → Add → Custom domain** → `aday.ysfdurak.com`.
4. Kontrol: `aday.ysfdurak.com` açılmalı, Hesap ve ayarlar → Giriş yap → bir rol seç.

Veritabanı, dosya kovası ve gece görevi ilk yayında otomatik oluşur; panelde ayrıca bir şey açmak gerekmez. R2 hesapta etkin olmalıdır.

## Değişiklik yaparken

| Değişiklik | Yapılacak |
| --- | --- |
| Arayüz, vaka, metin | Normal geliştirme; `main`e gönderim yeterli |
| Yeni veritabanı tablosu/sütunu | `drizzle/` altına migration ekle, sonra `node tools/build-migrations.mjs` |
| Vitrin örnek teslimleri | `tools/build-vitrin-samples.py` içindeki metinleri değiştir ve çalıştır |
| Vitrini kapatmak | `wrangler.jsonc` → `AA_VITRIN: "0"` (bu durumda kimlik doğrulayan bir ağ geçidi gerekir) |

`npm test` vitrinin bütün parçalarını denetler (`tests/check-vitrin.mjs`): tablo kurulumu, örnek kuyruk, rolle giriş, sahte kimlik başlıklarının silinmesi, korumalı hesap ve gece sıfırlama. Migration listesi güncel değilse test bunu söyler.

## Bir sorun çıkarsa

- **Sayfa açılıyor ama Hesap ekranı "Veritabanı hazırlanıyor" diyor:** İlk tablo kurulumu başarısız olmuştur. Cloudflare panelinde Worker → **Logs** bölümünde `vitrin schema` satırına bak.
- **Örnek teslimler görünmüyor:** Logs'ta `vitrin seed` satırına bak. Gece sıfırlamasını beklemeden düzeltmek için D1 konsolunda `DELETE FROM pilot_settings WHERE key='vitrin_seeded'` çalıştır; bir sonraki istekte örnekler yeniden yüklenir.
- **Gece sıfırlaması çalışmadı:** Worker → **Settings → Trigger Events** bölümünde `0 0 * * *` görünmeli. Yerel ortamda bu derleme biçiminde zamanlanmış görev tetiklenemiyor (wrangler dev kısıtı); sıfırlama kodu `tests/check-vitrin.mjs` ve ayrı bir deneme Worker'ıyla doğrulandı.
- **Logs'ta `.env`, `config.php`, `server.key` gibi istekler:** Yeni açılan her alan adına gelen otomatik tarama botlarıdır. Bu dosyalar uygulamada yoktur; hepsi 404 alır ve bir şey sızmaz. Hata olarak değil, 404 olarak görünmeleri beklenir.
- **Cloudflare ücretsiz plan:** Worker istek başına kısa bir işlemci süresiyle sınırlıdır. Büyük Office dosyalarının doğrulaması bu süreyi zorlayabilir; vitrinde 3 MB sınırı bu yüzden de var.

## Gerçek bir pilot için

Vitrin bir tanıtım ortamıdır: şifresiz giriş, yalnız örnek dosya ve gece silme gerçek adaylar için uygun değildir. Gerçek adaylarla pilot yapılacaksa:

- Kalıcı kayıtlar, gerçek hesaplar ve kişisel veri saklanacağı için **kendi sunucunda (VPS)** çalıştırmak daha uygundur: kim, hangi veriye erişir, yedek nerede durur kontrol sende olur.
- Kimlik doğrulayan bir giriş eklenmelidir (ör. Cloudflare Access ya da kendi giriş sistemin). Başlık adları `AUTH_USER_ID_HEADER` ve `AUTH_EMAIL_HEADER` ile değiştirilebilir (`server/identity.mjs`).
- KVKK kapsamında aydınlatma metni ve saklama süresi belirlenmelidir.
