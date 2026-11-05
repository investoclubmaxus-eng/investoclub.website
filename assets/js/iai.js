/* InvestoAI chat — the homepage widget, shared by /projects/ and every project page.
   Answers come from on-page data; enquiries hand off to WhatsApp. Set window.IC_BASE first. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = t => 'https://wa.me/917292002003?text=' + encodeURIComponent(t);
const BASE = window.IC_BASE || '';
const AREAS = {
  Gurgaon: [['Golf Course Road', 28500, 11.2], ['Golf Course Ext.', 19800, 15.4], ['Dwarka Expressway', 13100, 18.6], ['Southern Peripheral', 15800, 14.3], ['Sohna Road', 10400, 7.1]],
  Noida:   [['Sector 94', 24500, 13.8], ['Noida Expressway', 21000, 12.5], ['Sector 150', 12500, 16.8], ['Sector 128', 15500, 11.2], ['Yamuna Expressway', 6800, 19.4]],
  Delhi:   [['Golf Links', 95000, 6.2], ['Vasant Vihar', 62000, 7.4], ['Defence Colony', 42000, 7.8], ['Greater Kailash', 38000, 8.1]],
  Mumbai:  [['Worli', 65000, 9.3], ['Bandra West', 58000, 8.4], ['Juhu', 55000, 6.9], ['Lower Parel', 42000, 7.6]],
};
(() => {
  const $ = id => document.getElementById(id);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PIMG = BASE + 'assets/projects/';
  const CITIES = ['Gurgaon', 'Noida', 'Delhi', 'Mumbai'];
  const NOT_COVERED = ['Bangalore', 'Goa'];
  const CITY_ALIAS = { gurgaon: 'Gurgaon', gurugram: 'Gurgaon', ggn: 'Gurgaon', noida: 'Noida', 'greater noida': 'Noida', delhi: 'Delhi', 'new delhi': 'Delhi', ncr: 'Gurgaon', mumbai: 'Mumbai', bombay: 'Mumbai', bangalore: 'Bangalore', bengaluru: 'Bangalore', blr: 'Bangalore', goa: 'Goa' };
  const RATES = (typeof AREAS !== 'undefined') ? AREAS : {};
  /* project knowledge: new launches (from the listings) and established ready-to-move addresses */
  const KB = [
    { id: 'oberoi', n: 'Oberoi Three Sixty North', a: ['oberoi', 'three sixty', '360 north'], dev: 'Oberoi Realty', city: 'Gurgaon', area: 'Sector 58, Golf Course Ext. Road', st: 'new', p: 18, bhk: [3, 4], cfg: '3 & 4 BHK + studio, duplexes, penthouses', img: 'oberoi-360-north.webp', tags: ['ultra'], rera: '', note: "Oberoi Realty's first project in Delhi NCR, launched June 2026; about ₹8,109 Cr booked within weeks." },
    { id: 'trump', n: 'Trump Residences Gurugram', a: ['trump'], dev: 'Smartworld × Tribeca', city: 'Gurgaon', area: 'Sector 69, Southern Peripheral Road', st: 'new', p: 8, bhk: [3, 4], cfg: '3 & 4 BHK and penthouses, 3,091–4,936 sq.ft', img: 'trump-residences.webp', tags: ['brand', 'ultra'], rera: 'GGM/925/657/2025/28', note: 'Two 51-storey towers, 298 homes, all booked on launch day (about ₹3,250 Cr). Resale enquiries only now.' },
    { id: 'elevate', n: 'Conscient Elevate Reserve', a: ['elevate', 'conscient elevate'], dev: 'Conscient', city: 'Gurgaon', area: 'Sector 62, Golf Course Ext. Road', st: 'new', p: 5.6, bhk: [3, 4], cfg: '3 & 4 BHK', img: 'conscient-elevate-reserve.webp', tags: [], rera: '', note: 'Architecture by Ricardo Bofill Taller de Arquitectura; possession indicated for March 2028.' },
    { id: 'riverine', n: 'Godrej Riverine', a: ['riverine', 'godrej riverine'], dev: 'Godrej Properties', city: 'Noida', area: 'Sector 44', st: 'new', p: 6.4, bhk: [3, 4], cfg: '3 & 4 BHK, 2,403–2,982 sq.ft carpet', img: 'godrej-riverine.webp', tags: [], rera: 'UPRERAPRJ763929/11/2024', note: 'Beside the Noida Golf Course; 275+ homes, over ₹2,000 Cr, sold at launch.' },
    { id: 'chateau', n: 'Château de Alibaug', a: ['chateau', 'alibaug', 'abhinandan', 'hoabl'], dev: 'House of Abhinandan Lodha', city: 'Mumbai', area: 'Alibaug, near Mumbai', st: 'new', p: 0, bhk: [4], cfg: '4-bed châteaux, serviced', img: 'hoabl-chateau-alibaug.webp', tags: ['brand', 'villa'], rera: '', note: 'A limited collection of 4-bed châteaux, serviced by Miros Hotels & Resorts; a second home a short ride from Mumbai.' },
    { id: 'elie', n: 'M3M Residences by Elie Saab', a: ['elie saab', 'elie', 'm3m residences'], dev: 'M3M × Elie Saab', city: 'Gurgaon', area: 'Sector 111, Dwarka Expressway', st: 'new', p: 15, bhk: [4], cfg: '4 BHK, 4,200+ sq.ft', img: 'm3m-elie-saab.jpg', tags: ['brand', 'ultra'], rera: '', note: 'Branded residences designed with Elie Saab on Dwarka Expressway.' },
    { id: 'crescent', n: 'Sobha Crescent', a: ['crescent'], dev: 'Sobha', city: 'Gurgaon', area: 'Sector 63A, Golf Course Ext. Road', st: 'new', p: 6.3, bhk: [3, 4], cfg: '3 & 4 BHK, 2,277–2,996 sq.ft', img: 'sobha-crescent.webp', tags: [], rera: '', note: "Every home is a corner home, with Aravalli views and Sobha's in-house construction." },
    { id: 'altitude', n: 'M3M Altitude', a: ['altitude'], dev: 'M3M', city: 'Gurgaon', area: 'Sector 65, Golf Course Ext. Road', st: 'new', p: 8.9, bhk: [4], cfg: '4 BHK and penthouses', img: 'm3m-altitude.webp', tags: [], rera: '', note: 'Sky residences on the most established stretch of Golf Course Extension Road.' },
    { id: 'emperor', n: 'Elan The Emperor', a: ['emperor', 'elan the emperor'], dev: 'Elan', city: 'Gurgaon', area: 'Sector 106, Dwarka Expressway', st: 'new', p: 0, bhk: [4, 5], cfg: '4 & 5 BHK, 4,223–5,891 sq.ft', img: 'elan-the-emperor.webp', tags: ['ultra'], rera: '', note: 'Designed with UHA London, inside a 50+ acre mixed-use township.' },
    { id: 'aranya', n: 'Sobha Aranya', a: ['aranya'], dev: 'Sobha', city: 'Gurgaon', area: 'Sector 80, NH-48', st: 'new', p: 0, bhk: [3, 4], cfg: '3 & 4 BHK', img: 'sobha-aranya.jpg', tags: [], rera: '', note: 'Beside the Karma Lakelands greens, an early entry on the NH-48 corridor.' },
    { id: 'parq', n: 'Conscient Parq', a: ['parq'], dev: 'Conscient', city: 'Gurgaon', area: 'Sector 80', st: 'new', p: 2.82, bhk: [3, 4], cfg: '3 & 4 BHK, 1,945–2,825 sq.ft', img: 'conscient-parq.webp', tags: [], rera: 'HRERA 45 of 2024', note: 'Award-winning luxury with NH-48 access.' },
    /* established, completed addresses: resale inventory checked live by the desk */
    { id: 'camellias', n: 'DLF The Camellias', a: ['camellias', 'camellia'], dev: 'DLF', city: 'Gurgaon', area: 'Sector 42, Golf Course Road', st: 'ready', p: 0, bhk: [4, 5], cfg: '4 & 5 BHK residences and penthouses', img: '', tags: ['ultra'], rera: '', note: "Gurgaon's best-known completed ultra-luxury address. Resale only; our desk checks live availability and pricing." },
    { id: 'magnolias', n: 'DLF The Magnolias', a: ['magnolias', 'magnolia'], dev: 'DLF', city: 'Gurgaon', area: 'Sector 42, Golf Course Road', st: 'ready', p: 0, bhk: [4, 5], cfg: '4 & 5 BHK', img: '', tags: ['ultra'], rera: '', note: 'Completed luxury towers beside the DLF Golf & Country Club. Resale only.' },
    { id: 'aralias', n: 'DLF The Aralias', a: ['aralias', 'aralia'], dev: 'DLF', city: 'Gurgaon', area: 'Sector 42, Golf Course Road', st: 'ready', p: 0, bhk: [4, 5], cfg: '4 & 5 BHK', img: '', tags: ['ultra'], rera: '', note: 'Completed golf-facing residences on Golf Course Road. Resale only.' },
    { id: 'worldone', n: 'Lodha World One', a: ['world one', 'lodha world'], dev: 'Lodha', city: 'Mumbai', area: 'Worli', st: 'ready', p: 0, bhk: [3, 4, 5], cfg: '3, 4 & 5 BHK sea-view residences', img: '', tags: ['ultra'], rera: '', note: 'Completed sea-view tower in Worli. Resale and select developer inventory; checked live by our desk.' },
  ];
  /* every project in the v5 data file, so InvestoAI can answer about any of them */
  /* every field the data file holds that a buyer may ask about */
  const extra = q => ({ slug: q.slug, type: q.type, cat: q.category, sector: q.sector, poss: /on request/i.test(q.possession) ? '' : q.possession, status: q.status,
    score: q.score || 0, am: (q.amenities || []).slice(0, 8), areaSq: q.area !== 'On request' ? q.area : '', cfgs: q.configurations || [] });
  if (window.IC && IC.A) IC.A.forEach(q => {
    const lc = q.name.toLowerCase();
    const known = KB.find(k => k.n.toLowerCase() === lc || (q.id && k.id === q.id));
    if (known) { Object.assign(known, extra(q), { rera: known.rera || q.rera || '' }); return; }
    KB.push(Object.assign({ id: q.slug, n: q.name, a: [lc], dev: q.developer, city: q.city, area: q.location, st: q.status === 'Ready to Move' ? 'ready' : 'new', p: q.priceFromCr || 0,
      bhk: [...new Set(q.configurations.map(c => parseFloat(c)).filter(n => n >= 1 && n <= 9))], cfg: q.configLabel + (q.area !== 'On request' ? ', ' + q.area : ''),
      img: (q.photos[0] || '').replace(/^assets\/projects\//, ''), tags: q.cats, rera: q.rera || '', note: q.description ? q.description.split(/(?<=[.!?])\s+(?=[A-Z])/).slice(0, 2).join(' ') : q.highlights.join('. ') }, extra(q)));
  });
  KB.forEach(p => { if (!p.type) p.type = 'Residential'; if (p.sector == null) p.sector = p.area;
    /* one name per market: the data says Gurugram, people say Gurgaon; Alibaug is Mumbai's second-home market */
    p.city = CITY_ALIAS[String(p.city).toLowerCase()] || (p.city === 'Alibaug' ? 'Mumbai' : p.city); });
  /* developer names as people type them: "signature global", "m3m", "dlf", "godrej" */
  const DEV_DROP = /\b(properties|property|homes|india|group|developers?|limited|ltd|realty|buildtech|infrastructure|infra|estates?|projects|corporation|lifespaces|realtors)\b/g;
  const devKey = d => d.toLowerCase().replace(/×.*/, '').replace(/[^a-z0-9 ]/g, ' ').replace(DEV_DROP, ' ').replace(/\s+/g, ' ').trim();
  const DEVS = [...new Set(KB.map(p => p.dev))].map(d => ({ d, k: devKey(d) })).filter(x => x.k.length >= 3);
  /* a distinctive word of a project name ("privana", "camellias"), for partial names */
  const GENERIC = new Set(['the', 'residences', 'residence', 'tower', 'towers', 'homes', 'home', 'by', 'and', 'phase', 'sector', 'gurugram', 'gurgaon', 'noida', 'north', 'south', 'east', 'west', 'park', 'city', 'estate', 'estates', 'heights', 'square', 'plaza', 'central', 'new', 'the', 'one', 'grand', 'royal', 'luxury', 'villas', 'floors', 'road', 'golf', 'course', 'avenue', 'project', 'projects', 'global', 'reserve', 'collection', 'industrial', 'commercial', 'retail', 'arcade', 'office', 'offices', 'business', 'hub', 'mall', 'high', 'street', 'suites', 'apartments', 'plots', 'greens', 'gardens', 'court', 'district', 'point', 'centre', 'center', 'world', 'life', 'living', 'prime', 'elite', 'premium', 'lake', 'view', 'vista', 'vistas', 'enclave', 'towers', 'best', 'cheapest', 'priciest', 'ready', 'launch', 'invest', 'investment']);
  const nameWords = p => p.n.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !GENERIC.has(w) && !devKey(p.dev).split(' ').includes(w));
  const pr = p => p.p ? '₹' + p.p + ' Cr+' : 'Price on request';
  const DESK = { Delhi: 'In Delhi, luxury is mostly independent floors and bungalows in South Delhi (Golf Links, Vasant Vihar, Defence Colony, Greater Kailash) rather than towers. Our desk sources these privately.', Goa: 'In Goa our desk works with completed and under-construction villas in Assagao, Siolim, Candolim and Dona Paula, shared privately.', Bangalore: 'In Bangalore we focus on Vittal Mallya Road, Hebbal, Whitefield and Sarjapur Road.', Noida: 'In Noida we focus on Sector 94, the Noida Expressway, Sector 150 and Sector 128.', Mumbai: 'In Mumbai we focus on Worli, Bandra West, Juhu and Lower Parel, plus Alibaug for second homes.', Gurgaon: 'In Gurgaon we focus on Golf Course Road, Golf Course Extension, Dwarka Expressway and the Southern Peripheral Road.' };

  /* ---------- parsing ---------- */
  /* common spellings and Hinglish, folded to the words the engine knows */
  const FOLD = [[/\b(gurgoan|gurugaon|gurgram|gurugarm|gurgao|ggn)\b/g, 'gurgaon'], [/\b(banglore|bangaluru|bengaluru|bengalore)\b/g, 'bangalore'], [/\b(mumbai|bombay)\b/g, 'mumbai'],
    [/\b(sasta|saste|sasti|cheapest|lowest priced?|low budget|affordable)\b/g, 'cheapest'], [/\b(mehenga|mehnga|costliest|most expensive|priciest)\b/g, 'priciest'],
    [/\b(chahiye|chaiye|dikhao|dikha do|batao|bata do)\b/g, 'show'], [/\b(kitna|kitni)\b/g, 'how much'], [/\b(ghar|makaan|makan)\b/g, 'home'], [/\b(sqft|sq\.ft|sq ft|square feet|square foot)\b/g, 'sqft'],
    [/(\d)\s*bhks?\b/g, '$1 bhk'], [/\bbhks\b/g, 'bhk'], [/\bcrs?\b/g, 'cr'], [/(\d)cr\b/g, '$1 cr'], [/(\d)\s*l\b/g, '$1 lakh']];
  const norm = t => { let s = ' ' + t.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9₹.,+%\s-]/g, ' ').replace(/\s+/g, ' ').trim() + ' '; FOLD.forEach(([re, w]) => (s = s.replace(re, w))); return s.replace(/\s+/g, ' '); };
  const has = (t, re) => re.test(t);
  const findCity = t => { for (const k of Object.keys(CITY_ALIAS).sort((a, b) => b.length - a.length)) if (t.includes(' ' + k + ' ')) return CITY_ALIAS[k]; return null; };
  const firstWords = {}; Object.keys(RATES).forEach(c => RATES[c].forEach(r => { const w = r[0].toLowerCase().split(' ')[0]; firstWords[w] = (firstWords[w] || 0) + 1; }));
  const findArea = t => { t = t.replace(/\./g, ''); for (const c of Object.keys(RATES)) for (const r of RATES[c]) { const n = r[0].toLowerCase().replace(/\./g, ''); const key = n.split(' ').slice(0, 2).join(' '), w1 = n.split(' ')[0];
    if (t.includes(' ' + n + ' ') || (key.length > 5 && key !== w1 && t.includes(' ' + key + ' ')) || (w1.length >= 5 && firstWords[w1] === 1 && !/^(sector|southern|golf|noida|yamuna|lower|greater|defence)$/.test(w1) && t.includes(' ' + w1 + ' '))) return { city: c, r }; } return null; };
  const findProjectsExact = t => KB.filter(p => p.a.some(a => t.includes(' ' + a + ' ') || t.includes(' ' + a)) || t.includes(' ' + p.n.toLowerCase() + ' '));
  /* exact names first; otherwise a distinctive word of the name ("privana" finds Privana West and North) */
  const findProjects = t => { const ex = findProjectsExact(t); if (ex.length) return ex;
    const cand = KB.filter(p => nameWords(p).some(w => t.includes(' ' + w + ' '))); if (cand.length < 2) return cand;
    /* several share the word: prefer the one whose other name words were typed too ("privana west") */
    const sc = p => p.n.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(w => w.length >= 3 && t.includes(' ' + w + ' ')).length;
    const top = Math.max(...cand.map(sc)); return cand.filter(p => sc(p) === top); };
  const findDev = t => {
    const ok = x => (x.k.length >= 4 || /^(m3m|dlf)$/.test(x.k)) && t.includes(' ' + x.k + ' ');
    const full = x => t.includes(' ' + x.d.toLowerCase().replace(/×.*/, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() + ' ');
    const hit = DEVS.filter(x => ok(x) || full(x) || (/^house of abhinandan/.test(x.k) && /\b(hoabl|abhinandan|lodha)\b/.test(t)));
    return hit.sort((a, b) => b.k.length - a.k.length)[0] || null; };
  /* areas inside a city: the corridors we price, the locations in the data, sector numbers and landmarks */
  const LOCKEY = s => s.toLowerCase().replace(/\bext\.?\b/g, 'extension').replace(/[^a-z0-9 ]/g, ' ').replace(/\b(road|rd)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const LOCS = [...new Set(KB.map(p => p.area))].map(a => ({ a, k: LOCKEY(a) })).filter(x => x.k.length >= 4 && !/^(sector \d+\w?)$/.test(x.k));
  const LANDMARK = { airport: 'dwarka expressway', 'igi': 'dwarka expressway', 'cyber city': 'golf course', 'cyber hub': 'golf course', 'nh 48': 'nh 48', 'nh48': 'nh 48', 'spr': 'southern peripheral', 'gcer': 'golf course extension', 'gce': 'golf course extension' };
  const findLoc = t => {
    const tk = ' ' + LOCKEY(t) + ' ';
    const sec = tk.match(/ sector (\d+\w?) /); if (sec) return { label: 'Sector ' + sec[1].toUpperCase(), test: p => new RegExp('\\bsector ' + sec[1] + '\\b', 'i').test(p.sector + ' ' + p.area) };
    for (const [w, k] of Object.entries(LANDMARK)) if (tk.includes(' ' + w + ' ')) return { label: w === 'airport' || w === 'igi' ? 'near the airport (Dwarka Expressway)' : k.replace(/\b\w/g, c => c.toUpperCase()), test: p => LOCKEY(p.area + ' ' + p.sector).includes(k) };
    const hit = LOCS.filter(x => tk.includes(' ' + x.k + ' ') || (x.k.split(' ').length > 1 && tk.includes(' ' + x.k.split(' ').slice(0, 2).join(' ') + ' '))).sort((a, b) => b.k.length - a.k.length)[0];
    return hit ? { label: hit.a, test: p => LOCKEY(p.area + ' ' + p.sector).includes(hit.k.split(' ').slice(0, 2).join(' ')) } : null; };
  const RE_COMM = /\b(commercial|office|offices|retail|shop|shops|showroom|sco|high street|warehouse|warehousing|industrial|food court)\b/;
  const devName = (L, dev) => { const c = {}; (L.length ? L : KB.filter(p => devKey(p.dev) === dev.k)).forEach(p => (c[p.dev] = (c[p.dev] || 0) + 1)); return Object.keys(c).sort((a, b) => c[b] - c[a] || a.length - b.length)[0] || dev.d; };
  const yearOf = t => { const m = t.match(/\b(20[2-3]\d)\b/); return m ? +m[1] : null; };
  const possYear = p => { const m = String(p.poss || '').match(/(20\d\d)/); return m ? +m[1] : null; };
  const money = t => { /* returns crore */
    const m = t.match(/(\d+(?:\.\d+)?)\s*(cr|crore|crores|c)\b/); if (m) return +m[1];
    const l = t.match(/(\d+(?:\.\d+)?)\s*(l|lakh|lakhs|lac|lacs)\b/); if (l) return +l[1] / 100;
    return null; };
  const budgetRange = t => { const v = money(t); if (v == null) return null; if (/\b(under|below|less than|upto|up to|within|max|maximum|<)\b/.test(t)) return [0, v]; if (/\b(above|over|more than|minimum|min|from|>)\b/.test(t)) return [v, 1e9]; return [v * .7, v * 1.3]; };
  const bhkOf = t => { const m = t.match(/(\d)\s*(bhk|bed|bedroom)/); return m ? +m[1] : null; };
  const RE_RE = /\b(flat|flats|apartment|apartments|home|homes|house|villa|villas|penthouse|property|properties|project|projects|launch|launches|bhk|sq ?ft|sqft|psf|rate|rates|price|prices|invest|investment|investing|buy|buying|purchase|real estate|realestate|builder|developer|rera|possession|ready|plot|plots|land|emi|loan|sector|corridor|luxury|apartment|residence|residences|tower|floor|floors|bungalow|appreciation|resale|roi|returns|yield|stamp duty|registration|nri)\b/;
  const RE_OFF = /\b(weather|cricket|match|movie|film|song|music|recipe|cook|joke|poem|story|code|python|javascript|html|math|homework|news|politic|election|president|prime minister|modi|crypto|bitcoin|stock|stocks|share market|sensex|nifty|car|bike|phone|iphone|laptop|game|football|ipl|doctor|medicine|health|diet|love|girlfriend|boyfriend|translate|essay|chatgpt|gpt)\b/;
  const RE_RENT = /\b(rent|rental|renting|on rent|for rent|lease|leasing|tenant|pg|paying guest|flatmate|hostel)\b/;
  const RE_YIELD = /\b(yield|income|returns?|roi)\b/;

  /* ---------- answer engine: returns { text, cards, table, chips, form } ---------- */
  let misses = 0, ctx = { city: null, last: [], shown: 0, P: 5, budget: null, pending: null };
  function answer(raw) {
    const a = answer0(raw);
    if (a.cards && a.cards.length) { if (!a.keepList) { ctx.last = a.list || a.cards; ctx.shown = a.cards.length; } if (a.cards[0].p) ctx.P = a.cards[0].p; }
    return a;
  }
  function answer0(raw) {
    const t0 = norm(raw);
    if (/ a home for my family /.test(t0)) return { text: 'Lovely. Which city would you like to live in? I cover new launches and ready-to-move homes in all four.', chips: ['Gurgaon', 'Noida', 'Delhi', 'Mumbai'] };
    if (/ an investment /.test(t0)) raw = 'best areas to invest';
    if (/ just exploring /.test(t0)) return { text: 'Take your time. Here are a few things people ask me most:', chips: ['New launches', 'Ready-to-move in Mumbai', 'Price per sq.ft in Noida', 'EMI on ₹5 Cr'] };
    if (/compare the first two/.test(t0) && ctx.last.length >= 2) raw = ctx.last[0].n + ' vs ' + ctx.last[1].n;
    if (/^ show more/.test(t0) && ctx.last.length > ctx.shown) { const more = ctx.last.slice(ctx.shown, ctx.shown + 4); ctx.shown += more.length; return { text: 'More matches:', cards: more, keepList: true, chips: ctx.last.length > ctx.shown ? ['Show more', 'Talk to an advisor'] : ['Compare the first two', 'Talk to an advisor'] }; }
    if (/ that budget /.test(t0) && ctx.budget) raw += ' under ' + ctx.budget.toFixed(1) + ' cr';
    if (/^ try (\d+) years? $/.test(t0)) raw = 'emi on ' + ctx.P + ' cr for ' + t0.match(/(\d+)/)[1] + ' years';
    /* a city given in reply to "which city?" completes the earlier question */
    if (ctx.pending) { const pc = findCity(t0); if (pc && t0.trim().split(' ').length <= 4) raw = ctx.pending + ' in ' + pc; ctx.pending = null; }
    const t = norm(raw), city = findCity(t), area = findArea(t), projs = findProjects(t), bhk = bhkOf(t), bud = budgetRange(t);
    const dev = findDev(t), loc = findLoc(t), wantComm = RE_COMM.test(t), yr = yearOf(t);
    const exactProj = findProjectsExact(t).length > 0;
    /* markets we no longer cover */
    if (city && NOT_COVERED.includes(city)) return { text: 'InvestoClub currently advises on Gurgaon, Noida, Delhi and Mumbai, so I can\'t help with ' + city + ' right now. Shall I look in one of those?', chips: ['Gurgaon', 'Noida', 'Delhi', 'Mumbai'], ask: true, small: true };
    if (city) ctx.city = city;
    const C = city || (area && area.city) || ctx.city, CS = city || (area && area.city);
    const reHit = RE_RE.test(t) || city || area || projs.length || bhk || bud || dev || loc || wantComm;
    if (has(t, /^\s*(hi|hello|hey|hii+|namaste|hola|good (morning|evening|afternoon))\b/) && t.split(' ').length < 6) { misses = 0;
      return { text: 'Hello. I can help you buy luxury homes in Gurgaon, Noida, Delhi and Mumbai: new launches and ready-to-move. What are you looking for?', chips: ['4 BHK under ₹10 Cr in Gurgaon', 'Best appreciating areas', 'Ready-to-move in Mumbai', 'EMI on ₹5 Cr'], small: true }; }
    if (has(t, /\b(thank|thanks|thx|great|perfect|awesome)\b/) && t.split(' ').length < 6) return { text: 'Glad that helps. Anything else, or shall an advisor call you?', chips: ['Talk to an advisor', 'Compare two projects'], small: true };
    if (RE_RENT.test(t) && !RE_YIELD.test(t)) return { text: 'We don\'t handle rentals. InvestoClub helps you buy and own luxury homes, new launches and ready-to-move. If rental income is the goal, I can show where yields are strongest.', chips: ['Where are rental yields strongest?', 'Ready-to-move homes', 'New launches'], small: true };
    if (!reHit && RE_OFF.test(t)) return { text: 'I only help with buying luxury real estate, so I can\'t answer that. Ask me about a project, a city, prices per sq.ft, appreciation or an EMI.', chips: ['New launches in Noida', 'Price per sq.ft in Worli', 'Where to invest ₹10 Cr?'], small: true };
    if (has(t, /\b(advisor|adviser|human|person|agent|call me|callback|call back|talk to|speak to|contact|visit|site visit|meet|meeting|whatsapp|number)\b/)) return { text: 'Of course. Leave your name and number and an advisor will call you back, usually within one working day.', form: true, small: true };

    /* EMI */
    if (has(t, /\b(emi|home loan|loan)\b/)) {
      const P = (money(t) || (projs.length === 1 && projs[0].p) || 5) * 1e7, rm = t.match(/(\d+(?:\.\d+)?)\s*%/), ym = t.match(/(\d+)\s*(years?|yrs?)/);
      const rate = rm ? +rm[1] : 8.5, yrs = ym ? +ym[1] : 20, r = rate / 1200, n = yrs * 12, e = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1), tot = e * n;
      return { text: 'On a loan of ' + fmt(P) + ' at ' + rate + '% for ' + yrs + ' years, the EMI is about ' + fmt(e) + ' a month. You would repay ' + fmt(tot) + ' in total, of which ' + fmt(tot - P) + ' is interest. Banks usually keep all EMIs within about half of take-home income.' + (rm ? '' : ' (8.5% is an illustrative rate; tell me yours, e.g. "at 9%".)'), table: [['Monthly EMI', fmt(e)], ['Total interest', fmt(tot - P)], ['Total payable', fmt(tot)]], kv: true, chips: [yrs === 15 ? 'Try 25 years' : 'Try 15 years', 'What can I afford on ₹10 L a month?', 'Talk to an advisor'] };
    }
    if (has(t, /\b(afford\w*|eligib\w*|budget for|how much can i)\b/) && !has(t, /\bcheapest\b/)) {
      const inc = money(t) || .1, e = inc * 1e7 * .5, r = 8.5 / 1200, n = 240, loan = e * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)); ctx.budget = loan / 1e7 * 1.25;
      return { text: 'With a monthly income of ' + fmt(inc * 1e7) + ', banks would typically allow an EMI near ' + fmt(e) + ', which supports a loan of about ' + fmt(loan) + ' over 20 years at 8.5%. Add your down payment to that for your home budget.', chips: ['Show homes in that budget', 'EMI on ' + (loan / 1e7).toFixed(1) + ' Cr'] };
    }
    /* compare */
    if (projs.length >= 2 && has(t, /\b(vs|versus|compare|comparison|better|or|difference)\b/)) {
      const [A, B] = projs; return { text: 'Here is ' + A.n + ' against ' + B.n + '. ' + (A.p && B.p ? (A.p < B.p ? A.n : B.n) + ' is the lower entry price. ' : '') + (A.score && B.score && A.score !== B.score ? (A.score > B.score ? A.n : B.n) + ' has the higher InvestoScore. ' : '') + 'For the final call, weigh the developer record and the payment plan.', table: [['', A.n, B.n], ['City', A.city, B.city], ['Area', A.sector || A.area, B.sector || B.area], ['Price', pr(A), pr(B)], ['Homes', A.cfg, B.cfg], ['Status', A.st === 'ready' ? 'Ready to move' : 'New launch', B.st === 'ready' ? 'Ready to move' : 'New launch'], ['Possession', A.poss || 'On request', B.poss || 'On request'], ['InvestoScore', A.score ? A.score.toFixed(1) + ' / 5' : '—', B.score ? B.score.toFixed(1) + ' / 5' : '—'], ['RERA', A.rera || 'On request', B.rera || 'On request']], grid: true, chips: ['Talk to an advisor', 'EMI on ' + (Math.min(A.p || 5, B.p || 5)) + ' Cr'] };
    }
    /* one project: answer the exact thing asked, with its facts */
    if (projs.length === 1) { const p = projs[0];
      if (bhk && !p.bhk.includes(bhk)) return { text: p.n + ' has ' + p.bhk.join(' & ') + ' BHK homes only (' + p.cfg + '), so there is no ' + bhk + ' BHK here.', cards: [p], chips: [bhk + ' BHK in ' + p.city + ' instead', 'Talk to an advisor'] };
      const facts = [['Developer', p.dev], ['Location', (p.sector || p.area) + (String(p.sector || p.area).includes(p.city) ? '' : ', ' + p.city)], ['Homes', p.cfg], ['Starting price', p.p ? '₹' + p.p + ' Cr*' : 'On request'], ['Status', p.status || (p.st === 'ready' ? 'Ready to move' : 'New launch')], ['Possession', p.poss || 'On request'], ['RERA', p.rera || 'Shared with the price sheet']].concat(p.score ? [['InvestoScore', p.score.toFixed(1) + ' / 5']] : []);
      const more = ['EMI on ' + (p.p || 5) + ' Cr', 'Compare ' + p.n + ' with another project', 'Get the price sheet'];
      if (has(t, /\b(rera|registration number|registered)\b/)) return { text: p.rera ? p.n + ' is RERA registered as ' + p.rera + '. Always verify it on the state RERA portal before booking; we do this for every client.' : 'We confirm RERA details for ' + p.n + ' directly with the developer and share them with the price sheet.', cards: [p], chips: more };
      if (has(t, /\b(amenit\w*|facilit\w*|clubhouse|pool|gym)\b/)) return { text: p.am && p.am.length ? p.n + ' lists these amenities: ' + p.am.join('; ') + '.' : 'The amenity list for ' + p.n + ' comes with the brochure; I can have an advisor send it.', cards: [p], chips: more };
      if (has(t, /\b(possession|handover|completion|complete|ready by|when)\b/)) return { text: p.poss ? p.n + ': possession is listed for ' + p.poss + ' (' + (p.status || 'as published') + ').' : p.n + ' has not published a possession date; we confirm it with the developer.', cards: [p], chips: more };
      if (has(t, /\b(price|prices|cost|rate|how much|budget)\b/)) return { text: p.p ? p.n + ' starts at about ₹' + p.p + ' Cr before taxes and charges (' + p.cfg + ').' : p.n + ' does not publish a price; the current sheet is shared on enquiry.', cards: [p], chips: more };
      if (has(t, /\b(size|sizes|sqft|area|carpet|layout|floor plan|configuration|bhk)\b/)) return { text: p.n + ' offers ' + p.cfg + '.', cards: [p], chips: more };
      if (has(t, /\b(worth|good|invest\w*|should i|buy)\b/)) return { text: (p.score ? p.n + ' carries an InvestoScore of ' + p.score.toFixed(1) + ' out of 5 (our own rating of location, developer record, launch pricing and resale liquidity). ' : '') + p.note + ' Weigh it against your holding period; our advisors run the numbers with you.', cards: [p], table: facts, kv: true, chips: more };
      return { text: p.note, cards: [p], table: facts, kv: true, chips: more }; }
    /* a name that fits several projects ("privana") */
    if (projs.length >= 2 && !exactProj) return { text: 'I found ' + projs.length + ' projects with that name. Which one do you mean?', cards: projs.slice(0, 4), list: projs, chips: projs.slice(0, 3).map(p => p.n) };
    /* market timing: no forecasts, just what the numbers show */
    if (has(t, /\b(good time|right time|buy now|should i buy|market (outlook|trend|condition)|will prices|prices (go|rise|fall)|crash|bubble)\b/)) {
      const pool = (C ? (RATES[C] || []).map(r => [r[0] + (C ? '' : ''), r[2], r[1]]) : Object.keys(RATES).flatMap(c => RATES[c].map(r => [r[0] + ', ' + c, r[2], r[1]]))).sort((a, b) => b[1] - a[1]);
      const lo = Math.min(...pool.map(x => x[1])), hi = Math.max(...pool.map(x => x[1]));
      return { text: 'We don\'t forecast prices. What the numbers show: luxury prices in the corridors we track ' + (C ? 'in ' + C + ' ' : '') + 'rose about ' + lo + '–' + hi + '% over the last year (indicative). For a good entry, look for a launch priced below its corridor average, a developer with an on-time record, and a holding period of five years or more.', table: pool.slice(0, 5).map(x => [x[0], '▲ ' + x[1] + '%', '₹' + x[2].toLocaleString('en-IN') + '/sq.ft']), chips: ['Best investment in ' + (C || 'Gurgaon'), 'Talk to an advisor'] };
    }
    /* appreciation / growth areas (no budget or home type given) */
    if (has(t, /\b(appreciat\w*|growth|grow\w*|best areas?|where to invest|which area|which city|returns|roi|yield|hotspots?|emerging)\b/) && !bhk && !bud && !dev) {
      const pool = C ? (RATES[C] || []).map(r => [r[0] + ', ' + C, r[2], r[1]]) : Object.keys(RATES).flatMap(c => RATES[c].map(r => [r[0] + ', ' + c, r[2], r[1]]));
      const top = pool.sort((a, b) => b[1] - a[1]).slice(0, 5);
      const yieldNote = has(t, /\b(yield|rental income|income)\b/) ? ' For rental yield, ready-to-move homes near business districts (Golf Course Road, Worli, Hebbal) usually let fastest, at roughly 2–3% a year on luxury stock.' : '';
      return { text: (yieldNote ? yieldNote.trim() + ' Fastest-growing areas ' : 'Fastest-growing luxury areas ') + (C ? 'in ' + C : 'we track') + ', by yearly price growth (indicative):', table: top.map(x => [x[0], '▲ ' + x[1] + '%', '₹' + x[2].toLocaleString('en-IN') + '/sq.ft']), chips: ['Best investment in ' + (C || 'Gurgaon'), 'New launches in ' + (C || 'Gurgaon'), 'Talk to an advisor'] };
    }
    /* rates */
    if (has(t, /\b(rate|rates|price|prices|per sq|psf|sqft|cost)\b/) && (area || CS) && !bhk && !bud && !dev && !has(t, /\b(cheapest|priciest)\b/)) {
      if (area) { const [n, v, y] = area.r; return { text: n + ', ' + area.city + ': luxury homes average about ₹' + v.toLocaleString('en-IN') + ' per sq.ft, up ' + y + '% on last year (indicative). A 3,000 sq.ft home there works out near ' + fmt(v * 3000) + '.', chips: ['Projects on ' + n, 'Best areas in ' + area.city] }; }
      const L = RATES[CS] || []; return { text: 'Luxury rates in ' + CS + ' (indicative, ₹ per sq.ft, yearly change):', table: L.map(r => [r[0], '₹' + r[1].toLocaleString('en-IN'), '▲ ' + r[2] + '%']), chips: ['Best areas in ' + CS, 'Projects in ' + CS] };
    }
    /* NRI / process / taxes */
    if (has(t, /\b(nri|abroad|overseas|repatriat\w*|fema|oci)\b/)) return { text: 'NRIs and OCI holders can buy residential property in India freely. Payment must come through NRE, NRO or FCNR accounts or normal banking channels, and a home loan from an Indian bank is possible. Our desk handles remote site videos, the power of attorney and paperwork, so you can buy without flying in.', chips: ['Talk to an advisor', 'New launches'] };
    if (has(t, /\b(stamp duty|registration charge|registration cost|taxes|gst|tds)\b/)) return { text: 'Roughly: stamp duty is about 5–7% in Haryana and Delhi (lower for women buyers), about 6% in Mumbai plus 1% registration, and about 5–6% in Karnataka and Uttar Pradesh. Under-construction homes also carry 5% GST; ready-to-move homes do not. Your advisor confirms the exact figure for your purchase.', chips: ['EMI on ₹5 Cr', 'Talk to an advisor'] };
    if (has(t, /\b(how (does|do) (it|you|investoclub) work|process|what do you do|who are you|about investoclub|why investoclub)\b/)) return { text: 'InvestoClub is a real estate wealth advisory. We research each project (title, RERA, escrow, developer delivery record), shortlist what fits your goals, negotiate, and stay with you through possession. Tell me a city and budget and I\'ll show you the shortlist.', chips: ['4 BHK under ₹10 Cr in Gurgaon', 'Talk to an advisor'] };

    /* search: developer, city, area, budget, BHK, type, possession, price order, investment picks */
    const wantReady = has(t, /\b(ready|ready to move|rtm|immediate|possession now|completed|resale)\b/), wantNew = has(t, /\b(new launch|new launches|launch|launches|under construction|upcoming|new)\b/);
    const wantBrand = has(t, /\b(branded|brand|designer)\b/), wantVilla = has(t, /\b(villa|villas|bungalow|independent)\b/);
    const wantPicks = has(t, /\b(best|top|good|recommend\w*|worth|smart|safest|opportunit\w*|pick|picks)\b/) && has(t, /\b(invest\w*|project|projects|property|properties|buy|picks?|opportunit\w*|options?|homes?|flats?)\b/) || (has(t, /\binvest\w*\b/) && (bud || bhk));
    const cheap = has(t, /\bcheapest\b/), pricey = has(t, /\bpriciest\b/), wantPoss = yr && has(t, /\b(possession|handover|ready by|ready in|completion|delivery|by)\b/);
    if (wantVilla && CS === 'Delhi') return { text: DESK[CS] + ' Share your budget and an advisor will send what is available this month.', form: true };
    if (dev || loc || CS || bhk || bud || wantReady || wantNew || wantBrand || wantComm || wantPicks || cheap || pricey || wantPoss || has(t, /\b(show|find|looking|search|suggest|options|projects|homes|flats|apartments|property|properties|buy|home)\b/)) {
      const where = CS || (loc || dev ? null : ctx.city);
      /* understand first: a request for homes with no place yet gets one question back */
      if (!where && !dev && !loc) {
        ctx.pending = raw;
        const what = [bhk ? bhk + ' BHK homes' : '', wantComm ? 'commercial property' : '', wantPicks ? 'investment picks' : '', cheap ? 'the lowest-priced options' : ''].filter(Boolean)[0] || 'options';
        return { text: 'Happy to help. Which city should I look in for ' + what + (bud ? ' ' + (bud[0] === 0 ? 'under ₹' + bud[1] + ' Cr' : bud[1] > 1e8 ? 'above ₹' + bud[0] + ' Cr' : 'around ₹' + money(t) + ' Cr') : '') + '?', chips: ['Gurgaon', 'Noida', 'Mumbai', 'Delhi'], ask: true, small: true };
      }
      let L = KB.slice();
      if (where) L = L.filter(p => p.city === where);
      if (dev) L = L.filter(p => devKey(p.dev) === dev.k || p.dev === dev.d);
      if (loc) L = L.filter(loc.test);
      L = wantComm ? L.filter(p => p.type === 'Commercial') : L.filter(p => p.type !== 'Commercial' || dev || (!bhk && !has(t, /\b(home|homes|flat|flats|apartment|apartments|bhk|villa)\b/) && loc));
      /* a named commercial format narrows further, where we list any */
      if (wantComm) { const want = [['sco', 'SCO'], ['office', 'Office'], ['retail', 'Retail'], ['shop', 'Retail'], ['high street', 'High Street'], ['industrial', 'Industrial'], ['warehous', 'Industrial']].filter(([w]) => t.includes(w)).map(x => x[1]);
        const nar = L.filter(p => want.includes(p.cat) || (want.includes('Retail') && p.cat === 'High Street')); if (want.length && nar.length) L = nar; }
      if (wantReady && !wantNew) L = L.filter(p => p.st === 'ready'); else if (wantNew && !wantReady) L = L.filter(p => p.st === 'new');
      if (wantBrand) L = L.filter(p => p.tags.includes('brand'));
      if (bhk) L = L.filter(p => p.bhk.includes(bhk));
      if (bud) L = L.filter(p => p.p && ((p.p >= bud[0] && p.p <= bud[1]) || (bud[0] === 0 && p.p <= bud[1])));
      if (wantPoss) L = L.filter(p => possYear(p) && possYear(p) <= yr).sort((a, b) => possYear(a) - possYear(b));
      else if (cheap) L = L.filter(p => p.p).sort((a, b) => a.p - b.p);
      else if (pricey) L = L.filter(p => p.p).sort((a, b) => b.p - a.p);
      else if (wantPicks) L.sort((a, b) => (b.score || 0) - (a.score || 0) || (b.p ? 1 : 0) - (a.p ? 1 : 0));
      else L.sort((x, y) => (y.p ? 1 : 0) - (x.p ? 1 : 0) || (y.score || 0) - (x.score || 0) || (bud && bud[1] < 1e8 ? y.p - x.p : x.p - y.p));
      const place = where ? 'in ' + where : '', label = [bhk ? bhk + ' BHK' : '', wantReady && !wantNew ? 'ready-to-move' : wantNew && !wantReady ? 'new-launch' : '', wantBrand ? 'branded' : '',
        wantComm ? 'commercial properties' : dev ? devName(L, dev) + ' projects' : 'homes', loc ? (/^near /.test(loc.label) ? loc.label : 'on ' + loc.label) : '', place,
        bud ? (bud[0] === 0 ? 'under ₹' + bud[1] + ' Cr' : bud[1] > 1e8 ? 'above ₹' + bud[0] + ' Cr' : 'around ₹' + money(t) + ' Cr') : '', wantPoss ? 'with possession by ' + yr : ''].filter(Boolean).join(' ');
      if (L.length) { misses = 0;
        const lead = wantPicks ? 'Our highest-rated ' + label + ' by InvestoScore (our own rating of location, developer record, launch pricing and resale liquidity):' : cheap ? 'Lowest starting prices first, ' + label + ':' : pricey ? 'Highest starting prices first, ' + label + ':' : 'Here ' + (L.length === 1 ? 'is 1 match' : 'are ' + Math.min(L.length, 4) + ' of ' + L.length + ' matches') + ' for ' + label + '.';
        return { text: lead, cards: L.slice(0, 4), list: L, chips: [L.length > 4 ? 'Show more' : (L.length > 1 ? 'Compare the first two' : 'Get the price sheet'), 'EMI on ' + ((L[0] && L[0].p) || 5) + ' Cr', 'Talk to an advisor'] }; }
      return { text: 'Nothing on our public list matches ' + label + ' right now. ' + (where && DESK[where] ? DESK[where] + ' ' : '') + 'Our desk also has inventory that isn\'t listed; leave your number and an advisor will share it.', form: true };
    }
    if (reHit) { misses++; return { text: 'I\'m not sure I followed. Try a city, a budget or a project name, for example "3 BHK under ₹8 Cr in Noida" or "Trump Residences RERA".', chips: ['3 BHK under ₹8 Cr in Noida', 'Ready-to-move in Gurgaon', 'Price per sq.ft in Bandra'], form: misses >= 2 }; }
    misses++;
    return { text: 'I only help with buying luxury real estate, new launches and ready-to-move, across Gurgaon, Noida, Delhi and Mumbai. ' + (misses >= 2 ? 'Let me connect you with an advisor instead.' : 'Try one of these:'), chips: ['New launches', 'Best appreciating areas', 'EMI on ₹5 Cr'], form: misses >= 2 };
  }
  function fmt(v) { v = Math.round(v); if (v >= 1e7) return '₹' + (v / 1e7).toFixed(2) + ' Cr'; if (v >= 1e5) return '₹' + (v / 1e5).toFixed(2) + ' L'; return '₹' + v.toLocaleString('en-IN'); }

  /* ---------- UI (layout after vercel/chatbot: greeting, suggested actions, reasoning steps, composer) ---------- */
  const root = $('iai'), panel = $('iaiPanel'), launcher = $('iaiOpen'), log = $('iaiLog'), form = $('iaiForm'), input = $('iaiInput'), down = $('iaiDown'), tip = $('iaiTip');
  const SPARK = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>';
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  let open = false, busy = false, started = false, handed = false;
  const setOpen = (o, q) => {
    open = o; root.classList.toggle('open', o); launcher.setAttribute('aria-expanded', o); panel.setAttribute('aria-hidden', !o); panel.inert = !o;
    document.documentElement.classList.toggle('iai-lock', o && innerWidth <= 900);
    if (o) { tip.classList.remove('show'); if (!started) greet(); setTimeout(() => input.focus({ preventScroll: true }), 150); if (q) { input.value = q; send(); } }
    else launcher.focus({ preventScroll: true });
  };
  launcher.addEventListener('click', () => setOpen(!open));
  $('iaiClose').addEventListener('click', () => setOpen(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) { const pop = $('iaiLead'); if (!pop.hidden) { pop.hidden = true; input.focus(); } else setOpen(false); } });
  window.openInvestoAI = q => setOpen(true, q);
  /* the full InvestoAI page: Talk buttons go there straight away, carrying the question if there is one */
  const ON_AI = /\/ai\/(index\.html)?$/.test(location.pathname);
  const goAI = q => { location.href = BASE + 'ai/' + (location.protocol === 'file:' ? 'index.html' : '') + (q ? '?q=' + encodeURIComponent(q) : ''); };
  window.goInvestoAI = goAI;
  document.addEventListener('click', e => { const b = e.target.closest('[data-iai]'); if (!b) return; e.preventDefault();
    if (!ON_AI && (b.matches('.aip, .talk, .ix2-chip') || b.dataset.iai === '')) return goAI(b.dataset.iai || undefined);
    setOpen(true, b.dataset.iai || undefined); });
  setTimeout(() => { try { if (sessionStorage.getItem('iai-tip')) return; sessionStorage.setItem('iai-tip', 1); } catch (e) {} if (!open) { tip.classList.add('show'); setTimeout(() => tip.classList.remove('show'), 7000); } }, 4500);
  tip.addEventListener('click', () => setOpen(true));

  const atBottom = () => log.scrollHeight - log.scrollTop - log.clientHeight < 40;
  const toEnd = smooth => log.scrollTo({ top: log.scrollHeight, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  log.addEventListener('scroll', () => down.classList.toggle('on', !atBottom()), { passive: true });
  down.addEventListener('click', () => toEnd(true));

  /* greeting + suggested actions */
  const now = () => new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  async function greet() { started = true;
    const d = document.createElement('div'); d.className = 'day'; d.textContent = 'Today'; log.appendChild(d);
    const h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const a = row('bot'); a.innerHTML = '<p>' + g + "! I'm InvestoAI ✦, InvestoClub's wealth assistant.<time>" + now() + '</time></p>';
    await sleep(500);
    const b2 = row('bot'); b2.innerHTML = '<p>Are you looking to grow your wealth, or find a luxury home for your family?<time>' + now() + '</time></p>';
    const ch = document.createElement('div'); ch.className = 'chips'; ch.innerHTML = ['A home for my family', 'An investment', 'Just exploring'].map(x => '<button type="button">' + x + '</button>').join(''); b2.appendChild(ch);
    ch.querySelectorAll('button').forEach(b => b.onclick = () => { input.value = b.textContent; send(); });
  }
  function row(role) { const r = document.createElement('div'); r.className = 'm m-' + role;
    r.innerHTML = role === 'bot' ? '<span class="m-ic" aria-hidden="true">' + SPARK + '</span><div class="m-c"></div>' : '<div class="m-c"></div>'; log.appendChild(r); return r.querySelector('.m-c'); }
  /* what the engine is about to do, shown as steps */
  function plan(q) {
    const t = norm(q), c = findCity(t), ar = findArea(t), ps = findProjects(t), bh = bhkOf(t), bu = budgetRange(t);
    const steps = ['Reading your question'];
    if (RE_RENT.test(t) && !RE_YIELD.test(t)) return steps.concat(['Rentals are outside what we do']);
    if (!(RE_RE.test(t) || c || ar || ps.length || bh || bu) && RE_OFF.test(t)) return steps.concat(['Checking the topic']);
    if (ps.length) steps.push('Looking up ' + ps.map(p => p.n).slice(0, 2).join(' and '));
    else if (/\b(emi|loan|afford)\b/.test(t)) steps.push('Running the loan maths');
    else if (ar) steps.push('Pulling rates for ' + ar.r[0] + ', ' + ar.city);
    else steps.push('Searching ' + (c ? KB.filter(p => p.city === c).length + ' projects in ' + c : KB.length + ' projects across 4 cities'));
    const f = [bh ? bh + ' BHK' : '', bu ? (bu[0] === 0 ? 'under ₹' + bu[1] + ' Cr' : bu[1] > 1e8 ? 'above ₹' + bu[0] + ' Cr' : 'near ₹' + money(t) + ' Cr') : '', /\bready\b/.test(t) ? 'ready to move' : /\blaunch/.test(t) ? 'new launches' : ''].filter(Boolean);
    if (f.length) steps.push('Filtering ' + f.join(', '));
    steps.push('Checking RERA and pricing');
    return steps;
  }
  async function think(box, steps) {
    const t0 = performance.now();
    box.innerHTML = '<button type="button" class="qs-t" aria-expanded="true"><span class="qs-sp"></span><span class="qs-l">Searching</span><svg class="qs-c" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button><ol class="qs-s"></ol>';
    const ol = box.querySelector('.qs-s'), tg = box.querySelector('.qs-t');
    tg.onclick = () => { const o = tg.getAttribute('aria-expanded') !== 'true'; tg.setAttribute('aria-expanded', o); box.classList.toggle('shut', !o); };
    for (const s of steps) { const li = document.createElement('li'); li.innerHTML = '<i>' + TICK + '</i><span>' + esc(s) + '</span>'; ol.appendChild(li); toEnd(false); await sleep(1500 / steps.length); li.classList.add('ok'); }
    const secs = ((performance.now() - t0) / 1000).toFixed(1);
    box.querySelector('.qs-l').textContent = 'Searched in ' + secs + 's'; box.classList.add('done', 'shut'); tg.setAttribute('aria-expanded', 'false');
  }
  async function stream(el, text) { const p = document.createElement('p'); el.appendChild(p); const w = text.split(' ');
    for (let i = 0; i < w.length; i++) { p.textContent += (i ? ' ' : '') + w[i]; if (i % 3 === 0) toEnd(false); await sleep(12 + Math.random() * 14); } return p; }
  /* listing card (mirrors the site's listing cards; links to the full listing) */
  const LISTED = ['oberoi', 'trump', 'elevate', 'riverine', 'chateau', 'elie', 'crescent', 'altitude', 'emperor', 'aranya'];
  if (window.IC && IC.A) IC.A.forEach(q => { if (!LISTED.includes(q.id || q.slug)) LISTED.push(q.slug); });
  function listing(p) {
    return '<article class="lk">' + (p.img ? '<img src="' + PIMG + p.img + '" alt="' + esc(p.n) + '" loading="lazy" />' : '<div class="lk-ph"><span>' + esc(p.dev) + '</span></div>') +
      '<span class="lk-tag ' + (p.st === 'ready' ? 'r' : 'n') + '">' + (p.st === 'ready' ? 'Ready to move' : 'New launch') + '</span>' +
      '<div class="lk-b"><p class="lk-dev">' + esc(p.dev) + '</p><h4>' + esc(p.n) + '</h4><p class="lk-loc">' + esc(p.area) + ', ' + p.city + '</p>' +
      '<div class="lk-row"><b>' + pr(p) + '</b><span>' + esc(p.bhk.join(' & ') + ' BHK') + '</span></div>' +
      '<p class="lk-rera">' + (p.rera ? 'RERA ' + esc(p.rera) : 'RERA shared with price sheet') + '</p>' +
      '<div class="lk-act"><button type="button" class="lk-v" data-view="' + p.id + '">View listing</button><button type="button" class="lk-q" data-sheet="' + p.id + '">Get price sheet</button></div></div></article>';
  }
  async function send() {
    const q = input.value.trim(); if (!q || busy) return; busy = true; input.value = ''; autosize(); root.classList.remove('fresh');
    const g = log.querySelector('.g'); if (g) g.remove();
    log.querySelectorAll('.chips').forEach(c => c.remove());
    row('user').innerHTML = '<p>' + esc(q) + '<time>' + now() + '</time></p>'; toEnd(true); root.classList.add('busy');
    const c = row('bot'); const rs = document.createElement('div'); rs.className = 'qs'; c.appendChild(rs);
    await think(rs, plan(q));
    const a = answer(q);
    await stream(c, a.text); const lp0 = c.querySelector(':scope > p:last-of-type'); if (lp0) lp0.insertAdjacentHTML('beforeend', '<time>' + now() + '</time>'); root.classList.remove('busy');
    if (a.table) c.insertAdjacentHTML('beforeend', tableHTML(a.table));
    if (a.cards && a.cards.length) { c.insertAdjacentHTML('beforeend', '<div class="lks' + (a.cards.length === 1 ? ' one' : '') + '">' + a.cards.map(listing).join('') + '</div>');
      c.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { const id = b.dataset.view; if (LISTED.includes(id) && window.icOpenListing && window.icOpenListing(id)) return; lead(KB.find(x => x.id === id).n); });
      c.querySelectorAll('[data-sheet]').forEach(b => b.onclick = () => lead('Price sheet: ' + KB.find(x => x.id === b.dataset.sheet).n)); }
    if (a.chips) { const ch = document.createElement('div'); ch.className = 'chips'; ch.innerHTML = a.chips.map(x => '<button type="button">' + esc(x) + '</button>').join(''); c.appendChild(ch);
      ch.querySelectorAll('button').forEach(b => b.onclick = () => { const v = b.textContent;
        if (/talk to an advisor|price sheet/i.test(v)) return lead(q);
        if (/open the calculator/i.test(v)) { setOpen(false); ((document.getElementById('calc2') || document.getElementById('emi')) ? (document.getElementById('calc2') || document.getElementById('emi')).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }) : (location.href = BASE + '#calc2')); return; }
        input.value = v; send(); }); }
    if (a.form) setTimeout(() => lead(q), 500);
    busy = false; toEnd(true);
    /* after the first answer here, the conversation continues on the full page */
    if (!ON_AI && !handed && !a.form) { handed = true; const n = row('bot'); n.innerHTML = '<p class="iai-hand">Opening the full InvestoAI to continue…<i aria-hidden="true"></i></p>'; toEnd(true);
      setTimeout(() => { if (lp.hidden) goAI(q); else handed = false; }, reduce ? 600 : 2600); }
  }
  function tableHTML(rows) { const head = rows[0][0] === ''; return '<div class="tw"><table class="iai-t">' + rows.map((r, i) => '<tr>' + r.map((x, j) => (i === 0 && head) || j === 0 ? '<th>' + esc(x) + '</th>' : '<td>' + esc(x) + '</td>').join('') + '</tr>').join('') + '</table></div>'; }
  /* call-back sheet */
  const lp = $('iaiLead');
  function lead(q) { lp.hidden = false; $('ilQ').value = q || ''; $('ilName').focus(); }
  $('ilClose').onclick = () => { lp.hidden = true; input.focus(); };
  lp.querySelector('form').addEventListener('submit', e => {
    e.preventDefault(); const n = $('ilName'), ph = $('ilPhone'), err = $('ilErr'), digits = ph.value.replace(/\D/g, '');
    if (!n.value.trim()) { n.setAttribute('aria-invalid', true); err.textContent = 'Please add your name.'; n.focus(); return; }
    if (digits.length < 10) { ph.setAttribute('aria-invalid', true); err.textContent = 'Enter a 10-digit mobile number, with country code if outside India.'; ph.focus(); return; }
    n.removeAttribute('aria-invalid'); ph.removeAttribute('aria-invalid'); err.textContent = '';
    window.open(WA('InvestoAI enquiry\nName: ' + n.value.trim() + '\nPhone: ' + ph.value.trim() + '\nCity: ' + $('ilCity').value + '\nAbout: ' + ($('ilQ').value || '-')), '_blank', 'noopener');
    lp.hidden = true; const c = row('bot'); c.innerHTML = '<p>Thank you, ' + esc(n.value.trim().split(' ')[0]) + '. Your request is ready in WhatsApp; press send and an advisor will call you back.</p>'; toEnd(true);
  });
  const autosize = () => { input.style.height = 'auto'; input.style.height = Math.min(160, Math.max(56, input.scrollHeight)) + 'px'; };
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  form.addEventListener('submit', e => { e.preventDefault(); send(); });
  const ab = document.getElementById('aiBtn');
  if (ab) ab.addEventListener('click', e => { e.stopImmediatePropagation(); const qv = document.getElementById('q').value.trim(); goAI(qv || undefined); }, true);
  const ic = document.getElementById('iaChip');
  if (ic) ic.addEventListener('click', e => { e.stopImmediatePropagation(); goAI(); }, true);
  window.__iaiAnswer = answer;
  /* the same engine for the full-page InvestoAI (/ai/): answers, the steps it shows, and its project cards */
  window.InvestoAIEngine = { answer, plan, listing, project: id => KB.find(x => x.id === id), open: id => !!(LISTED.includes(id) && window.icOpenListing && window.icOpenListing(id)), WA };
})();
})();
