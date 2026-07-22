(function () {
  var locales = ['zh', 'es', 'fr', 'de'];

  var pathLocale = window.location.pathname.match(/^\/(en|zh|es|fr|de)(?:\/|$)/);
  try { localStorage.setItem('ec_lang', pathLocale ? pathLocale[1] : 'en'); } catch (_) {}

  function pagePath() {
    var path = window.location.pathname.replace(/\/$/, '');
    var match = path.match(/^\/(en|zh|es|fr|de)(\/.*)?$/);
    return match ? (match[2] || '/') : (path || '/');
  }

  function targetUrl(locale) {
    var page = pagePath();
    return locale === 'en' ? (page === '/' ? '/' : page) : '/' + locale + (page === '/' ? '/' : page);
  }

  document.addEventListener('click', function (event) {
    var item = event.target.closest && event.target.closest('[data-lang]');
    if (!item) return;
    var locale = item.getAttribute('data-lang');
    if (locale !== 'en' && locales.indexOf(locale) === -1) return;
    event.preventDefault();
    try { localStorage.setItem('ec_lang', locale); } catch (_) {}
    window.location.href = targetUrl(locale);
  });
})();
