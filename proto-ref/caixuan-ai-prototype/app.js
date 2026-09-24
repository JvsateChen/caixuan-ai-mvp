/* ============================================================
   采选AI平台 · 共享应用层
   mock数据 + API模拟 + 内联SVG图标 + 骨架屏/Toast工具
   ============================================================ */

/* ---- SVG图标库 (纯内联SVG, 无emoji) ---- */
const Icon = {
  logo: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18l-2 12H5L3 3z"/><path d="M3 3l1.5-2h15L21 3"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>`,
  search: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  send: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  bell: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  user: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  menu: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  refresh: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  chevronDown: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronRight: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  arrowDown: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
  arrowUp: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
  minus: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trendingDown: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8 14 1 7"/><polyline points="17 18 23 18 23 12"/></svg>`,
  trendingUp: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8 10 1 17"/><polyline points="17 6 23 6 23 12"/></svg>`,
  cart: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  star: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  tag: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  chartBar: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  chartLine: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>`,
  dashboard: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  settings: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  box: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  calendar: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  download: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  check: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alert: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  alertTriangle: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  target: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  camera: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  clipboard: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
  store: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 14h6"/></svg>`,
  shield: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  filter: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  shoppingBag: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  sparkles: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.91 5.09L19 10l-5.09 1.91L12 17l-1.91-5.09L5 10l5.09-1.91L12 3z"/><path d="M5 17l.7 2L8 20l-2.3.7L5 23l-.7-2.3L2 20l2.3-.7L5 17z"/></svg>`,
  zap: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  wallet: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>`,
  building: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 22v-4h6v4"/></svg>`,
  layers: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  package: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  truck: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  clock: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  fileText: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  pieChart: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  eye: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  edit: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  plus: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  heart: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  externalLink: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  arrowLeft: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  arrowRight: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  x: (s=20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

/* ---- Mock数据库 (模拟线上数据表) ---- */
const DB = {
  /* 商品表 */
  products: [
    { id: 'P001', name: 'Apple iPhone 15 Pro 256GB 钛金属', brand: 'Apple', spec: '256GB / 钛金属原色', category: '3C数码', image: 'phone',
      platforms: [
        { name: '拼多多', price: 7299, prevPrice: 7599, trend: 'down', delta: -300, url: '#' },
        { name: '京东', price: 7699, prevPrice: 7699, trend: 'flat', delta: 0, url: '#' },
        { name: '淘宝', price: 7499, prevPrice: 7399, trend: 'up', delta: 100, url: '#' },
      ], targetPrice: 7300, lowest: 7299, sparkline: [7899,7799,7699,7649,7599,7549,7499,7449,7399,7349,7299,7299,7299,7299,7399,7299,7299,7299,7299,7299,7399,7299,7299,7299,7299,7299,7299,7299,7299,7299] },
    { id: 'P002', name: '兰蔻小黑瓶精华 50ml', brand: '兰蔻', spec: '50ml / 精华修护', category: '美妆护肤', image: 'cosmetic',
      platforms: [
        { name: '淘宝', price: 1080, prevPrice: 1180, trend: 'down', delta: -100, url: '#' },
        { name: '京东', price: 1120, prevPrice: 1120, trend: 'flat', delta: 0, url: '#' },
        { name: '拼多多', price: 1050, prevPrice: 1100, trend: 'down', delta: -50, url: '#' },
      ], targetPrice: 1060, lowest: 1050, sparkline: [1280,1250,1220,1200,1180,1160,1140,1120,1100,1080,1060,1050,1050,1050,1060,1050,1050,1050,1050,1080,1050,1050,1050,1050,1050,1050,1050,1050,1050,1050] },
    { id: 'P003', name: 'Sony WH-1000XM5 降噪耳机', brand: 'Sony', spec: '头戴式 / 主动降噪', category: '3C数码', image: 'headphone',
      platforms: [
        { name: '京东', price: 1899, prevPrice: 1999, trend: 'down', delta: -100, url: '#' },
        { name: '淘宝', price: 1950, prevPrice: 1950, trend: 'flat', delta: 0, url: '#' },
        { name: '拼多多', price: 1850, prevPrice: 1920, trend: 'down', delta: -70, url: '#' },
      ], targetPrice: 1900, lowest: 1850, sparkline: [2299,2199,2099,2049,1999,1999,1950,1920,1899,1899,1850,1850,1850,1860,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850,1850] },
    { id: 'P004', name: '戴森Dyson V12无线吸尘器', brand: 'Dyson', spec: 'V12 / 无线手持', category: '日用百货', image: 'appliance',
      platforms: [
        { name: '拼多多', price: 3599, prevPrice: 3699, trend: 'down', delta: -100, url: '#' },
        { name: '京东', price: 3699, prevPrice: 3699, trend: 'flat', delta: 0, url: '#' },
        { name: '淘宝', price: 3650, prevPrice: 3550, trend: 'up', delta: 100, url: '#' },
      ], targetPrice: 3600, lowest: 3599, sparkline: [4299,4199,4099,3999,3899,3799,3699,3699,3650,3599,3599,3599,3599,3599,3650,3599,3599,3599,3599,3599,3599,3599,3599,3599,3599,3599,3599,3599,3599,3599] },
    { id: 'P005', name: 'SK-II神仙水 230ml', brand: 'SK-II', spec: '230ml / 精华水', category: '美妆护肤', image: 'cosmetic',
      platforms: [
        { name: '淘宝', price: 1590, prevPrice: 1690, trend: 'down', delta: -100, url: '#' },
        { name: '京东', price: 1650, prevPrice: 1650, trend: 'flat', delta: 0, url: '#' },
        { name: '拼多多', price: 1550, prevPrice: 1620, trend: 'down', delta: -70, url: '#' },
      ], targetPrice: 1560, lowest: 1550, sparkline: [1890,1850,1790,1750,1690,1690,1650,1620,1590,1560,1550,1550,1550,1560,1550,1550,1550,1550,1550,1550,1550,1550,1550,1550,1550,1550,1550,1550,1550,1550] },
    { id: 'P006', name: '小米14 Pro 16GB+512GB', brand: '小米', spec: '16GB+512GB / 黑色', category: '3C数码', image: 'phone',
      platforms: [
        { name: '拼多多', price: 4499, prevPrice: 4799, trend: 'down', delta: -300, url: '#' },
        { name: '京东', price: 4699, prevPrice: 4699, trend: 'flat', delta: 0, url: '#' },
        { name: '淘宝', price: 4599, prevPrice: 4499, trend: 'up', delta: 100, url: '#' },
      ], targetPrice: 4500, lowest: 4499, sparkline: [5299,5199,5099,4999,4899,4799,4699,4699,4599,4499,4499,4499,4599,4499,4499,4499,4499,4499,4499,4499,4499,4499,4499,4499,4499,4499,4499,4499,4499,4499] },
  ],

  /* 监控目标表 */
  monitoringTargets: [
    { id: 'M01', productId: 'P001', productName: 'Apple iPhone 15 Pro 256GB', targetPrice: 7300, currentPrice: 7299, platform: '拼多多', status: 'achieved', createdAt: '2026-08-15', trend: 'down' },
    { id: 'M02', productId: 'P002', productName: '兰蔻小黑瓶精华 50ml', targetPrice: 1060, currentPrice: 1050, platform: '拼多多', status: 'achieved', createdAt: '2026-08-20', trend: 'down' },
    { id: 'M03', productId: 'P003', productName: 'Sony WH-1000XM5', targetPrice: 1800, currentPrice: 1850, platform: '拼多多', status: 'monitoring', createdAt: '2026-08-25', trend: 'down' },
    { id: 'M04', productId: 'P004', productName: '戴森Dyson V12', targetPrice: 3500, currentPrice: 3599, platform: '拼多多', status: 'monitoring', createdAt: '2026-09-01', trend: 'down' },
    { id: 'M05', productId: 'P005', productName: 'SK-II神仙水 230ml', targetPrice: 1500, currentPrice: 1550, platform: '拼多多', status: 'monitoring', createdAt: '2026-09-03', trend: 'down' },
    { id: 'M06', productId: 'P006', productName: '小米14 Pro 512GB', targetPrice: 4400, currentPrice: 4499, platform: '拼多多', status: 'monitoring', createdAt: '2026-09-05', trend: 'down' },
  ],

  /* 价格快照表 */
  priceSnapshots: [
    { id: 'S01', productId: 'P001', productName: 'iPhone 15 Pro 256GB', platform: '拼多多', price: 7299, prevPrice: 7599, change: -300, trend: 'down', snapshotAt: '2026-09-09 08:00' },
    { id: 'S02', productId: 'P002', productName: '兰蔻小黑瓶精华', platform: '拼多多', price: 1050, prevPrice: 1100, change: -50, trend: 'down', snapshotAt: '2026-09-09 08:00' },
    { id: 'S03', productId: 'P003', productName: 'Sony WH-1000XM5', platform: '京东', price: 1899, prevPrice: 1999, change: -100, trend: 'down', snapshotAt: '2026-09-09 08:00' },
    { id: 'S04', productId: 'P001', productName: 'iPhone 15 Pro 256GB', platform: '淘宝', price: 7499, prevPrice: 7399, change: 100, trend: 'up', snapshotAt: '2026-09-09 04:00' },
    { id: 'S05', productId: 'P004', productName: '戴森Dyson V12', platform: '拼多多', price: 3599, prevPrice: 3699, change: -100, trend: 'down', snapshotAt: '2026-09-09 04:00' },
    { id: 'S06', productId: 'P005', productName: 'SK-II神仙水', platform: '拼多多', price: 1550, prevPrice: 1620, change: -70, trend: 'down', snapshotAt: '2026-09-09 04:00' },
    { id: 'S07', productId: 'P006', productName: '小米14 Pro', platform: '淘宝', price: 4599, prevPrice: 4499, change: 100, trend: 'up', snapshotAt: '2026-09-08 22:00' },
    { id: 'S08', productId: 'P003', productName: 'Sony WH-1000XM5', platform: '拼多多', price: 1850, prevPrice: 1920, change: -70, trend: 'down', snapshotAt: '2026-09-08 22:00' },
  ],

  /* 采购记录表 */
  purchaseRecords: [
    { id: 'PR01', productId: 'P002', productName: '兰蔻小黑瓶精华 50ml', platform: '拼多多', price: 1050, qty: 1, total: 1050, status: 'completed', orderDate: '2026-09-08', commission: 31.5 },
    { id: 'PR02', productId: 'P001', productName: 'Apple iPhone 15 Pro 256GB', platform: '拼多多', price: 7299, qty: 1, total: 7299, status: 'completed', orderDate: '2026-09-06', commission: 218.97 },
    { id: 'PR03', productId: 'P003', productName: 'Sony WH-1000XM5', platform: '京东', price: 1899, qty: 1, total: 1899, status: 'completed', orderDate: '2026-09-03', commission: 56.97 },
    { id: 'PR04', productId: 'P004', productName: '戴森Dyson V12吸尘器', platform: '淘宝', price: 3650, qty: 1, total: 3650, status: 'completed', orderDate: '2026-08-28', commission: 109.5 },
    { id: 'PR05', productId: 'P006', productName: '小米14 Pro 512GB', platform: '京东', price: 4699, qty: 2, total: 9398, status: 'pending', orderDate: '2026-09-09', commission: 281.94 },
  ],

  /* 报复盘表 */
  weeklyReview: {
    weekRange: '2026-09-02 ~ 2026-09-08',
    totalSavings: 2847,
    itemsCompared: 23,
    ordersPlaced: 5,
    commissionEarned: 698.88,
    bestDeals: [
      { productId: 'P001', name: 'iPhone 15 Pro 256GB', platform: '拼多多', saved: 300, originalPrice: 7599, finalPrice: 7299 },
      { productId: 'P002', name: '兰蔻小黑瓶精华', platform: '拼多多', saved: 100, originalPrice: 1180, finalPrice: 1050 },
      { productId: 'P003', name: 'Sony WH-1000XM5', platform: '京东', saved: 100, originalPrice: 1999, finalPrice: 1899 },
    ],
    trend: 'up',
    savingsChange: 12.5,
  },

  /* 企业采购数据 */
  enterpriseOrders: [
    { id: 'EO-2026-001', title: '办公笔记本批量采购', supplier: '京东企业购', items: 15, total: 112485, status: 'approved', date: '2026-09-05', buyer: '张明' },
    { id: 'EO-2026-002', title: '年会礼品-蓝牙耳机', supplier: '拼多多企业版', items: 50, total: 92500, status: 'pending', date: '2026-09-07', buyer: '李芳' },
    { id: 'EO-2026-003', title: '茶水间日用物资', supplier: '淘宝企业版', items: 8, total: 4680, status: 'completed', date: '2026-09-02', buyer: '王刚' },
    { id: 'EO-2026-004', title: 'IT机房UPS电源', supplier: '京东企业购', items: 3, total: 23997, status: 'completed', date: '2026-08-28', buyer: '张明' },
    { id: 'EO-2026-005', title: '市场部拍摄器材', supplier: '淘宝企业版', items: 5, total: 32450, status: 'approved', date: '2026-09-06', buyer: '陈露' },
  ],

  enterpriseStats: {
    monthlySpend: 268112,
    monthlyOrders: 12,
    avgDiscount: 8.5,
    suppliers: 3,
    spendByCategory: [
      { name: 'IT设备', value: 136482, pct: 50.9 },
      { name: '办公用品', value: 46800, pct: 17.5 },
      { name: '礼品福利', value: 92500, pct: 34.5 },
      { name: '其他', value: 4310, pct: 1.6 },
    ],
    supplierCompare: [
      { name: '京东企业购', orders: 4, total: 136482, avgTime: 2.5, rating: 4.8 },
      { name: '拼多多企业版', orders: 3, total: 92500, avgTime: 3.2, rating: 4.5 },
      { name: '淘宝企业版', items: 2, total: 37130, avgTime: 4.1, rating: 4.3 },
    ],
  },

  /* 热门搜索 */
  popularSearches: ['iPhone 15 Pro 比价', '兰蔻小黑瓶精华', 'Sony降噪耳机', '戴森吸尘器', 'SK-II神仙水', '小米14 Pro'],
};

/* ---- API模拟层 (模拟真实API调用, 含延迟/失败/重试) ---- */
const API = {
  _simulate(data, opts = {}) {
    const delay = opts.delay || (500 + Math.random() * 600);
    const failRate = opts.failRate !== undefined ? opts.failRate : 0.12;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < failRate) {
          reject({ code: 500, message: '网络请求失败，请检查网络后重试' });
        } else {
          resolve(JSON.parse(JSON.stringify(data)));
        }
      }, delay);
    });
  },

  /* AI对话 - 解析用户输入 */
  aiChat(query) {
    const matched = DB.products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      query.includes(p.brand)
    );
    const results = matched.length > 0 ? matched : DB.products.slice(0, 3);
    return this._simulate({
      query,
      parsed: { brand: '', model: '', category: '' },
      results,
      total: results.length,
    }, { delay: 800 + Math.random() * 500, failRate: 0.08 });
  },

  /* 商品列表 */
  getProducts() {
    return this._simulate(DB.products, { failRate: 0.1 });
  },

  /* 商品详情 */
  getProductDetail(id) {
    const product = DB.products.find(p => p.id === id) || DB.products[0];
    return this._simulate(product, { delay: 600, failRate: 0.1 });
  },

  /* 价格历史 */
  getPriceHistory(productId) {
    const product = DB.products.find(p => p.id === productId) || DB.products[0];
    const dates = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(`${d.getMonth()+1}/${d.getDate()}`);
    }
    return this._simulate({
      dates,
      platforms: [
        { name: '拼多多', color: '#e02130', data: product.sparkline },
        { name: '京东', color: '#1677ff', data: product.sparkline.map(v => v + Math.round(Math.random() * 200 - 100)) },
        { name: '淘宝', color: '#ff6a00', data: product.sparkline.map(v => v + Math.round(Math.random() * 300 - 150)) },
      ],
      stats: {
        highest: Math.max(...product.sparkline),
        lowest: Math.min(...product.sparkline),
        avg: Math.round(product.sparkline.reduce((a,b) => a+b, 0) / product.sparkline.length),
        current: product.lowest,
      },
    }, { delay: 700, failRate: 0.1 });
  },

  /* 监控目标 */
  getMonitoringTargets() {
    return this._simulate(DB.monitoringTargets, { failRate: 0.1 });
  },

  /* 价格快照 */
  getPriceSnapshots() {
    return this._simulate(DB.priceSnapshots, { failRate: 0.1 });
  },

  /* 采购记录 */
  getPurchaseRecords() {
    return this._simulate(DB.purchaseRecords, { failRate: 0.1 });
  },

  /* 周报复盘 */
  getWeeklyReview() {
    return this._simulate(DB.weeklyReview, { delay: 800, failRate: 0.1 });
  },

  /* 企业订单 */
  getEnterpriseOrders() {
    return this._simulate(DB.enterpriseOrders, { failRate: 0.1 });
  },

  /* 企业统计 */
  getEnterpriseStats() {
    return this._simulate(DB.enterpriseStats, { delay: 800, failRate: 0.1 });
  },

  /* 设置价格预警 (写入操作) */
  setPriceAlert(productId, targetPrice) {
    return this._simulate({ success: true, id: 'ALERT-' + Date.now() }, { delay: 400, failRate: 0.15 });
  },
};

/* ---- 工具函数 ---- */
const Utils = {
  /* 格式化价格 */
  formatPrice(val) {
    return '¥' + val.toLocaleString('zh-CN');
  },

  /* 价格趋势图标 */
  trendIcon(trend, size = 14) {
    if (trend === 'down') return Icon.arrowDown(size);
    if (trend === 'up') return Icon.arrowUp(size);
    return Icon.minus(size);
  },

  /* 趋势文本 */
  trendText(trend) {
    if (trend === 'down') return '降价';
    if (trend === 'up') return '涨价';
    return '持平';
  },

  /* 趋势CSS类 */
  trendClass(trend) {
    if (trend === 'down') return 'down';
    if (trend === 'up') return 'up';
    return 'flat';
  },

  /* 生成骨架屏HTML */
  skeletonText(lines = 3, widths = ['w-80', 'w-60', 'w-40']) {
    return Array.from({ length: lines }, (_, i) =>
      `<div class="skeleton skeleton-text ${widths[i] || 'w-60'}"></div>`
    ).join('');
  },

  skeletonCard() {
    return `<div class="skeleton skeleton-card">
      <div class="skeleton skeleton-block"></div>
      <div class="skeleton skeleton-text w-60"></div>
      <div class="skeleton skeleton-text w-40"></div>
    </div>`;
  },

  skeletonRow(count = 5) {
    return Array.from({ length: count }, () =>
      `<div class="skeleton-row">
        <div class="skeleton skeleton-circle"></div>
        <div style="flex:1">
          <div class="skeleton skeleton-text w-80"></div>
          <div class="skeleton skeleton-text w-40"></div>
        </div>
      </div>`
    ).join('');
  },

  skeletonStatCards(count = 4) {
    return Array.from({ length: count }, () =>
      `<div class="stat-card">
        <div class="skeleton skeleton-circle"></div>
        <div class="skeleton skeleton-text w-30" style="height:28px"></div>
        <div class="skeleton skeleton-text w-60"></div>
      </div>`
    ).join('');
  },

  /* 迷你折线图 (内联SVG) */
  sparkline(data, width = 80, height = 24, color = '#4f46e5') {
    if (!data || data.length === 0) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,${height} ${points} ${width},${height}`;
    return `<svg class="sparkline" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <polygon points="${areaPoints}" fill="${color}" opacity="0.1"/>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
  },

  /* 价格历史折线图 (大图, 内联SVG) */
  priceChart(dates, platforms, width = 720, height = 280) {
    const pad = { top: 20, right: 80, bottom: 30, left: 50 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;
    const allData = platforms.flatMap(p => p.data);
    const min = Math.min(...allData);
    const max = Math.max(...allData);
    const range = max - min || 1;
    const step = w / (dates.length - 1);

    const xScale = i => pad.left + i * step;
    const yScale = v => pad.top + h - ((v - min) / range) * h;

    // Y轴刻度
    const yTicks = 5;
    let yAxis = '';
    for (let i = 0; i <= yTicks; i++) {
      const val = min + (range / yTicks) * (yTicks - i);
      const y = pad.top + (h / yTicks) * i;
      yAxis += `<line x1="${pad.left}" y1="${y}" x2="${pad.left + w}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,3"/>`;
      yAxis += `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8" font-family="monospace">¥${val.toFixed(0)}</text>`;
    }

    // X轴标签 (每5个显示一次)
    let xAxis = '';
    dates.forEach((d, i) => {
      if (i % 5 === 0 || i === dates.length - 1) {
        const x = xScale(i);
        xAxis += `<text x="${x}" y="${pad.top + h + 18}" text-anchor="middle" font-size="10" fill="#94a3b8">${d}</text>`;
      }
    });

    // 平台折线
    let lines = '';
    platforms.forEach(p => {
      const pts = p.data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
      lines += `<polyline points="${pts}" fill="none" stroke="${p.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      // 末端圆点
      const lastIdx = p.data.length - 1;
      lines += `<circle cx="${xScale(lastIdx)}" cy="${yScale(p.data[lastIdx])}" r="3" fill="${p.color}"/>`;
    });

    return `<svg width="100%" viewBox="0 0 ${width} ${height}" style="max-height:${height}px">
      ${yAxis}${xAxis}${lines}
    </svg>`;
  },

  /* 柱状图 (企业采购分类) */
  barChart(data, width = 360, height = 160) {
    const barH = 28;
    const gap = 10;
    const labelW = 70;
    const valW = 80;
    const totalH = data.length * (barH + gap) + 10;
    const maxVal = Math.max(...data.map(d => d.value));
    const barMaxW = width - labelW - valW - 20;

    let bars = '';
    const colors = ['#4f46e5', '#6366f1', '#0ea5e9', '#06b6d4'];
    data.forEach((d, i) => {
      const barW = (d.value / maxVal) * barMaxW;
      const y = i * (barH + gap) + 5;
      bars += `<text x="0" y="${y + barH/2 + 4}" font-size="11" fill="#64748b">${d.name}</text>`;
      bars += `<rect x="${labelW}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${colors[i % colors.length]}"/>`;
      bars += `<text x="${labelW + barW + 8}" y="${y + barH/2 + 4}" font-size="11" fill="#334155" font-weight="600">¥${(d.value/10000).toFixed(1)}万</text>`;
    });

    return `<svg width="100%" viewBox="0 0 ${width} ${totalH}" style="max-height:${totalH}px">${bars}</svg>`;
  },
};

/* ---- Toast通知系统 ---- */
const Toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show({ type = 'info', title = '提示', message = '', duration = 4000, retryFn = null }) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconMap = { error: 'alertTriangle', success: 'checkCircle', warning: 'alert', info: 'bell' };
    const icon = Icon[iconMap[type] || 'bell'](18);
    toast.innerHTML = `
      <span style="color: var(--${type === 'info' ? 'info' : type}); flex-shrink:0; margin-top:1px">${icon}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
        ${retryFn ? `<div class="toast-retry" data-retry="1">${Icon.refresh(14)} 重试</div>` : ''}
      </div>
      <span class="toast-close">${Icon.close(16)}</span>
    `;
    this.container.appendChild(toast);

    const remove = () => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    };
    toast.querySelector('.toast-close').addEventListener('click', remove);
    if (retryFn) {
      toast.querySelector('.toast-retry').addEventListener('click', () => { remove(); retryFn(); });
    }
    if (duration > 0) setTimeout(remove, duration);
  },
  error(title, message, retryFn) { this.show({ type: 'error', title, message, duration: 6000, retryFn }); },
  success(title, message) { this.show({ type: 'success', title, message, duration: 3000 }); },
  warning(title, message) { this.show({ type: 'warning', title, message, duration: 4000 }); },
  info(title, message) { this.show({ type: 'info', title, message, duration: 3000 }); },
};

/* ---- 数据加载辅助 (骨架屏 → API → 渲染 → 错误Toast+重试) ---- */
async function loadData(container, apiFn, renderFn, opts = {}) {
  if (opts.skeleton) {
    container.innerHTML = opts.skeleton;
  }
  try {
    const data = await apiFn();
    renderFn(data, container);
  } catch (err) {
    container.innerHTML = opts.errorHtml || `<div class="empty-state">${Icon.alertTriangle(32)}<p>加载失败</p></div>`;
    Toast.error('加载失败', err.message || '数据获取异常', () => loadData(container, apiFn, renderFn, opts));
  }
}

/* ---- 平台颜色 ---- */
const PLATFORM_COLORS = {
  '拼多多': '#e02130',
  '京东': '#1677ff',
  '淘宝': '#ff6a00',
};

/* ---- 商品图片 (网络图片) ---- */
const PRODUCT_IMAGES = {
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
  cosmetic: 'https://images.unsplash.com/photo-1620916566398-39f7f9a93c1c?w=400&h=400&fit=crop',
  headphone: 'https://images.unsplash.com/photo-1505740420928-8f3a9a4d0a1c?w=400&h=400&fit=crop',
  appliance: 'https://images.unsplash.com/photo-1558317374-067fb5f29001?w=400&h=400&fit=crop',
};
function productPlaceholder(type = 'phone', size = 120) {
  const url = PRODUCT_IMAGES[type] || PRODUCT_IMAGES.phone;
  return `<img src="${url}" alt="商品图片" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${type}/400/400';" />`;
}
