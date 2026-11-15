# İngilizce tanıtım turu

Aday Atölyesi Türk adaylar için yazıldı: sınav soruları Türkçe dil bilgisine, vakalar Türkiye'deki işe alım bağlamına dayanır. Bu yüzden uygulama **çevrilmedi**. İngilizce okuyan biri (ör. sitenin İngilizce sürümünden gelen bir işveren) uygulamayı yine de anlayabilsin diye üstüne ince bir tanıtım katmanı eklendi.

## Ziyaretçi ne görür?

| Adres | Sonuç |
| --- | --- |
| `https://aday.ysfdurak.com/?lang=en` | Tur açılır ve bu tarayıcıda hatırlanır (`localStorage` anahtarı `aa_lang`). |
| `https://aday.ysfdurak.com/?lang=tr` | Tur kapanır. Paneldeki **Turn off** bağlantısı da aynı işi yapar. |

Tur açıkken:

1. **Rehber paneli** (sağ alt, "English guide"): bulunulan ekranın ne işe yaradığını ve "Try this" ile denenecek bir adımı anlatır. İlk açılışta uygulamanın tek paragraflık tanıtımı da gösterilir. Aday bir metin alanına yazmaya başlayınca panel kendiliğinden küçülür.
2. **Küçük İngilizce karşılıklar:** menü, sekme, başlık ve ana düğmelerin altında italik İngilizce. Türkçe metin yerinde kalır.
3. **İngilizce vitrin vakası:** "Koru Distribution — Daily operations plan" (Türkçesi: Koru Dağıtım — Günlük operasyon planı) tamamen İngilizce açılır: belgeler, tablolar, görevler, ölçütler, referans çözüm, Word/Excel dosyaları, CSV'ler ve metin paketi.

Yazdırırken (PDF) panel ve karşılıklar görünmez.

## Dosyalar

| Dosya | Görevi |
| --- | --- |
| `web/en-tour.js` | Turun tamamı. `GLOSS` sözlüğü (Türkçe başlık → İngilizce karşılık), `GUIDE` (ekran → panel metni), vaka değişimi. |
| `web/cases/en/vardiya-darbogazi.json` | Vakanın İngilizce kaydı. Türkçe kayıtla **aynı yapıdadır**: aynı alanlar, aynı sayıda belge/satır/görev, aynı sayılar; yalnız metinler İngilizcedir. |
| `web/cases/en/vardiya-darbogazi-*` | İngilizce Word, Excel, CSV ve metin paketi (üretilmiş dosyalar). |
| `tools/build-en-showcase.py` | Bu dosyaları üretir. |
| `tests/check-en-showcase.mjs` | İngilizce kaydın Türkçe kayıtla aynı yapıda ve aynı sürümde olduğunu, dosyaların yerinde olduğunu, turun her sayfada yüklendiğini denetler. |

Tur betiği `web/index.html`, üç modül sayfası (`web/modules/zihin|mizac|rol/index.html`) ve canlı demo giriş sayfasında (`server/vitrin.mjs`) yüklenir. Kök adres `app/page.tsx` ile `/workspace.html`'e yönlenirken `?lang=en` korunur; sitedeki bağlantı bu yüzden kök adrese gidebilir.

## Nasıl çalışır? (kod rehberi)

**Açma/kapama.** Betik ilk satırlarda adresteki `?lang=` değerine bakar. `en` değilse ve daha önce de seçilmemişse hiçbir şey yapmadan çıkar; Türkçe kullanıcı için uygulamada tek bir değişiklik bile olmaz.

**Vaka değişimi.** Vakalar `content-loader.js` içindeki `CaseContent.load()` ile sonradan yüklenir. Tur bu fonksiyonu sarar: Türkçe katalog yüklendikten sonra `CASE_CATALOG` içindeki `vardiya-darbogazi` kaydının alanlarını İngilizce JSON'daki alanlarla değiştirir. Vaka ekranı (`case-ui.js`) hiçbir şey bilmeden İngilizce metni gösterir. Bu yüzden `en-tour.js`, `index.html`'de `content-loader.js`'den hemen sonra yüklenir.

**Karşılıklar.** `MutationObserver` sayfadaki değişiklikleri izler. Yeni çizilen her menü öğesi veya başlık `GLOSS` sözlüğünde varsa altına `<span class="aa-en-gloss">` eklenir ve öğe `data-aa-en` ile işaretlenir (iki kez eklenmesin diye).

**Yeni bir karşılık eklemek:** `GLOSS` içine `'Türkçe metin': 'English text'` satırı ekle. Anahtar, ekranda görünen metnin baştaki simge (◈, ◷ …) atılmış hâlidir.

**Yeni bir ekran açıklamak:** `GUIDE` içine rota adıyla (`#examples` → `examples`) `{ t: 'Başlık', p: 'Açıklama', try: 'Denenecek adım' }` ekle.

## Türkçe vaka değişirse

1. Türkçe vakayı her zamanki gibi güncelle (`npm run cases`).
2. `npm test` çalıştır. `check-en-showcase.mjs` sürüm veya yapı farkı görürse durur ve hangi alanın farklı olduğunu yazar.
3. İngilizce JSON'da aynı değişikliği yap, `version` alanını eşitle.
4. `python3 tools/build-en-showcase.py` çalıştır. Word ve Excel dosyalarında çevrilmeden kalan bir Türkçe metin görürse listeleyip hata verir; o metnin karşılığını betikteki `LABELS` sözlüğüne ekle.

## Bilinçli sınırlar

- Uygulamanın kendi metinleri (düğmeler, uyarılar, raporlar) Türkçe kalır; yalnız ana başlık ve menülerin altında karşılık vardır.
- İngilizce vaka yalnız tarayıcıdaki çalışmada kullanılır. Pilot teslimi (İK'ya dosya gönderme) sunucudaki Türkçe kataloğa göre çalışır.
- Vaka havuzu listesindeki kart başlığı Türkçe görünebilir; vaka açılınca İngilizcedir.
