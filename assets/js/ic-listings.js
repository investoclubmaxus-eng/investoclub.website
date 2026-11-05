/* InvestoClub v5 — project card, shortlist and compare, shared by the homepage, /projects/ and
   every project page. Reads window.IC_DATA (assets/js/ic-data.js). Set window.IC_BASE first:
   '' on the homepage, '../' on /projects/, '../../' on a project page. */
(function () {
  const D = window.IC_DATA || { projects: [], developers: [], locations: [] }
  const BASE = window.IC_BASE || ''
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const WA = (t) => 'https://wa.me/917292002003?text=' + encodeURIComponent(t)
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

  /* Lucide icons, 1.5 stroke */
  const ic = (d, cls) => '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'
  const I = {
    arrow: ic('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
    left: ic('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'),
    pin: ic('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
    heart: ic('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'),
    share: ic('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>', 'ic-s'),
    cmp: ic('<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/>', 'ic-s'),
    x: ic('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    plus: ic('<path d="M5 12h14"/><path d="M12 5v14"/>'),
    images: ic('<rect width="18" height="18" x="3" y="3" rx="1"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>'),
    sliders: ic('<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>'),
    search: ic('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    ext: ic('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
    phone: ic('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
    chat: ic('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
    building: ic('<rect width="16" height="20" x="4" y="2" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>'),
    dumbbell: ic('<path d="M14.4 14.4 9.6 9.6"/><path d="M18.66 21.51a2 2 0 1 1-2.83-2.83l-1.77 1.77a2 2 0 1 1-2.83-2.83l6.37-6.37a2 2 0 1 1 2.83 2.83l-1.77 1.77a2 2 0 1 1 2.83 2.83z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.4 12.77a2 2 0 1 1-2.83-2.83l1.77-1.77a2 2 0 1 1-2.83-2.83l2.83-2.83a2 2 0 1 1 2.83 2.83l1.77-1.77a2 2 0 1 1 2.83 2.83z"/>'),
    waves: ic('<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>'),
    trees: ic('<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>'),
    shield: ic('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'),
    car: ic('<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>'),
    sparkle: ic('<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>'),
    chev: ic('<path d="m9 18 6-6-6-6"/>'),
  }

  const A = D.projects
  const HOME = A.filter((p) => p.home)
  const bySlug = (s) => A.find((p) => p.slug === s || p.id === s)
  const devOf = (slug) => D.developers.find((d) => d.slug === slug)
  /* Opened straight from disk (file://), a folder link shows a file list instead of the page,
     so links get an explicit index.html there. On the server the clean URL is kept. */
  const LOCAL = typeof location !== 'undefined' && location.protocol === 'file:'
  const url = (p) => BASE + 'projects/' + p.slug + '/' + (LOCAL ? 'index.html' : '')
  const fixLocalLinks = (root) => {
    if (!LOCAL) return
    root.querySelectorAll('a[href]').forEach((a) => {
      const h = a.getAttribute('href')
      if (/^[a-z]+:/i.test(h) || h.startsWith('#')) return
      const m = h.match(/^([^?#]*)(.*)$/)
      if (m[1] === '' && m[2].startsWith('?')) a.setAttribute('href', 'index.html' + m[2])
      else if (m[1].endsWith('/')) a.setAttribute('href', m[1] + 'index.html' + m[2])
    })
  }
  if (LOCAL && typeof document !== 'undefined') {
    const run = () => { fixLocalLinks(document); new MutationObserver(() => fixLocalLinks(document)).observe(document.body, { childList: true, subtree: true }) }
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run()
  }
  const src = (path) => (/^https?:/.test(path) ? path : BASE + path)
  /* "3 & 4 BHK", or "3 & 4 BHK + more" where other formats are offered too */
  const configShort = (list) => {
    const l = (list || []).filter(Boolean)
    if (!l.length) return 'On request'
    const bhk = [...new Set(l.map((c) => (c.match(/^(\d+(?:\.\d+)?) BHK$/) || [])[1]).filter(Boolean))].sort((a, b) => a - b)
    const other = l.filter((c) => !/^\d+(?:\.\d+)? BHK$/.test(c))
    if (!bhk.length) return other.slice(0, 2).join(', ') + (other.length > 2 ? ' + more' : '')
    const b = (bhk.length > 1 ? bhk.slice(0, -1).join(', ') + ' & ' + bhk[bhk.length - 1] : bhk[0]) + ' BHK'
    return other.length ? b + (other.length === 1 ? ' + ' + other[0] : ' + more') : b
  }
  /* The homepage speaks of six markets; the data records the city on the RERA filing.
     A market covers these data cities (Alibaug is Mumbai's second-home market). */
  const MARKETS = { Gurgaon: ['Gurugram', 'Gurgaon'], Noida: ['Noida', 'Greater Noida'], Delhi: ['Delhi', 'New Delhi'], Mumbai: ['Mumbai', 'Alibaug'] }
  const inMarket = (p, m) => (MARKETS[m] || [m]).includes(p.city)
  /* official developer logos held in assets/developers/<slug>.png (black on transparent) */
  const LOGOS = ['adani', 'anant-raj', 'dalcore', 'elan', 'mvn-infrastructure', 'pioneer-urban', 'tribeca', 'birla-estates', 'central-park', 'conscient', 'dlf', 'eldeco-group', 'experion', 'godrej-properties', 'hero-homes', 'hoabl', 'kreeva', 'm3m', 'mahindra', 'max-estates', 'oberoi-realty', 'paras-buildtech', 'shapoorji-pallonji', 'signature-global', 'silverglades', 'sobha', 'suncity-projects', 'tarc', 'whiteland']
  const logoOf = (slug) => (LOGOS.includes(slug) ? BASE + 'assets/developers/' + slug + '.png' : null)
  const devMark = (p, cls) => { const l = logoOf(p.developerSlug); return l ? '<img class="' + cls + '" src="' + l + '" alt="' + esc(p.developer) + '" loading="lazy" />' : '' }
  const tagOf = (p) => (p.home ? p.badge : [p.status, p.status === 'New Launch' ? 'new' : 'lux'])

  /* ---------- card ---------- */
  let liked = new Set()
  try { liked = new Set(JSON.parse(localStorage.getItem('ic-liked') || '[]')) } catch (e) {}
  let cmp = []
  try { cmp = JSON.parse(sessionStorage.getItem('ic-cmp') || '[]').filter(bySlug) } catch (e) {}

  /* Photo-first card: the photograph carries the card, with three short lines laid over it
     (after Chawla / Legacy Sotheby's listings). Save and compare sit quietly in the corner. */
  function card(p) {
    const lk = liked.has(p.slug), inCmp = cmp.includes(p.slug), t = tagOf(p)
    const a = p.photos[0], b = p.photos[1]
    const specs = [configShort(p.configurations), p.area].filter((x) => x && x !== 'On request')
    return '<article class="pj" role="listitem" data-slug="' + p.slug + '">' +
      '<figure class="pj-fig">' +
        (a ? '<img class="a" src="' + src(a) + '" alt="' + esc(p.name + ', ' + p.sector) + '" loading="lazy" decoding="async" width="1200" height="900" />' : '') +
        (b ? '<img class="b" src="' + src(b) + '" alt="" aria-hidden="true" loading="lazy" decoding="async" />' : '') +
      '</figure>' +
      '<span class="pj-tag">' + esc(t[0]) + '</span>' +
      '<div class="pj-tools">' +
        '<button type="button" class="pj-share" aria-label="Share ' + esc(p.name) + '" title="Share">' + I.share + '</button>' +
        '<button type="button" class="pj-cmp" aria-pressed="' + inCmp + '" aria-label="' + (inCmp ? 'Remove ' : 'Compare ') + esc(p.name) + '" title="Compare">' + I.cmp + '</button>' +
        '<button type="button" class="pj-heart' + (lk ? ' on' : '') + '" aria-pressed="' + lk + '" aria-label="Save ' + esc(p.name) + '" title="Save">' + I.heart + '</button>' +
      '</div>' +
      '<div class="pj-cap">' +
        '<div class="pj-row">' +
          (logoOf(p.developerSlug) ? '<p class="pj-dev has-logo">' + devMark(p, 'pj-logo') + '</p>' : '<p class="pj-dev">' + esc(p.developer) + '</p>') +
          (p.score ? '<span class="pj-score" title="InvestoScore: InvestoClub’s own rating of location, developer, pricing and resale liquidity"><span class="orb2" aria-hidden="true"></span><b>' + p.score.toFixed(1) + '</b><small>InvestoScore</small></span>' : '') +
        '</div>' +
        '<h3 class="pj-name"><a href="' + url(p) + '">' + esc(p.name) + '</a></h3>' +
        '<p class="pj-loc">' + esc(p.sector) + '</p>' +
        '<p class="pj-meta">' + specs.map((s) => '<span>' + esc(s) + '</span>').join('') + '<span class="pj-pr">' + (p.priceFromCr ? 'From ' + esc(p.priceLabel) : 'Price on request') + '</span></p>' +
      '</div></article>'
  }
  function wireImages(root) {
    root.querySelectorAll('.pj-fig:not(.ld)').forEach((f) => {
      const im = f.querySelector('img.a')
      if (!im) return f.classList.add('ld')
      const done = () => f.classList.add('ld')
      if (im.complete && im.naturalWidth) done()
      else { im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }) }
    })
  }

  /* ---------- tray, compare dialog, toast ---------- */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e }
  let tray, cmpDlg, toastEl, tt
  function ensureUI() {
    if (tray || typeof document === 'undefined' || !document.body) return
    cmpDlg = el('dialog', 'dl'); cmpDlg.setAttribute('aria-label', 'Compare projects')
    tray = el('div', 'tray', '<div class="tray-th"></div><span class="tray-t" aria-live="polite"></span><button type="button" class="clr">Clear</button><button type="button" class="go">Compare ' + I.arrow + '</button>'); tray.hidden = true
    toastEl = el('div', 'toast'); toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite')
    document.body.append(cmpDlg, tray, toastEl)
    cmpDlg.addEventListener('click', (e) => { if (e.target === cmpDlg) cmpDlg.close() })
    tray.querySelector('.clr').onclick = () => { cmp = []; syncCmp() }
    tray.querySelector('.go').onclick = openCompare
  }
  const toast = (m) => { ensureUI(); toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2200) }
  function syncCmp() {
    ensureUI()
    try { sessionStorage.setItem('ic-cmp', JSON.stringify(cmp)) } catch (e) {}
    document.querySelectorAll('[data-slug]').forEach((c) => { const b = c.querySelector('.pj-cmp,[data-cmp]'); if (b) b.setAttribute('aria-pressed', cmp.includes(c.dataset.slug)) })
    tray.hidden = !cmp.length
    tray.querySelector('.tray-th').innerHTML = cmp.map((s) => { const p = bySlug(s); return p.photos[0] ? '<img src="' + src(p.photos[0]) + '" alt="" />' : '' }).join('')
    tray.querySelector('.tray-t').textContent = cmp.length === 1 ? '1 selected · add one more' : cmp.length + ' selected'
    tray.querySelector('.go').disabled = cmp.length < 2
  }
  function toggleCompare(slug) {
    const i = cmp.indexOf(slug)
    if (i >= 0) cmp.splice(i, 1)
    else if (cmp.length >= 3) return toast('Compare up to 3 projects')
    else cmp.push(slug)
    syncCmp()
  }
  function toggleSave(slug, btn) {
    const on = !liked.has(slug); on ? liked.add(slug) : liked.delete(slug)
    try { localStorage.setItem('ic-liked', JSON.stringify([...liked])) } catch (e) {}
    if (btn) { btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on) }
    toast(on ? 'Saved to your shortlist' : 'Removed from shortlist')
    return on
  }
  function openCompare() {
    const L = cmp.map(bySlug), row = (k, f) => '<tr><th scope="row">' + k + '</th>' + L.map((p) => '<td>' + f(p) + '</td>').join('') + '</tr>'
    cmpDlg.innerHTML = '<div class="dl-cmp"><h3>Compare projects</h3><div class="dl-scroll"><table class="dl-tbl"><thead><tr><th></th>' +
      L.map((p) => '<th scope="col">' + (p.photos[0] ? '<img src="' + src(p.photos[0]) + '" alt="" />' : '') + '<b><a href="' + url(p) + '" style="color:inherit">' + esc(p.name) + '</a></b></th>').join('') + '</tr></thead><tbody>' +
      row('Starting price', (p) => esc(p.priceLabel)) + row('Location', (p) => esc(p.sector)) + row('Developer', (p) => esc(p.developer)) + row('Homes', (p) => esc(p.configLabel)) +
      row('Area', (p) => esc(p.area)) + row('Status', (p) => esc(p.status)) + row('Possession', (p) => esc(p.possession)) +
      row('InvestoScore', (p) => (p.score ? p.score.toFixed(1) + ' / 5' : '—')) + row('RERA', (p) => (p.rera ? esc(p.rera) : 'Not published')) +
      '</tbody></table></div><div class="dl-cta"><a class="v-btn" target="_blank" rel="noopener" href="' + WA('Please compare these for me: ' + L.map((p) => p.name).join(', ') + '.') + '">Get an advisor’s comparison ' + I.arrow + '</a></div></div><button type="button" class="dl-x" aria-label="Close">' + I.x + '</button>'
    cmpDlg.querySelector('.dl-x').onclick = () => cmpDlg.close()
    cmpDlg.showModal()
  }

  /* share: the phone's share sheet where there is one, otherwise copy the link */
  async function share(p) {
    if (!p) return
    const link = new URL(url(p).replace(/index\.html$/, ''), location.href).href
    const text = p.name + ', ' + p.sector + ' — ' + (p.priceFromCr ? 'from ' + p.priceLabel : 'price on request')
    if (navigator.share) { try { await navigator.share({ title: p.name, text, url: link }) } catch (e) {} return }
    try { await navigator.clipboard.writeText(link); toast('Link copied') } catch (e) { window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + link), '_blank', 'noopener') }
  }

  /* one delegated handler per container of cards */
  function bind(root) {
    ensureUI()
    root.addEventListener('click', (e) => {
      const c = e.target.closest('.pj'); if (!c) return
      const heart = e.target.closest('.pj-heart'), cb = e.target.closest('.pj-cmp'), sh = e.target.closest('.pj-share')
      if (sh) { e.preventDefault(); share(bySlug(c.dataset.slug)) }
      else if (heart) { e.preventDefault(); toggleSave(c.dataset.slug, heart) }
      else if (cb) { e.preventDefault(); toggleCompare(c.dataset.slug) }
    })
  }

  /* The WhatsApp logo on every link to our WhatsApp number, wherever it appears (the glyph is
     Simple Icons' WhatsApp mark, CC0; brand green #25D366). Links added later get it too. */
  const WA_PATH = 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41Z'
  const waSvg = (fill, size) => '<svg class="wa-ic" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true" style="flex:none;display:inline-block;vertical-align:-0.18em;fill:' + fill + '"><path d="' + WA_PATH + '"/></svg>'
  function markWhatsApp(root) {
    if (!root || !root.querySelectorAll) return
    root.querySelectorAll('a[href*="wa.me/917292002003"]:not([data-wa])').forEach((a) => {
      a.setAttribute('data-wa', '')
      const circle = a.querySelector('.g-cta > span, :scope > span[aria-hidden="true"]')
      if (a.classList.contains('g-cta') && circle) { circle.innerHTML = waSvg('#fff', 15); circle.style.background = '#25D366'; return }
      const old = a.querySelector(':scope > svg'); if (old) old.remove()
      a.insertAdjacentHTML('afterbegin', waSvg(/\b(wa|v-btn)\b/.test(a.className) && !/\bghost\b/.test(a.className) ? '#fff' : '#25D366', 17) + '<span style="display:inline-block;width:.45em" aria-hidden="true"></span>')
    })
  }
  if (typeof document !== 'undefined') {
    const runWA = () => { markWhatsApp(document); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) { if (n.matches && n.matches('a[href*="wa.me/917292002003"]')) markWhatsApp(n.parentNode); else markWhatsApp(n) } }))).observe(document.body, { childList: true, subtree: true }) }
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', runWA) : runWA()
  }

  window.IC = { D, A, HOME, BASE, I, WA, esc, MARKETS, inMarket, logoOf, share, bySlug, devOf, url, src, configShort, card, bind, wireImages, syncCmp, toggleCompare, toggleSave, isSaved: (s) => liked.has(s), isComparing: (s) => cmp.includes(s), toast, reduce }
  /* InvestoAI and older links open a project by its id: go to its page */
  window.icOpenListing = (id) => { const p = bySlug(id); if (!p) return false; location.href = url(p); return true }
  if (typeof document !== 'undefined' && document.readyState !== 'loading') syncCmp()
  else if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', syncCmp)
})()
