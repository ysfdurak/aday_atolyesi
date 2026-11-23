// Anonim kullanım ölçümü ve geri bildirim (ortak servis: olcum.ysfdurak.com; kaynak: ysfdurak.com → sunucu/olcum).
// Yalnız resmî demo adresinde yüklenir: kendi sunucusuna ya da şirket içine kurulan kopyalar dışarıya hiç istek atmaz.
// Gönderilenler: ekran adı (# sonrasının ilk parçası: home, plan, cases…), aktif süre, cihaz türü, dil.
// Vaka cevapları, CV, dosyalar, ad, e-posta ve IP gönderilmez; çerez yok; DNT/GPC'ye uyar.
// Geri bildirim, kenar menüsündeki ve sayfa altındaki "Geri bildirim ver" bağlantısından açılır;
// servis yüklenmezse bağlantı görünmez (html[data-olcum] yoksa CSS gizler).
(function () {
  if (location.hostname !== 'aday.ysfdurak.com') return;
  var ekranAdi = function () {
    return (location.hash.slice(1) || 'home').split('/')[0].replace(/[^a-z0-9-]/gi, '') || 'home';
  };
  var kuyruk = (window.olcumKuyruk = window.olcumKuyruk || []);
  var son = '';
  var bildir = function () {
    var ad = ekranAdi();
    if (ad === son) return;
    son = ad;
    (window.olcumKuyruk || kuyruk).push(['ekran', ad]);
  };
  bildir();
  addEventListener('hashchange', bildir);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-geri-bildirim]');
    if (!a || !window.olcum) return;
    e.preventDefault();
    window.olcum.geriBildirimAc(e);
  });
  var s = document.createElement('script');
  s.src = 'https://olcum.ysfdurak.com/olcum.js';
  s.defer = true;
  s.dataset.proje = 'aday';
  s.dataset.dugme = 'yok';
  s.dataset.renk = '#163d37';
  s.onload = function () {
    if (window.olcum) document.documentElement.setAttribute('data-olcum', '');
  };
  document.head.appendChild(s);
})();
