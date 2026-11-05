/* InvestoClub v5 — /projects/: search, filters, sort, pagination and collections over IC_DATA. */
(() => {
  const { A, D, I, esc, card, url, src, configShort } = IC
  const $ = (id) => document.getElementById(id)
  const reduce = IC.reduce, PER = 12

  /* header */
  const gB = $('gBurger'), gM = $('gMenu')
  gB.addEventListener('click', () => { const o = gB.getAttribute('aria-expanded') !== 'true'; gB.setAttribute('aria-expanded', o); gM.hidden = !o })
  $('toTop').addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) })

  /* ---------- menus, built from the inventory so nothing returns an empty result ---------- */
  const COLS = [['new', 'New launches'], ['pick', 'Investment picks'], ['brand', 'Branded'], ['ultra', '₹10 Cr+']]
  const BUDGETS = [['0-3', 'Under ₹3 Cr', 0, 3], ['3-5', '₹3 – 5 Cr', 3, 5], ['5-10', '₹5 – 10 Cr', 5, 10], ['10-20', '₹10 – 20 Cr', 10, 20], ['20-max', '₹20 Cr and above', 20, Infinity]]
  const SORTS = [['featured', 'Featured'], ['price-asc', 'Price — low to high'], ['price-desc', 'Price — high to low'], ['score', 'InvestoScore — highest first'], ['newest', 'Newest launches'], ['name', 'Name — A to Z']]
  const count = (fn) => A.filter(fn).length
  const devName = (slug) => (IC.devOf(slug) || {}).name || (A.find((p) => p.developerSlug === slug) || {}).developer || slug
  const locName = (slug) => (D.locations.find((l) => l.slug === slug) || {}).name || (A.find((p) => p.locationSlug === slug) || {}).location || slug
  const opt = (v, t, n) => '<option value="' + esc(v) + '">' + esc(t) + (n != null ? ' (' + n + ')' : '') + '</option>'
  const MENUS = {
    dev: () => [...new Set(A.map((p) => p.developerSlug))].sort((a, b) => devName(a).localeCompare(devName(b))).map((s) => opt(s, devName(s), count((p) => p.developerSlug === s))).join(''),
    loc: () => [...new Set(A.map((p) => p.city))].sort((a, b) => count((p) => p.city === b) - count((p) => p.city === a)).map((c) => {
      const areas = [...new Set(A.filter((p) => p.city === c).map((p) => p.locationSlug))].sort((a, b) => locName(a).localeCompare(locName(b)))
      return '<optgroup label="' + esc(c) + '">' + opt('city:' + c, 'All of ' + c, count((p) => p.city === c)) +
        (areas.length > 1 || locName(areas[0]) !== c ? areas.map((s) => opt('area:' + s, locName(s), count((p) => p.locationSlug === s))).join('') : '') + '</optgroup>'
    }).join(''),
    budget: () => BUDGETS.filter((b) => A.some((p) => p.priceFromCr !== null && p.priceFromCr >= b[2] && p.priceFromCr <= b[3])).map((b) => opt(b[0], b[1])).join(''),
    col: () => COLS.filter(([k]) => A.some((p) => p.cats.includes(k))).map(([k, t]) => opt(k, t, count((p) => p.cats.includes(k)))).join(''),
    cat: () => [...new Set(A.map((p) => p.category))].sort().map((c) => opt(c, c, count((p) => p.category === c))).join(''),
    cfg: () => [...new Set(A.flatMap((p) => p.configurations))].sort((a, b) => (parseFloat(a) || 99) - (parseFloat(b) || 99) || a.localeCompare(b)).map((c) => opt(c, c, count((p) => p.configurations.includes(c)))).join(''),
    status: () => [...new Set(A.map((p) => p.status))].map((s) => opt(s, s, count((p) => p.status === s))).join(''),
    sort: () => SORTS.map(([v, t]) => opt(v, t)).join(''),
  }
  const LABEL = { dev: 'Developer', loc: 'Location', budget: 'Starting price', col: 'Collection', cat: 'Property type', cfg: 'Configuration', status: 'Project status' }
  const ANY = { dev: 'All developers', loc: 'All locations', budget: 'Any budget', col: 'All collections', cat: 'All types', cfg: 'Any configuration', status: 'Any status' }
  document.querySelectorAll('select[data-f]').forEach((s) => { s.insertAdjacentHTML('beforeend', MENUS[s.dataset.f]()) })
  $('dwBody').innerHTML = ['dev', 'loc', 'budget', 'col', 'cat', 'cfg', 'status'].map((k) =>
    '<div class="fld"><label for="d_' + k + '">' + LABEL[k] + '</label><select id="d_' + k + '" data-f="' + k + '"><option value="">' + ANY[k] + '</option>' + MENUS[k]() + '</select></div>').join('') +
    '<div class="fld"><span class="pj-k" style="font-size:11px;margin-bottom:4px">Investment category</span><div class="fb-seg" role="group" aria-label="Investment category" style="padding:0;flex-wrap:wrap" id="dType">' +
    [['', 'All projects'], ['Residential', 'Residential'], ['Commercial', 'Commercial']].map(([v, t]) => '<button type="button" data-type="' + v + '" aria-pressed="' + !v + '">' + t + '</button>').join('') + '</div></div>'

  /* ---------- state ---------- */
  const KEYS = ['q', 'dev', 'loc', 'budget', 'col', 'cat', 'cfg', 'status', 'type', 'sort']
  const st = {}
  const fromURL = () => {
    const u = new URLSearchParams(location.search)
    KEYS.forEach((k) => (st[k] = u.get(k) || ''))
    if (!st.sort) st.sort = 'featured'
    // Older links used ?cat= for the homepage collections.
    if (COLS.some(([k]) => k === st.cat)) { st.col = st.cat; st.cat = '' }
    st.page = Math.max(1, parseInt(u.get('page'), 10) || 1)
  }
  const toURL = (push) => {
    const u = new URLSearchParams()
    KEYS.forEach((k) => { if (st[k] && !(k === 'sort' && st[k] === 'featured')) u.set(k, st[k]) })
    if (st.page > 1) u.set('page', st.page)
    const next = location.pathname + (u.toString() ? '?' + u : '')
    if (next !== location.pathname + location.search) history[push ? 'pushState' : 'replaceState'](null, '', next)
  }

  const norm = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const rank = { 'New Launch': 0, 'Launching Soon': 1, 'Under Construction': 2, 'Ready to Move': 3 }
  const results = () => {
    const q = norm(st.q.trim()), band = BUDGETS.find((b) => b[0] === st.budget)
    let L = A.filter((p) =>
      (!q || norm([p.name, p.developer, p.sector, p.location, p.city, p.category, p.configLabel].join(' ')).includes(q)) &&
      (!st.dev || p.developerSlug === st.dev) &&
      (!st.loc || (st.loc.startsWith('city:') ? IC.inMarket(p, st.loc.slice(5)) : p.locationSlug === st.loc.slice(5))) &&
      // A project with no published price is never hidden by a budget band — it may sit inside it.
      (!band || p.priceFromCr === null || (p.priceFromCr >= band[2] && p.priceFromCr <= band[3])) &&
      (!st.col || p.cats.includes(st.col)) && (!st.cat || p.category === st.cat) &&
      (!st.cfg || p.configurations.includes(st.cfg)) && (!st.status || p.status === st.status) && (!st.type || p.type === st.type))
    const pr = (p) => p.priceFromCr
    if (st.sort === 'price-asc') L.sort((a, b) => (pr(a) ?? 1e9) - (pr(b) ?? 1e9))
    else if (st.sort === 'price-desc') L.sort((a, b) => (pr(b) ?? -1) - (pr(a) ?? -1))
    else if (st.sort === 'score') L.sort((a, b) => (b.score || 0) - (a.score || 0) || Number(b.featured) - Number(a.featured))
    else if (st.sort === 'newest') L.sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9))
    else if (st.sort === 'name') L.sort((a, b) => a.name.localeCompare(b.name))
    else L.sort((a, b) => Number(b.home) - Number(a.home) || Number(b.featured) - Number(a.featured))
    return L
  }
  const filtering = () => KEYS.some((k) => k !== 'sort' && st[k])

  /* ---------- render ---------- */
  const grid = $('grid'), pgn = $('pgn'), chips = $('fChips')
  /* grid or list layout — presentation only, remembered on this device */
  const setView = (v) => {
    grid.classList.toggle('is-list', v === 'list')
    document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === v))
    try { localStorage.setItem('ic-view', v) } catch (e) {}
  }
  try { if (localStorage.getItem('ic-view') === 'list') setView('list') } catch (e) {}
  /* the filter bar gains a hairline once it is pinned under the header */
  const bar = $('lxBar')
  if (bar && 'IntersectionObserver' in window) {
    const s = document.createElement('div'); s.style.cssText = 'position:absolute;height:1px;width:1px'; bar.before(s)
    new IntersectionObserver(([e]) => bar.classList.toggle('pinned', !e.isIntersecting), { rootMargin: '-77px 0px 0px 0px' }).observe(s)
  }
  IC.bind(grid); IC.wireImages(grid)
  const labelOf = (k, v) => {
    if (k === 'q') return '“' + v + '”'
    if (k === 'type') return v
    const o = document.querySelector('#f' + { dev: 'Dev', loc: 'Loc', budget: 'Bud', col: 'Col', cat: 'Cat', cfg: 'Cfg', status: 'St' }[k] + ' option[value="' + CSS.escape(v) + '"]')
    return o ? o.textContent.replace(/ \(\d+\)$/, '').replace(/^All of /, '') : v.replace(/^(city|area):/, '')
  }
  /* A market with nothing on the public list: say how the desk handles it, not "no results". */
  const PRIVATE = {
    Delhi: 'In Delhi, luxury is mostly independent floors and bungalows in South Delhi (Golf Links, Vasant Vihar, Defence Colony, Greater Kailash) rather than towers. Our desk sources these privately.',
  }
  const NOT_COVERED = ['Goa', 'Bangalore', 'Bengaluru']
  const emptyBox = $('empty'), emptyH = emptyBox.querySelector('h2'), emptyP = emptyBox.querySelector('p'), emptyDefault = [emptyH.textContent, emptyP.textContent]
  const emptyFor = (m) => {
    if (NOT_COVERED.includes(m)) { emptyH.textContent = 'We don\'t cover ' + m; emptyP.textContent = 'InvestoClub currently advises on Gurgaon, Noida, Delhi and Mumbai.'; return }
    const t = PRIVATE[m]
    emptyH.textContent = t ? m + ' is shared privately' : emptyDefault[0]
    emptyP.textContent = t || emptyDefault[1]
  }
  /* a market from the homepage (city:Goa) gets its own entry in the location menus */
  const loc0 = new URLSearchParams(location.search).get('loc')
  if (loc0 && loc0.startsWith('city:')) document.querySelectorAll('select[data-f="loc"]').forEach((s) => {
    if (![...s.options].some((o) => o.value === loc0)) s.insertAdjacentHTML('afterbegin', '<option value="' + esc(loc0) + '">' + esc(loc0.slice(5)) + '</option>')
  })
  function render(anim) {
    const L = results(), pages = Math.max(1, Math.ceil(L.length / PER))
    st.page = Math.min(st.page, pages)
    const view = L.slice((st.page - 1) * PER, st.page * PER)
    grid.innerHTML = view.map(card).join('')
    grid.hidden = !L.length; $('empty').hidden = !!L.length
    emptyFor(st.loc.startsWith('city:') ? st.loc.slice(5) : '')
    IC.wireImages(grid)
    if (anim && !reduce) [...grid.children].forEach((c, i) => { c.classList.add('enter'); c.style.setProperty('--dl', i * 0.04 + 's') })
    // controls mirror the state
    document.querySelectorAll('select[data-f]').forEach((s) => { s.value = st[s.dataset.f] || (s.dataset.f === 'sort' ? 'featured' : ''); s.classList.toggle('set', !!st[s.dataset.f] && s.dataset.f !== 'sort') })
    $('fQ').value = $('mQ').value = st.q
    document.querySelectorAll('[data-type]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.type === st.type))
    document.querySelectorAll('[data-col]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.col === st.col))
    const active = KEYS.filter((k) => k !== 'sort' && st[k])
    const hidden = ['col', 'cat', 'cfg', 'status', 'type'].filter((k) => st[k]).length
    $('fMoreN').textContent = hidden || ''
    $('mN').textContent = active.filter((k) => k !== 'q').length ? '(' + active.filter((k) => k !== 'q').length + ')' : ''
    $('dwN').textContent = L.length
    chips.innerHTML = (active.length ? '<p class="fb-count"><b>' + L.length + '</b> ' + (L.length === 1 ? 'match' : 'matches') + '</p>' : '') +
      active.map((k) => '<button type="button" class="fb-chip" data-x="' + k + '" aria-label="Remove filter: ' + esc(labelOf(k, st[k])) + '">' + esc(labelOf(k, st[k])) + I.x + '</button>').join('') +
      (active.length ? '<button type="button" class="fb-clear" data-x="all">Clear all</button>' : '')
    // pagination: current page, its neighbours and both ends
    if (pages > 1) {
      const keep = [...new Set([1, pages, st.page - 1, st.page, st.page + 1])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
      let nums = ''; keep.forEach((n, i) => { if (i && n - keep[i - 1] > 1) nums += '<span class="gap" aria-hidden="true">…</span>'; nums += '<button type="button" data-pg="' + n + '" aria-label="Page ' + n + '"' + (n === st.page ? ' aria-current="page"' : '') + '>' + n + '</button>' })
      pgn.innerHTML = '<p>Page <b>' + st.page + '</b> of ' + pages + '</p><div class="pgn-n">' +
        '<button type="button" class="step" data-pg="' + (st.page - 1) + '"' + (st.page === 1 ? ' disabled' : '') + ' aria-label="Previous page">' + I.left + '<span>Previous</span></button>' + nums +
        '<button type="button" class="step" data-pg="' + (st.page + 1) + '"' + (st.page === pages ? ' disabled' : '') + ' aria-label="Next page"><span>Next</span>' + I.arrow + '</button></div>'
      pgn.hidden = false
    } else pgn.hidden = !L.length, (pgn.innerHTML = '')
    $('collections').hidden = filtering()
    IC.syncCmp()
  }
  const set = (k, v, push) => { st[k] = v; st.page = 1; toURL(push); render(true) }
  const clearAll = () => { KEYS.forEach((k) => { if (k !== 'sort') st[k] = '' }); st.page = 1; toURL(true); render(true) }
  const toResults = () => { const top = $('results').getBoundingClientRect().top + scrollY - 70; scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' }) }

  /* ---------- events ---------- */
  document.addEventListener('change', (e) => { const s = e.target.closest('select[data-f]'); if (s) set(s.dataset.f, s.value === 'featured' && s.dataset.f === 'sort' ? 'featured' : s.value) })
  let qt; const onQ = (e) => { clearTimeout(qt); qt = setTimeout(() => set('q', e.target.value.trim()), 180) }
  $('fQ').addEventListener('input', onQ); $('mQ').addEventListener('input', onQ)
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-type]'); if (t) set('type', t.dataset.type)
    const c = e.target.closest('[data-col]'); if (c) set('col', c.dataset.col)
    const v = e.target.closest('[data-view]'); if (v) setView(v.dataset.view)
    const x = e.target.closest('[data-x]'); if (x) x.dataset.x === 'all' ? clearAll() : set(x.dataset.x, '')
    const pg = e.target.closest('[data-pg]'); if (pg && !pg.disabled) { st.page = +pg.dataset.pg; toURL(true); render(true); toResults() }
    const go = e.target.closest('[data-set]'); if (go) { e.preventDefault(); const [k, v] = go.dataset.set.split('='); KEYS.forEach((kk) => { if (kk !== 'sort') st[kk] = '' }); st[k] = v; st.page = 1; toURL(true); render(true); toResults() }
  })
  $('reset').addEventListener('click', clearAll)
  const more = $('fMore'), xp = $('fX')
  more.addEventListener('click', () => { const o = more.getAttribute('aria-expanded') !== 'true'; more.setAttribute('aria-expanded', o); xp.classList.toggle('open', o); xp.firstElementChild.inert = !o })
  addEventListener('popstate', () => { fromURL(); render(false) })

  /* drawer */
  const dw = $('dw')
  const openDw = (o) => { dw.classList.toggle('open', o); dw.setAttribute('aria-hidden', !o); dw.inert = !o; document.documentElement.classList.toggle('lock', o); if (o) setTimeout(() => dw.querySelector('select').focus(), 60); else $('mOpen').focus({ preventScroll: true }) }
  $('mOpen').addEventListener('click', () => openDw(true))
  dw.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) openDw(false) })
  $('dwClear').addEventListener('click', clearAll)
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && dw.classList.contains('open')) openDw(false) })

  /* ---------- collections ---------- */
  const firstSentences = (t, n) => String(t).split(/(?<=[.!?])\s+(?=[A-Z])/).slice(0, n).join(' ')
  const fromPrice = (L) => { const v = L.map((p) => p.priceFromCr).filter((x) => x !== null); return v.length ? '₹' + Math.min(...v).toFixed(2).replace(/\.00$/, '') + ' Cr*' : null }
  const ph = (p, i) => (p.photos[i || 0] ? src(p.photos[i || 0]) : null)

  // Featured: the best-documented projects in the portfolio.
  const picks = A.filter((p) => p.photos.length >= 3 && p.priceFromCr !== null).sort((a, b) => b.photos.length - a.photos.length || (b.priceFromCr || 0) - (a.priceFromCr || 0)).slice(0, 3)
  if (picks.length) {
    const [lead, ...rest] = picks
    $('featured').innerHTML = '<div class="v-wrap"><div class="cl-h"><h2 id="ftH">Featured projects</h2><p>Chosen from the portfolio for the depth of their published detail and photography.</p></div>' +
      '<div class="ft-lead"><a class="ft-ph" href="' + url(lead) + '" aria-label="View ' + esc(lead.name) + '"><img class="a" src="' + ph(lead) + '" alt="' + esc(lead.name + ', ' + lead.sector) + '" loading="lazy" />' + (ph(lead, 1) ? '<img class="b" src="' + ph(lead, 1) + '" alt="" aria-hidden="true" loading="lazy" />' : '') + '</a>' +
      '<div class="ft-txt"><p class="pj-dev">' + esc(lead.developer) + '</p><h3><a href="' + url(lead) + '">' + esc(lead.name) + '</a></h3><p class="ft-loc">' + I.pin + esc(lead.sector) + '</p>' +
      '<p class="d">' + esc(firstSentences(lead.description || lead.highlights.join('. '), 2)) + '</p>' +
      '<dl class="ft-dl"><div><dt>Configuration</dt><dd>' + esc(configShort(lead.configurations)) + '</dd></div><div><dt>Area</dt><dd>' + esc(lead.area) + '</dd></div><div><dt>Status</dt><dd>' + esc(lead.status) + '</dd></div><div><dt>Possession</dt><dd>' + esc(lead.possession) + '</dd></div></dl>' +
      '<div class="ft-cta"><div><span class="pj-k">Starting price</span><b>' + esc(lead.priceLabel) + '</b></div><a class="v-btn light" href="' + url(lead) + '">View project ' + I.arrow + '</a></div></div></div>' +
      (rest.length ? '<div class="ft-rest">' + rest.map((p) => '<a class="ft-mini" href="' + url(p) + '"><div class="ph"><img src="' + ph(p) + '" alt="' + esc(p.name) + '" loading="lazy" /></div><div><p class="pj-dev">' + esc(p.developer) + '</p><p class="n">' + esc(p.name) + '</p><p class="l">' + esc(p.sector) + '</p><p class="p">' + esc(p.priceLabel) + '</p></div></a>').join('') + '</div>' : '') + '</div>'
  } else $('featured').remove()

  // Developers: the named houses first, then others with more than one project.
  const PRIORITY = ['hoabl', 'godrej-properties', 'dlf', 'm3m', 'signature-global']
  const devCounts = {}; A.forEach((p) => (devCounts[p.developerSlug] = (devCounts[p.developerSlug] || 0) + 1))
  const devList = [...PRIORITY.filter((s) => devCounts[s]), ...Object.keys(devCounts).filter((s) => !PRIORITY.includes(s) && devCounts[s] >= 2).sort((a, b) => devCounts[b] - devCounts[a])].slice(0, 9)
  const devPanel = (slug) => {
    const d = IC.devOf(slug) || { name: devName(slug), tagline: '', description: '' }
    const theirs = A.filter((p) => p.developerSlug === slug).sort((a, b) => Number(b.home) - Number(a.home) || b.photos.length - a.photos.length)
    const where = [...new Set(theirs.map((p) => p.city))].join(', ') + ' — ' + [...new Set(theirs.map((p) => p.location))].slice(0, 3).join(', ')
    return '<div class="dc-p" id="dcPanel" role="tabpanel" aria-labelledby="dc-' + slug + '">' +
      (d.tagline ? '<p class="tl">' + esc(d.tagline) + '</p>' : '') + (d.description ? '<p class="ds">' + esc(d.description) + '</p>' : '') +
      '<dl class="dc-dl"><div><dt>Projects with us</dt><dd>' + theirs.length + '</dd></div><div><dt>Starting from</dt><dd>' + (fromPrice(theirs) || 'On request') + '</dd></div><div><dt>Where</dt><dd class="s">' + esc(where) + '</dd></div></dl>' +
      '<div class="dc-row">' + theirs.slice(0, 3).map((p) => '<a class="dc-it" href="' + url(p) + '"><div class="ph">' + (ph(p) ? '<img src="' + ph(p) + '" alt="' + esc(p.name) + '" loading="lazy" />' : '') + '</div><p class="n">' + esc(p.name) + '</p><p class="l">' + esc(p.sector) + '</p><p class="p">' + esc(p.priceLabel) + '</p></a>').join('') + '</div>' +
      '<div class="dc-cta"><a class="v-btn" href="?dev=' + slug + '" data-set="dev=' + slug + '">Show all ' + theirs.length + ' ' + esc(d.name) + ' ' + (theirs.length === 1 ? 'project' : 'projects') + '</a></div></div>'
  }
  if (devList.length) {
    $('developers').innerHTML = '<div class="v-wrap"><div class="cl-h"><h2 id="dcH">By developer</h2><p>The houses behind the portfolio, with the projects we represent for each.</p></div>' +
      '<div class="dc"><div class="dc-tabs" role="tablist" aria-label="Developers" aria-orientation="vertical">' +
      devList.map((s, i) => '<button type="button" role="tab" id="dc-' + s + '" data-dev="' + s + '" aria-selected="' + !i + '" aria-controls="dcPanel" tabindex="' + (i ? -1 : 0) + '"><span>' + esc(devName(s)) + '</span><small>' + devCounts[s] + '</small></button>').join('') +
      '</div><div id="dcWrap">' + devPanel(devList[0]) + '</div></div></div>'
    const tabs = [...document.querySelectorAll('[data-dev]')]
    const pick = (b) => { tabs.forEach((x) => { x.setAttribute('aria-selected', x === b); x.tabIndex = x === b ? 0 : -1 }); $('dcWrap').innerHTML = devPanel(b.dataset.dev) }
    tabs.forEach((b, i) => {
      b.addEventListener('click', () => pick(b))
      b.addEventListener('keydown', (e) => { if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return; e.preventDefault(); const n = tabs[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); pick(n) })
    })
  } else $('developers').remove()

  // Markets: every city in the data, then its corridors.
  const cities = [...new Set(A.map((p) => p.city))].sort((a, b) => count((p) => p.city === b) - count((p) => p.city === a))
  $('markets').innerHTML = '<div class="v-wrap"><div class="cl-h"><h2 id="mkH">By market</h2><p>Where the portfolio sits, city by city and corridor by corridor.</p></div>' +
    cities.map((c) => {
      const here = A.filter((p) => p.city === c)
      const areas = [...new Set(here.map((p) => p.locationSlug))].map((s) => { const inA = here.filter((p) => p.locationSlug === s); const loc = D.locations.find((l) => l.slug === s); return { s, name: locName(s), n: inA.length, lead: inA.find((p) => p.photos.length) || inA[0], tl: loc && loc.tagline, from: fromPrice(inA) } }).sort((a, b) => b.n - a.n)
      return '<div class="mk-city"><div class="mk-city-h"><h3>' + esc(c) + '</h3><a class="v-link" href="?loc=city:' + encodeURIComponent(c) + '" data-set="loc=city:' + esc(c) + '">All ' + here.length + ' in ' + esc(c) + ' ' + I.arrow + '</a></div><div class="mk-grid">' +
        areas.map((a, i) => '<a class="mk-it' + (i === 0 && areas.length > 3 ? ' big' : '') + '" href="?loc=area:' + a.s + '" data-set="loc=area:' + a.s + '"><div class="ph">' + (ph(a.lead) ? '<img src="' + ph(a.lead) + '" alt="' + esc(a.name) + '" loading="lazy" />' : '') + '</div>' +
          '<div class="r"><p>' + esc(a.name) + '</p><span>' + a.n + ' ' + (a.n === 1 ? 'project' : 'projects') + '</span></div>' + (a.tl ? '<p class="t">' + esc(a.tl) + '</p>' : '') + (a.from ? '<p class="f">From ' + a.from + '</p>' : '') + '</a>').join('') + '</div></div>'
    }).join('') + '</div>'

  fromURL(); toURL(false); render(false)
})()
