/* InvestoClub v5 — project page: gallery lightbox, FAQ, EMI calculator, enquiry, save and share.
   The page is fully rendered by tools/build-v5-projects.mjs; this only adds behaviour. */
(() => {
  const $ = (id) => document.getElementById(id)
  const page = window.IC_PAGE || {}
  const p = IC.bySlug(page.slug)
  const reduce = IC.reduce

  /* header */
  const gB = $('gBurger'), gM = $('gMenu')
  if (gB) gB.addEventListener('click', () => { const o = gB.getAttribute('aria-expanded') !== 'true'; gB.setAttribute('aria-expanded', o); gM.hidden = !o })
  const toTop = $('toTop')
  if (toTop) toTop.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) })
  document.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => $(b.dataset.goto).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })))
  /* floor-plan card "Enquire now": go to the form with that configuration already noted */
  const side = $('enquire'), sticky = () => side && getComputedStyle(side).position === 'sticky'
  document.querySelectorAll('[data-enq]').forEach((b) => b.addEventListener('click', () => {
    const note = $('qNote'); if (note) note.value = 'Interested in ' + b.dataset.enq + '. Please share the current price sheet and floor plan.'
    const cfg = $('qConfig'), want = b.dataset.enq.split(',')[0].trim()
    if (cfg) { const o = [...cfg.options].find((x) => x.text === want); if (o) cfg.value = o.value }
    if (sticky()) { side.classList.remove('flash'); void side.offsetWidth; side.classList.add('flash'); const n = $('qName'); if (n) n.focus({ preventScroll: true }); return }
    side.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); setTimeout(() => { const n = $('qName'); if (n) n.focus({ preventScroll: true }) }, reduce ? 0 : 600)
  }))

  /* floor plans: one tab per layout type */
  const tabs = [...document.querySelectorAll('.fp-tabs [data-fk]')]
  const pick = (t) => {
    tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1 })
    document.querySelectorAll('.fpc .fp[data-fk]').forEach((c) => { c.hidden = c.dataset.fk !== t.dataset.fk })
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t))
    t.addEventListener('keydown', (e) => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); pick(n) })
  })

  /* save + share */
  const save = $('pdSave'), note = $('pdNote')
  const paintSave = () => { const on = IC.isSaved(p.slug); save.setAttribute('aria-pressed', on); save.querySelector('span').textContent = on ? 'Saved' : 'Save' }
  if (save && p) { paintSave(); save.addEventListener('click', () => { IC.toggleSave(p.slug); paintSave() }) }
  const share = $('pdShare')
  if (share && p) share.addEventListener('click', async () => {
    const url = location.href.split('#')[0], text = p.name + ', ' + p.sector + ' — ' + p.priceLabel
    if (navigator.share) { try { await navigator.share({ title: p.name, text, url }) } catch (e) {} return }
    try { await navigator.clipboard.writeText(url); note.textContent = 'Link copied' } catch (e) { window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener') }
    setTimeout(() => (note.textContent = ''), 2400)
  })

  /* hero photographs: arrows, swipe and arrow keys; "All photos" opens the viewer at the one shown */
  const slides = [...document.querySelectorAll('#pxSlides img')], all = $('pxAll')
  if (slides.length > 1) {
    let cur = 0
    const go = (i) => {
      cur = (i + slides.length) % slides.length
      slides.forEach((im, k) => { im.classList.toggle('on', k === cur); if (Math.abs(k - cur) <= 1) im.loading = 'eager' })
      $('pxNum').textContent = cur + 1 + ' / ' + slides.length
      all.dataset.lb = cur
    }
    $('pxPrev').addEventListener('click', () => go(cur - 1))
    $('pxNext').addEventListener('click', () => go(cur + 1))
    const fr = document.querySelector('.px-frame'); let sx = null
    fr.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX }, { passive: true })
    fr.addEventListener('touchend', (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)) })
  }

  /* related cards */
  const rel = $('related')
  if (rel) { IC.bind(rel); IC.wireImages(rel) }

  /* ---------- lightbox ---------- */
  const lb = $('lb'), img = $('lbImg'), num = $('lbN'), th = $('lbTh')
  let frames = [], at = 0, opener = null
  const show = (i) => {
    at = (i + frames.length) % frames.length
    const f = frames[at]
    img.src = f.src; img.alt = f.alt; img.classList.toggle('plan', !!f.plan)
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''
    num.textContent = at + 1 + ' / ' + frames.length
    th.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', k === at))
    const cur = th.children[at]; if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' })
    ;[frames[(at + 1) % frames.length], frames[(at - 1 + frames.length) % frames.length]].forEach((x) => { const im = new Image(); im.src = x.src })
    $('lbP').hidden = $('lbNx').hidden = frames.length < 2
  }
  const open = (set, i) => {
    frames = set; opener = document.activeElement
    th.innerHTML = frames.length > 1 ? frames.map((f, k) => '<button type="button" class="' + (f.plan ? 'plan' : '') + '" aria-label="Show image ' + (k + 1) + '"><img src="' + f.src + '" alt="" loading="lazy" /></button>').join('') : ''
    th.querySelectorAll('button').forEach((b, k) => b.addEventListener('click', () => show(k)))
    lb.hidden = false; document.documentElement.classList.add('lock')
    show(i); $('lbX').focus()
  }
  const close = () => { lb.hidden = true; document.documentElement.classList.remove('lock'); if (opener) opener.focus() }
  const photoSet = (page.photos || []).map((src, i) => ({ src, alt: p.name + ', ' + p.sector + ' — photograph ' + (i + 1) }))
  const planSet = (page.plans || []).map((src, i) => ({ src, alt: p.name + ' — floor plan ' + (i + 1), plan: true }))
  document.querySelectorAll('[data-lb]').forEach((b) => b.addEventListener('click', () => open(photoSet, +b.dataset.lb)))
  document.querySelectorAll('[data-plan]').forEach((b) => b.addEventListener('click', () => open(planSet, +b.dataset.plan)))
  if (lb) {
    $('lbX').addEventListener('click', close)
    $('lbP').addEventListener('click', () => show(at - 1))
    $('lbNx').addEventListener('click', () => show(at + 1))
    addEventListener('keydown', (e) => {
      if (lb.hidden) return
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') show(at + 1)
      else if (e.key === 'ArrowLeft') show(at - 1)
      else if (e.key === 'Tab') { // keep focus inside the viewer
        const f = [...lb.querySelectorAll('button:not([hidden])')]; const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    })
    let tx = null, ty = 0
    $('lbSt').addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY }, { passive: true })
    $('lbSt').addEventListener('touchend', (e) => {
      if (tx === null) return
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(at + (dx < 0 ? 1 : -1))
    })
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.fq-i button').forEach((b) => b.addEventListener('click', () => {
    const o = b.getAttribute('aria-expanded') !== 'true', a = $(b.getAttribute('aria-controls'))
    b.setAttribute('aria-expanded', o); a.classList.toggle('open', o); a.firstElementChild.inert = !o
  }))

  /* ---------- EMI ---------- */
  const box = $('emi')
  if (box) {
    const START = +box.dataset.price, o = (k) => box.querySelector('[data-o="' + k + '"]')
    const inr = (v) => '₹' + Math.round(Math.max(0, v)).toLocaleString('en-IN')
    const inrS = (v) => (v >= 1e7 ? '₹' + (v / 1e7).toFixed(2) + ' Cr' : v >= 1e5 ? '₹' + (v / 1e5).toFixed(2) + ' L' : inr(v))
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
    const digits = (s) => Number(String(s).replace(/[^\d.]/g, '')) || 0
    /* reducing balance: EMI = P·r·(1+r)^n / ((1+r)^n − 1); r = rate/12/100; at 0% the loan is split evenly */
    const emi = (P, rate, yrs) => { const n = Math.round(yrs * 12), r = rate / 1200; if (P <= 0 || n <= 0) return 0; if (!r) return P / n; const f = Math.pow(1 + r, n); return (P * r * f) / (f - 1) }
    const st = { price: START, pct: 20, rate: 8.5, yrs: 20, mode: 'pct' }
    const eP = $('eP'), ePr = $('ePr'), eD = $('eD'), eDr = $('eDr'), eR = $('eR'), eRr = $('eRr'), eT = $('eT'), eTr = $('eTr')
    const fill = (r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%')
    ;[ePr, eDr, eRr, eTr].forEach((r) => r.classList.add('emi-range'))
    const C = 2 * Math.PI * 54
    const paint = (from) => {
      const down = Math.round((st.price * st.pct) / 100), loan = Math.max(0, st.price - down)
      const m = emi(loan, st.rate, st.yrs), tot = m * st.yrs * 12, int = Math.max(0, tot - loan), share = tot > 0 ? int / tot : 0
      if (from !== eP) eP.value = st.price.toLocaleString('en-IN')
      if (from !== eD) eD.value = st.mode === 'pct' ? String(Math.round(st.pct * 10) / 10) : down.toLocaleString('en-IN')
      if (from !== eR) eR.value = st.rate
      if (from !== eT) eT.value = st.yrs
      ePr.value = clamp(st.price, +ePr.min, +ePr.max); eDr.value = st.pct; eRr.value = st.rate; eTr.value = st.yrs
      ;[ePr, eDr, eRr, eTr].forEach(fill)
      o('pS').textContent = inrS(st.price)
      o('dS').textContent = st.mode === 'pct' ? inrS(down) : (Math.round(st.pct * 10) / 10) + '%'
      o('dPre').hidden = st.mode !== 'amt'; o('dSuf').textContent = st.mode === 'pct' ? '%' : ''
      o('loan').textContent = inr(loan); o('loanS').textContent = inrS(loan)
      o('emi').textContent = inr(m); o('sub').textContent = 'for ' + st.yrs * 12 + ' months at ' + st.rate + '% a year'
      o('pp').textContent = Math.round((1 - share) * 100) + '%'; o('ip').textContent = Math.round(share * 100) + '%'
      o('ring').querySelector('.i').setAttribute('stroke-dasharray', (share * C).toFixed(1) + ' ' + C.toFixed(1))
      o('r1').textContent = inr(loan); o('r1s').textContent = inrS(loan)
      o('r2').textContent = inr(int); o('r2s').textContent = inrS(int)
      o('r3').textContent = inr(tot); o('r3s').textContent = inrS(tot)
    }
    eP.addEventListener('input', () => { st.price = clamp(digits(eP.value), 0, 2e9); paint(eP) })
    eP.addEventListener('blur', () => paint())
    ePr.addEventListener('input', () => { st.price = +ePr.value; paint() })
    eD.addEventListener('input', () => { const v = digits(eD.value); st.pct = st.mode === 'pct' ? clamp(v, 0, 100) : st.price > 0 ? clamp((v / st.price) * 100, 0, 100) : 0; paint(eD) })
    eD.addEventListener('blur', () => paint())
    eDr.addEventListener('input', () => { st.pct = +eDr.value; paint() })
    eR.addEventListener('input', () => { st.rate = clamp(digits(eR.value), 0, 20); paint(eR) })
    eR.addEventListener('blur', () => paint())
    eRr.addEventListener('input', () => { st.rate = Math.round(+eRr.value * 100) / 100; paint() })
    eT.addEventListener('input', () => { st.yrs = clamp(Math.round(digits(eT.value)), 1, 30); paint(eT) })
    eT.addEventListener('blur', () => paint())
    eTr.addEventListener('input', () => { st.yrs = +eTr.value; paint() })
    box.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      st.mode = b.dataset.mode; box.querySelectorAll('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', x === b)); paint()
    }))
    $('eReset').addEventListener('click', () => { Object.assign(st, { price: START, pct: 20, rate: 8.5, yrs: 20 }); paint() })
    paint()
  }

  /* ---------- enquiry: validated, then handed to WhatsApp as the rest of the site does ---------- */
  const f = $('eqForm')
  if (f) {
    const err = (inp, msg) => { inp.setAttribute('aria-invalid', !!msg); const e = $(inp.id + 'E'); if (e) e.textContent = msg || '' }
    f.addEventListener('submit', (e) => {
      e.preventDefault()
      const n = f.name.value.trim(), ph = f.phone.value.replace(/[^\d+]/g, ''), em = f.email.value.trim()
      let first = null
      if (n.length < 2) { err(f.name, 'Please add your name.'); first = first || f.name } else err(f.name, '')
      if (ph.replace(/\D/g, '').length < 10) { err(f.phone, 'Enter a 10-digit mobile number, with country code if outside India.'); first = first || f.phone } else err(f.phone, '')
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { err(f.email, 'That email looks incomplete, for example name@example.com.'); first = first || f.email } else err(f.email, '')
      if (first) { first.focus(); return }
      const msg = 'Project enquiry: ' + f.project.value + '\nName: ' + n + '\nPhone: ' + ph + (em ? '\nEmail: ' + em : '') + (f.config ? '\nLayout: ' + f.config.value : '') + '\nBudget: ' + f.budget.value + (f.note.value.trim() ? '\nNote: ' + f.note.value.trim() : '') + '\nPage: ' + location.href.split('#')[0]
      window.open(IC.WA(msg), '_blank', 'noopener')
      f.parentElement.innerHTML = '<div class="pd-done" role="status"><h3>Thank you, ' + IC.esc(n.split(' ')[0]) + '.</h3><p>Your request is ready in WhatsApp: press send and an advisor will call you back.</p></div>'
    })
    f.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => { if (i.getAttribute('aria-invalid') === 'true') err(i, '') }))
  }
})()
