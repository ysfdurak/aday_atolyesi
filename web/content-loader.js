(function (root) {
  'use strict';
  let pending = null,
    ready = false;
  function script(path) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      // Alt klasörde yayında (ör. GitHub Pages) yolu yayın köküne göre çöz.
      el.src = root.AA_URL ? root.AA_URL(path) : path;
      el.onload = resolve;
      el.onerror = () => {
        el.remove();
        reject(Error('Vaka belgeleri yüklenemedi. Bağlantını kontrol edip tekrar dene.'));
      };
      document.body.appendChild(el);
    });
  }
  function load() {
    if (ready) return Promise.resolve();
    if (pending) return pending;
    pending = (async () => {
      await script('/case-archive-v1.js');
      await script('/case-data.js');
      ready = true;
    })().finally(() => {
      pending = null;
    });
    return pending;
  }
  let feedbackPending = null,
    feedbackReady = false;
  function loadFeedback() {
    if (feedbackReady) return Promise.resolve();
    if (feedbackPending) return feedbackPending;
    feedbackPending = script('/response-data.js')
      .then(() => {
        feedbackReady = true;
      })
      .finally(() => {
        feedbackPending = null;
      });
    return feedbackPending;
  }
  root.ResponseContent = { load: loadFeedback, ready: () => feedbackReady };
  root.CaseContent = { load, ready: () => ready };
})(window);
