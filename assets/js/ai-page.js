/* InvestoAI full page (/ai/). The look follows the INVESTOCLUB AI app; every answer comes from the
   site's existing engine (window.InvestoAIEngine, set up by assets/js/iai.js). No backend. */
(() => {
  const $ = (id) => document.getElementById(id)
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms))
  const E = () => window.InvestoAIEngine
  const app = $('app'), main = $('main'), thread = $('thread'), input = $('cq'), send = $('csend')
  const ic = (d, s = 18) => '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'
  const LOGO = '<span class="logo" aria-label="InvestoClub AI">Investo<span class="c">Club</span><span class="t">AI</span></span>'

  /* ---------- typing headline (laptop) ---------- */
  const LINES = ['Where should you invest next?', 'Find the right property for your budget.', 'Compare projects before you commit.', 'Check the price per sq.ft before you buy.']
  const typed = $('typed')
  if (typed) {
    if (reduce) typed.firstChild.textContent = LINES[0]
    else {
      let li = 0, n = LINES[0].length, del = false
      const tick = () => {
        const w = LINES[li]
        if (!del && n < w.length) n++
        else if (!del) { del = true; return setTimeout(tick, 2400) }
        else if (n > 0) n--
        else { del = false; li = (li + 1) % LINES.length; return setTimeout(tick, 280) }
        typed.firstChild.textContent = w.slice(0, n) || ' '
        setTimeout(tick, del ? 16 : 42)
      }
      setTimeout(tick, 2400)
    }
  }

  /* ---------- price ticker (laptop): the site's own indicative corridor rates ---------- */
  const RATES = [['Golf Course Road', 28500, 11.2], ['Golf Course Ext.', 19800, 15.4], ['Dwarka Expressway', 13100, 18.6], ['Southern Peripheral', 15800, 14.3], ['Sohna Road', 10400, 7.1], ['Noida Sector 94', 24500, 13.8], ['Worli, Mumbai', 65000, 9.3], ['Vasant Vihar, Delhi', 62000, 7.4]]
  const tk = $('track')
  if (tk) tk.innerHTML = [...RATES, ...RATES].map(([n, p, y], i) => '<button type="button" data-ask="Price per sq.ft in ' + esc(n) + '"' + (i >= RATES.length ? ' aria-hidden="true" tabindex="-1"' : '') + '><span class="n">' + esc(n) + '</span><span class="p">₹' + p.toLocaleString('en-IN') + '/sq ft</span><span class="u">▲ ' + y.toFixed(1) + '%</span><span class="s" aria-hidden="true">/</span></button>').join('')

  /* ---------- history (this device only) ---------- */
  const KEY = 'ic-ai-threads'
  let threads = []; try { threads = JSON.parse(localStorage.getItem(KEY) || '[]') } catch (e) {}
  let cur = null
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(threads.slice(0, 30))) } catch (e) {} paintHistory() }
  function paintHistory() {
    const rows = threads.map((t) => '<li><button type="button" data-open="' + t.id + '">' + esc(t.title) + '</button><button type="button" class="x" data-del="' + t.id + '" aria-label="Delete ' + esc(t.title) + '">' + ic('<path d="M6 6l12 12M18 6L6 18"/>', 13) + '</button></li>').join('')
    $('histList').innerHTML = rows ? '<ul>' + rows + '</ul>' : '<p class="none">Nothing yet. Your research threads appear here.</p>'
    $('drawerRec').innerHTML = threads.length ? '<ul>' + threads.slice(0, 10).map((t) => '<li><button type="button" data-open="' + t.id + '">' + esc(t.title) + '</button></li>').join('') + '</ul>' : '<p>Your research appears here.</p>'
  }
  paintHistory()

  /* ---------- rendering a reply ---------- */
  const ICONS = {
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    again: '<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8"/><path d="M20 3v5h-5"/>',
  }
  /* research = anything that searched the data (cards, tables, a list); small talk gets a direct reply */
  const isResearch = (r) => !r.small && !r.ask && !!((r.cards && r.cards.length) || (r.table && r.table.length) || r.list)
  const ORB = '<span class="av" aria-hidden="true"><span class="ai-orb"><i>✦</i></span></span>'
  const stepsHTML = (steps, secs) => '<div class="trace"><button type="button" class="trace-h" aria-expanded="false">' + ic('<path d="m9 18 6-6-6-6"/>', 14) + 'Researched' + (secs ? ' in ' + secs + 's' : '') + ' · ' + steps.length + ' steps</button><ul class="steps" hidden>' + steps.map((s) => '<li class="ok"><i></i>' + esc(s) + '</li>').join('') + '</ul></div>'
  function replyHTML(r) {
    let h = (r._steps && r._steps.length ? stepsHTML(r._steps, r._secs) : '') + '<p class="ans">' + esc(r.text) + '</p>'
    if (r.table && r.table.length) h += '<div class="tbl-w"><table class="tbl' + (r.kv ? ' kv' : '') + (r.grid ? ' grid' : '') + '"><tbody>' + r.table.map((row, i) => '<tr>' + row.map((c, j) => (r.grid && i === 0) || (r.kv && j === 0) || (r.grid && j === 0) ? '<th>' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'
    if (r.cards && r.cards.length && E()) h += '<div class="lks">' + r.cards.map((p) => E().listing(p)).join('') + '</div>'
    if (r.form) h += '<div class="cta"><a class="wa" href="' + E().WA('I would like to speak to an InvestoClub advisor.') + '" target="_blank" rel="noopener">' + ic('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>', 16) + 'WhatsApp an advisor</a><a class="call" href="tel:+917292002003">' + ic('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>', 16) + 'Call +91 72920 02003</a></div>'
    if (r.chips && r.chips.length) h += r.ask || r.small
      ? '<div class="quick" role="group" aria-label="Quick replies">' + r.chips.map((c) => '<button type="button" data-ask="' + esc(c) + '">' + esc(c) + '</button>').join('') + '</div>'
      : '<div class="related"><p>Related</p><ul>' + r.chips.map((c) => '<li><button type="button" data-ask="' + esc(c) + '"><span>' + esc(c) + '</span>' + ic('<path d="M5 12h14M13 6l6 6-6 6"/>', 15) + '</button></li>').join('') + '</ul></div>'
    if (!r.ask && !r.small) h += '<div class="acts"><button type="button" data-act="copy" aria-label="Copy answer" title="Copy">' + ic(ICONS.copy, 15) + '</button><button type="button" data-act="share" aria-label="Share answer" title="Share">' + ic(ICONS.share, 15) + '</button><button type="button" data-act="again" aria-label="Research again" title="Research again">' + ic(ICONS.again, 15) + '</button><small role="status"></small></div>'
    return h
  }
  const turnHTML = (q) => '<div class="turn"><p class="q">' + esc(q) + '</p></div>'
  const replyShell = () => { const box = document.createElement('div'); box.className = 'reply'; box.innerHTML = ORB + '<div class="rb-body"><p class="name">InvestoAI</p><div class="rb-c"></div></div>'; return box }

  function setChatting(on) {
    app.classList.toggle('chatting', on); main.classList.toggle('empty', !on); thread.hidden = !on
    input.placeholder = on ? 'Ask a follow-up…' : (matchMedia('(min-width: 1024px)').matches ? 'Ask InvestoAI to research something for you…' : 'Ask anything…')
  }
  const toEnd = () => { const s = $('scroll'); s.scrollTo({ top: s.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }) }
  let busy = false

  async function ask(q, opts = {}) {
    q = String(q || '').trim(); if (!q || busy || !E()) return
    busy = true; send.disabled = true
    if (!cur) { cur = { id: Date.now().toString(36), title: q.slice(0, 80), turns: [] }; threads.unshift(cur) }
    setChatting(true)
    thread.insertAdjacentHTML('beforeend', turnHTML(q))
    const box = replyShell(), c = box.querySelector('.rb-c'); thread.appendChild(box); toEnd()
    const t0 = performance.now()
    let r; try { r = E().answer(q) } catch (e) { r = { text: 'Something went wrong on my side. Please try again, or talk to an advisor.', form: true } }
    if (isResearch(r)) {
      // one shimmering line walks through the engine's own steps, then folds away
      const steps = E().plan ? E().plan(q) : ['Reading your question']
      c.innerHTML = '<p class="sweep" role="status"></p>'; const sw = c.firstChild
      for (const s of steps) { sw.textContent = s + '…'; toEnd(); if (!opts.instant) await sleep(420) }
      r._steps = steps; r._secs = ((performance.now() - t0) / 1000).toFixed(1)
    } else { c.innerHTML = '<p class="dots" role="status" aria-label="Typing"><i></i><i></i><i></i></p>'; if (!opts.instant) await sleep(520) }
    c.innerHTML = replyHTML(r)
    // the answer text arrives word by word; everything under it fades in after
    if (!opts.instant && !reduce) {
      const p = c.querySelector('.ans'), rest = [...c.children].filter((x) => x !== p && !x.classList.contains('trace')), words = r.text.split(' ')
      rest.forEach((x) => (x.style.opacity = 0)); p.textContent = ''
      for (let i = 0; i < words.length; i++) { p.textContent += (i ? ' ' : '') + words[i]; if (i % 4 === 0) toEnd(); await sleep(16) }
      rest.forEach((x, i) => { x.style.transition = 'opacity .4s ease ' + i * 0.08 + 's'; x.style.opacity = 1 })
    }
    box.dataset.q = q; box._r = r
    cur.turns.push({ q, r }); save(); toEnd()
    busy = false; send.disabled = !input.value.trim()
  }

  function openThread(id) {
    const t = threads.find((x) => x.id === id); if (!t) return
    cur = t; thread.innerHTML = ''; setChatting(true)
    t.turns.forEach(({ q, r }) => { thread.insertAdjacentHTML('beforeend', turnHTML(q)); const box = replyShell(); box.dataset.q = q; box._r = r; box.querySelector('.rb-c').innerHTML = replyHTML(r); thread.appendChild(box) })
    toEnd(); closeDrawer(); $('hist').hidden = true
  }
  /* expand or fold the research steps */
  document.addEventListener('click', (e) => { const th = e.target.closest('.trace-h'); if (th) { const o = th.getAttribute('aria-expanded') !== 'true'; th.setAttribute('aria-expanded', o); th.nextElementSibling.hidden = !o } })
  function newChat() { if (busy) return; cur = null; thread.innerHTML = ''; setChatting(false); input.value = ''; grow(); closeDrawer() }

  /* ---------- composer ---------- */
  const grow = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 180) + 'px'; input.style.overflowY = input.scrollHeight > 180 ? 'auto' : 'hidden'; send.disabled = busy || !input.value.trim() }
  input.addEventListener('input', grow)
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } })
  const submit = () => { const v = input.value.trim(); if (!v) return; input.value = ''; grow(); ask(v) }
  $('cform').addEventListener('submit', (e) => { e.preventDefault(); submit() })
  // + quick actions: fill the box, ready to edit
  const qa = $('qa'), qaBtn = $('qaBtn')
  qaBtn.addEventListener('click', (e) => { e.stopPropagation(); const o = qa.hidden; qa.hidden = !o; qaBtn.setAttribute('aria-expanded', o) })
  qa.addEventListener('click', (e) => { const b = e.target.closest('[data-fill]'); if (!b) return; qa.hidden = true; qaBtn.setAttribute('aria-expanded', false); input.value = b.dataset.fill; grow(); input.focus(); const at = input.value.indexOf('₹') + 1; if (at > 0) input.setSelectionRange(at, at) })
  document.addEventListener('click', (e) => { if (!e.target.closest('#qa') && !e.target.closest('#qaBtn')) { qa.hidden = true; qaBtn.setAttribute('aria-expanded', false) } if (!e.target.closest('#hist') && !e.target.closest('#histBtn')) $('hist').hidden = true })

  // voice dictation where the browser offers it (Chrome, Edge, Safari)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition, mic = $('mic'), status = $('cstatus')
  if (!SR) mic.hidden = true
  else {
    let rec = null
    mic.addEventListener('click', () => {
      if (rec) { rec.stop(); return }
      rec = new SR(); rec.lang = 'en-IN'; rec.interimResults = true
      const base = input.value ? input.value + ' ' : ''
      rec.onresult = (e) => { input.value = base + [...e.results].map((x) => x[0].transcript).join(''); grow() }
      rec.onend = () => { rec = null; mic.setAttribute('aria-pressed', false); status.hidden = true; input.focus() }
      rec.onerror = () => { status.textContent = 'Voice input could not start. Check microphone permission.'; }
      mic.setAttribute('aria-pressed', true); status.hidden = false; status.textContent = 'Listening · tap the mic again to stop'; rec.start()
    })
  }

  /* ---------- clicks: asks, cards, reply actions, history ---------- */
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-ask]'); if (a) { e.preventDefault(); ask(a.dataset.ask); return }
    const v = e.target.closest('[data-view]'); if (v) { const p = E().project(v.dataset.view); if (!E().open(v.dataset.view) && p) ask(p.n); return }
    const s = e.target.closest('[data-sheet]'); if (s) { const p = E().project(s.dataset.sheet); window.open(E().WA('Please send me the price sheet for ' + (p ? p.n : 'this project') + '.'), '_blank', 'noopener'); return }
    const act = e.target.closest('[data-act]')
    if (act) {
      const box = act.closest('.reply'), note = box.querySelector('.acts small'), r = box._r || {}
      if (act.dataset.act === 'again') { ask(box.dataset.q); return }
      const text = box.dataset.q + '\n\n' + r.text + (r.table ? '\n' + r.table.map((x) => x.join(' · ')).join('\n') : '') + '\n\n— InvestoAI, InvestoClub'
      if (act.dataset.act === 'share' && navigator.share) { try { await navigator.share({ title: 'InvestoAI', text }) } catch (er) {} return }
      try { await navigator.clipboard.writeText(text); note.textContent = 'Copied' } catch (er) { note.textContent = 'Copy not available here' }
      setTimeout(() => (note.textContent = ''), 1800); return
    }
    const o = e.target.closest('[data-open]'); if (o) { openThread(o.dataset.open); return }
    const d = e.target.closest('[data-del]'); if (d) { e.stopPropagation(); threads = threads.filter((t) => t.id !== d.dataset.del); if (cur && cur.id === d.dataset.del) newChat(); save(); return }
  })
  document.querySelectorAll('[data-new]').forEach((b) => b.addEventListener('click', newChat))
  $('histBtn').addEventListener('click', (e) => { e.stopPropagation(); $('hist').hidden = !$('hist').hidden })
  $('focusQ').addEventListener('click', () => input.focus())

  /* ---------- phone drawer ---------- */
  const openDrawer = () => { document.body.classList.add('drawer-open'); $('drawer').removeAttribute('inert'); $('drawer').setAttribute('aria-hidden', 'false') }
  function closeDrawer() { document.body.classList.remove('drawer-open'); $('drawer').setAttribute('inert', ''); $('drawer').setAttribute('aria-hidden', 'true') }
  document.querySelectorAll('[data-menu]').forEach((b) => b.addEventListener('click', openDrawer))
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeDrawer))
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); $('hist').hidden = true; qa.hidden = true } })

  /* ---------- start ---------- */
  setChatting(false); grow()
  const q0 = new URLSearchParams(location.search).get('q')
  const go = () => { if (q0) { history.replaceState(null, '', location.pathname); ask(q0) } }
  if (E()) go(); else addEventListener('load', go)
})()
