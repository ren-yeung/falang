/* EnamelCraft i18n — lightweight client-side language switcher (dropdown).
   Mark translatable text with data-i18n="key"; add entries to DICT below.
   LANGS controls the dropdown menu; add/remove a language in one place. */
(function () {
  var LANGS = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ];
  var LANG_CODES = LANGS.map(function (l) { return l.code; });
  var LANG_MAP = {};
  LANGS.forEach(function (l) { LANG_MAP[l.code] = l; });
  // HTML lang attribute per code (zh needs zh-CN)
  var HTML_LANG = { zh: 'zh-CN' };

  var DICT = {
    'nav.home':    { en: 'Home',               zh: '首页',       es: 'Inicio',            fr: 'Accueil',         de: 'Start' },
    'nav.custom':  { en: 'Custom Pins',        zh: '定制徽章',    es: 'Pines a Medida',     fr: 'Pins Sur Mesure', de: 'Indiv. Pins' },
    'nav.how':     { en: 'How It Works',       zh: '制作流程',    es: 'Cómo Funciona',      fr: 'Notre Processus',de: 'Ablauf' },
    'nav.pricing': { en: 'Pricing',            zh: '价格',       es: 'Precios',           fr: 'Tarifs',          de: 'Preise' },
    'nav.gallery': { en: 'Gallery',            zh: '案例展示',    es: 'Galería',           fr: 'Galerie',         de: 'Galerie' },
    'nav.about':   { en: 'About',              zh: '关于我们',    es: 'Nosotros',          fr: 'À propos',        de: 'Über uns' },
    'nav.faq':     { en: 'FAQ',                zh: '常见问题',    es: 'FAQ',               fr: 'FAQ',             de: 'FAQ' },
    'nav.contact': { en: 'Contact',            zh: '联系我们',    es: 'Contacto',          fr: 'Contact',         de: 'Kontakt' },
    'cta.quote':   { en: 'Get a Free Quote',   zh: '免费获取报价', es: 'Solicitar Cotización', fr: 'Demander un Devis', de: 'Kostenloses Angebot' },
    // meta.* kept in en + zh only; other languages fall back to English via val()
    'meta.title':  { en: 'Custom Enamel Pins & Badges | EnamelCraft', zh: '定制珐琅徽章与胸针 | EnamelCraft' },
    'meta.desc':   {
      en: 'EnamelCraft makes custom hard & soft enamel pins, lapel pins, brooches and badges. Free artwork, low minimums, worldwide shipping.',
      zh: 'EnamelCraft 专业定制硬珐琅 / 软珐琅徽章、胸针与奖牌。免费设计、低起订量、全球发货。'
    }
  };

  var STORE_KEY = 'ec_lang';
  var DEFAULT = 'en';
  var box = null;

  function isValid(l) { return LANG_CODES.indexOf(l) !== -1; }
  function getLang() {
    var l = localStorage.getItem(STORE_KEY);
    return isValid(l) ? l : DEFAULT;
  }
  // value with English fallback so missing keys never blank out
  function val(key, lang) {
    var e = DICT[key];
    if (!e) return '';
    return e[lang] || e['en'] || '';
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var v = val(key, lang);
      if (v) el.textContent = v;
    });
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', val('meta.desc', lang));
    document.title = val('meta.title', lang) || document.title;
    document.documentElement.lang = HTML_LANG[lang] || lang;
    updateToggle(lang);
  }

  function setLang(lang) {
    if (!isValid(lang)) return;
    localStorage.setItem(STORE_KEY, lang);
    apply(lang);
  }

  function updateToggle(lang) {
    if (!box) return;
    var cur = box.querySelector('.lang-current');
    if (cur) cur.textContent = (LANG_MAP[lang] ? LANG_MAP[lang].code : lang).toUpperCase();
    box.querySelectorAll('.lang-menu li').forEach(function (li) {
      li.classList.toggle('active', li.getAttribute('data-lang') === lang);
    });
  }

  function buildDropdown() {
    box = document.getElementById('langDropdown');
    if (!box) return;
    var cur = getLang();
    var menu = LANGS.map(function (x) {
      return '<li role="menuitem" data-lang="' + x.code + '"><span class="ln">' + x.name +
             '</span><span class="lc">' + x.code.toUpperCase() + '</span></li>';
    }).join('');
    box.innerHTML =
      '<button type="button" class="lang-toggle" aria-haspopup="true" aria-expanded="false">' +
        '<span class="lang-current">' + (LANG_MAP[cur] ? LANG_MAP[cur].code : cur).toUpperCase() + '</span>' +
        '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</button>' +
      '<ul class="lang-menu" role="menu">' + menu + '</ul>';

    var toggle = box.querySelector('.lang-toggle');
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = box.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    box.querySelectorAll('.lang-menu li').forEach(function (li) {
      li.addEventListener('click', function () {
        setLang(li.getAttribute('data-lang'));
        box.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function closeOutside(e) {
    if (box && box.classList.contains('open') && !box.contains(e.target)) {
      box.classList.remove('open');
      var t = box.querySelector('.lang-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildDropdown();
    document.addEventListener('click', closeOutside);
    apply(getLang());
  });

  // helper for other scripts (e.g. site.js floating CTA)
  window.__i18n = {
    t: function (key) { return val(key, getLang()); },
    set: setLang,
    get: getLang
  };
})();
