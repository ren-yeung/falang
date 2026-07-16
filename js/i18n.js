/* EnamelCraft i18n — lightweight client-side language switcher.
   Mark translatable text with data-i18n="key"; add entries to DICT below. */
(function () {
  var DICT = {
    'nav.home':    { en: 'Home',           zh: '首页' },
    'nav.custom':  { en: 'Custom Pins',    zh: '定制徽章' },
    'nav.how':     { en: 'How It Works',   zh: '制作流程' },
    'nav.pricing': { en: 'Pricing',        zh: '价格' },
    'nav.gallery': { en: 'Gallery',        zh: '案例展示' },
    'nav.about':   { en: 'About',          zh: '关于我们' },
    'nav.faq':     { en: 'FAQ',            zh: '常见问题' },
    'nav.contact': { en: 'Contact',        zh: '联系我们' },
    'cta.quote':   { en: 'Get a Free Quote', zh: '免费获取报价' },
    'meta.title':  {
      en: 'Custom Enamel Pins & Badges | EnamelCraft',
      zh: '定制珐琅徽章与胸针 | EnamelCraft'
    },
    'meta.desc':   {
      en: 'EnamelCraft makes custom hard & soft enamel pins, lapel pins, brooches and badges. Free artwork, low minimums, worldwide shipping.',
      zh: 'EnamelCraft 专业定制硬珐琅 / 软珐琅徽章、胸针与奖牌。免费设计、低起订量、全球发货。'
    }
  };

  var STORE_KEY = 'ec_lang';
  var DEFAULT = 'en';

  function getLang() {
    var l = localStorage.getItem(STORE_KEY);
    return (l === 'en' || l === 'zh') ? l : DEFAULT;
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (DICT[key] && DICT[key][lang] != null) {
        el.textContent = DICT[key][lang];
      }
    });
    var meta = document.querySelector('meta[name="description"]');
    if (meta && DICT['meta.desc']) meta.setAttribute('content', DICT['meta.desc'][lang]);
    if (DICT['meta.title']) document.title = DICT['meta.title'][lang];
    document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : 'en';
    document.querySelectorAll('.lang-opt').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  function setLang(lang) {
    localStorage.setItem(STORE_KEY, lang);
    apply(lang);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var lang = getLang();
    apply(lang);
    document.querySelectorAll('.lang-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });
  });

  // expose a helper for other scripts (e.g. site.js floating CTA)
  window.__i18n = { t: function (key) { return (DICT[key] && DICT[key][getLang()]) || key; } };
})();
