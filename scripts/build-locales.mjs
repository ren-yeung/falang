import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = ['index', 'custom-enamel-pins', 'how-it-works', 'pricing', 'gallery', 'about', 'faq', 'contact'];
const locales = {
  zh: { html: 'zh-CN', label: '中文', titles: {
    index: '定制珐琅徽章制造商 | EnamelCraft', 'custom-enamel-pins': '定制硬珐琅与软珐琅徽章 | EnamelCraft', 'how-it-works': '定制珐琅徽章制作流程 | EnamelCraft', pricing: '定制珐琅徽章价格与起订量 | EnamelCraft', gallery: '定制珐琅徽章案例 | EnamelCraft', about: '珐琅徽章制造商与生产伙伴 | EnamelCraft', faq: '定制珐琅徽章常见问题 | EnamelCraft', contact: '定制珐琅徽章免费报价 | EnamelCraft' } },
  es: { html: 'es', label: 'Español', titles: {
    index: 'Fabricante de Pines de Esmalte Personalizados | EnamelCraft', 'custom-enamel-pins': 'Pines de Esmalte Duro y Suave Personalizados | EnamelCraft', 'how-it-works': 'Cómo se Fabrican los Pines de Esmalte | EnamelCraft', pricing: 'Precios y MOQ de Pines de Esmalte | EnamelCraft', gallery: 'Portafolio de Pines de Esmalte Personalizados | EnamelCraft', about: 'Fabricante y Socio de Producción de Pines | EnamelCraft', faq: 'Preguntas sobre Pines de Esmalte Personalizados | EnamelCraft', contact: 'Cotización Gratis de Pines de Esmalte | EnamelCraft' } },
  fr: { html: 'fr', label: 'Français', titles: {
    index: 'Fabricant d’Épingles en Émail Personnalisées | EnamelCraft', 'custom-enamel-pins': 'Épingles en Émail Dur et Tendre Personnalisées | EnamelCraft', 'how-it-works': 'Fabrication des Épingles en Émail | EnamelCraft', pricing: 'Prix et MOQ des Épingles en Émail | EnamelCraft', gallery: 'Portfolio d’Épingles en Émail Personnalisées | EnamelCraft', about: 'Fabricant et Partenaire de Production | EnamelCraft', faq: 'FAQ sur les Épingles en Émail Personnalisées | EnamelCraft', contact: 'Devis Gratuit d’Épingles en Émail | EnamelCraft' } },
  de: { html: 'de', label: 'Deutsch', titles: {
    index: 'Hersteller für individuelle Emaille-Pins | EnamelCraft', 'custom-enamel-pins': 'Individuelle Hart- und Weichemail-Pins | EnamelCraft', 'how-it-works': 'So werden Emaille-Pins hergestellt | EnamelCraft', pricing: 'Preise und MOQ für Emaille-Pins | EnamelCraft', gallery: 'Portfolio individueller Emaille-Pins | EnamelCraft', about: 'Emaille-Pin-Hersteller und Produktionspartner | EnamelCraft', faq: 'FAQ zu individuellen Emaille-Pins | EnamelCraft', contact: 'Kostenloses Angebot für Emaille-Pins | EnamelCraft' } }
};

const pagePath = page => page === 'index' ? '/' : `/${page}`;
const fileName = page => page === 'index' ? 'index.html' : `${page}.html`;
const sourcePath = page => path.join(root, fileName(page));

for (const [locale, config] of Object.entries(locales)) {
  for (const page of pages) {
    const targetDir = path.join(root, locale, page === 'index' ? '' : '');
    fs.mkdirSync(targetDir, { recursive: true });
    let html = fs.readFileSync(sourcePath(page), 'utf8');
    const currentUrl = `https://seektrace.ccwu.cc/${locale}${pagePath(page)}`;
    const englishUrl = `https://seektrace.ccwu.cc${pagePath(page)}`;
    html = html.replace(/<html lang="[^"]+">/, `<html lang="${config.html}">`);
    html = html.replace(/<title[^>]*>.*?<\/title>/s, `<title>${config.titles[page]}</title>`);
    html = html.replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${currentUrl}">`);
    html = html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]+">/, '');
    const alternates = [
      `<link rel="alternate" hreflang="en" href="${englishUrl}">`,
      ...Object.keys(locales).map(code => `<link rel="alternate" hreflang="${code === 'zh' ? 'zh-CN' : code}" href="https://seektrace.ccwu.cc/${code}${pagePath(page)}">`),
      `<link rel="alternate" hreflang="x-default" href="${englishUrl}">`
    ].join('\n  ');
    html = html.replace('</head>', `  ${alternates}\n</head>`);
    html = html.replace(/https:\/\/seektrace\.ccwu\.cc\/(about|contact|custom-enamel-pins|faq|gallery|how-it-works|pricing)(\.html)?/g, (_, p) => `https://seektrace.ccwu.cc/${locale}/${p}`);
    html = html.replace(/href="\/(about|contact|custom-enamel-pins|faq|gallery|how-it-works|pricing)"/g, (_, p) => `href="/${locale}/${p}"`);
    html = html.replace(/href="\/"/g, `href="/${locale}/"`);
    html = html.replace('<script src="js/i18n.js"></script>', `<script>localStorage.setItem('ec_lang','${locale}');</script>\n  <script src="/js/i18n.js"></script>`);
    html = html.replace('</body>', `<script>document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('#langDropdown li[data-lang]').forEach(li=>{const a=document.createElement('a');a.href='/' + li.dataset.lang + window.location.pathname.replace(/^\\/(?:zh|es|fr|de)/,'');a.className='lang-link';a.innerHTML=li.innerHTML;li.replaceWith(a);}));</script>\n</body>`);
    fs.writeFileSync(path.join(targetDir, fileName(page)), html);
  }
}

console.log(`Generated ${Object.keys(locales).length * pages.length} localized pages.`);
