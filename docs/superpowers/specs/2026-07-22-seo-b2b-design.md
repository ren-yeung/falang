# EnamelCraft 英文全球 B2B SEO 优化设计

## 目标

面向英文全球客户，提升网站在定制珐琅徽章、珐琅胸针、批量制造和免费报价相关搜索中的相关性与转化能力。保留现有静态站点架构、品牌和视觉布局，不进行大规模 UI 重构。

## 范围

第一阶段覆盖 8 个现有页面：主页、产品页、流程页、价格页、作品集、关于页、FAQ 和联系页，以及 `robots.txt`、`sitemap.xml` 和公共 SEO 元数据。

## 页面定位

每个页面设置独立的搜索意图、title、meta description、H1 和内部链接主题：

- 首页：custom enamel pins manufacturer / bulk custom pins
- 产品页：hard enamel pins、soft enamel pins、lapel pins、custom badges
- 流程页：how custom enamel pins are made
- 价格页：custom enamel pin pricing、MOQ、bulk discounts
- 作品集：custom enamel pin portfolio / examples
- 关于页：enamel pin manufacturer / production partner
- FAQ：custom enamel pins FAQ、files、MOQ、shipping、turnaround
- 联系页：custom enamel pin quote / free design proof

## 技术改动

1. 修复首页与产品页重复的 title。
2. 为所有页面补充或校正 canonical、Open Graph、Twitter Card 和页面语言信号。
3. 根据页面类型补充 JSON-LD：`Organization`、`WebSite`、`WebPage`、`BreadcrumbList`、`Product`、`FAQPage`、`ContactPage`；不添加无法验证的评分或虚假评论结构化数据。
4. 保持 sitemap 中的规范 URL，与页面 canonical 完全一致，并补充真实 `lastmod`。
5. 检查静态资源、favicon、OG 图片和 HTTPS 下的绝对 URL。
6. 保留 Cloudflare 托管；不在代码中引入 Cloudflare Token 或其他凭据。

## 内容改动

在不改变页面布局的前提下，强化可验证的 B2B 价值信息：free artwork and proof、MOQ from 100 pieces、7–12 day production、worldwide shipping、bulk pricing、quality guarantee。避免关键词堆砌和无法证明的行业排名、客户数量或认证声明。

## 多语言策略

第一阶段不重构多语言 URL。保留现有语言切换功能，并避免虚假的 hreflang 集合。独立 `/zh/`、`/es/`、`/fr/`、`/de/` 页面及完整互链 hreflang 作为第二阶段项目。

## 验证

- 检查 8 个页面均返回 200，title、description、H1、canonical 唯一且有效。
- 校验 sitemap XML、robots.txt 和 JSON-LD 格式。
- 扫描内部链接、图片 alt、占位社交链接和重复 SEO 元数据。
- 使用 Git diff 检查仅修改本设计范围内的文件。
- 本地静态预览后，再由用户确认推送到 GitHub 和 Cloudflare 部署。

## 不在本阶段范围内

- Search Console 或 Analytics 数据分析
- Core Web Vitals 的真实用户数据优化
- 大规模多语言翻译和 URL 重构
- 外链建设、付费工具配置和域名迁移
- 自动推送生产环境
