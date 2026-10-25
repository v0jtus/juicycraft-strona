// JuicyCraft.pl - wspolny skrypt: kopiowanie IP, odliczanie, status serwera, ogloszenia, Soczek, menu.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ROOT = document.documentElement.dataset.root || '/';
  const START = Date.parse('2026-10-30T18:00:00+01:00');
  const IP = 'juicycraft.pl';

  // --- toast ---
  const toast = (msg) => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  };

  // --- kopiowanie IP ---
  const copyIp = async (btn) => {
    try { await navigator.clipboard.writeText(IP); }
    catch {
      const ta = document.createElement('textarea'); ta.value = IP; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch {} ta.remove();
    }
    toast('Skopiowane! Widzimy się w grze 💗');
    if (btn && btn.dataset.label !== undefined) {
      btn.textContent = 'Skopiowane!'; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = btn.dataset.label; btn.classList.remove('copied'); }, 1800);
    }
    soczekSay('IP masz! Do zobaczenia w grze ✨', true);
  };
  $$('[data-copy-ip]').forEach((b) => { b.dataset.label = b.textContent.trim(); b.addEventListener('click', () => copyIp(b)); });

  // --- menu ---
  const nav = $('.nav'), burger = $('.burger');
  if (burger) burger.addEventListener('click', () => {
    const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });
  $$('.nav ul a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));

  // --- odliczanie ---
  const cd = $('[data-countdown]');
  const opened = () => Date.now() >= START;
  if (cd) {
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const d = START - Date.now();
      if (d <= 0) {
        cd.innerHTML = '<div class="label"><b>SERWER JEST OTWARTY</b> Wskakuj do gry!</div>';
        return;
      }
      const s = Math.floor(d / 1000);
      $('[data-d]', cd).textContent = Math.floor(s / 86400);
      $('[data-h]', cd).textContent = pad(Math.floor((s % 86400) / 3600));
      $('[data-m]', cd).textContent = pad(Math.floor((s % 3600) / 60));
      $('[data-s]', cd).textContent = pad(s % 60);
      setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
  }

  // --- status serwera (mcstatus.io), tylko gdy karta jest widoczna ---
  const st = $('[data-status]');
  if (st) {
    const txt = $('span', st), dot = $('.dot', st);
    const load = async () => {
      if (document.hidden) return;
      if (!opened()) { txt.textContent = 'Przygotowujemy świat'; return; }
      try {
        const r = await fetch('https://api.mcstatus.io/v2/status/java/' + IP + '?query=false', { cache: 'no-store' });
        const j = await r.json();
        if (j && j.online && j.players) {
          dot.classList.add('on');
          txt.textContent = 'ONLINE • ' + j.players.online + (j.players.online === 1 ? ' gracz' : ' graczy');
        } else { dot.classList.remove('on'); txt.textContent = 'Serwer chwilowo offline'; }
      } catch { txt.textContent = 'Status chwilowo niedostępny'; }
    };
    load(); setInterval(load, 75000);
    document.addEventListener('visibilitychange', load);
  }

  // --- ogloszenia z data/announcements.json ---
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MONTHS = ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'];
  const fmt = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
  $$('[data-news]').forEach(async (box) => {
    const limit = +box.dataset.news || 3;
    try {
      const r = await fetch(ROOT + 'data/announcements.json', { cache: 'no-store' });
      const items = ((await r.json()).items || []).slice(0, limit);
      if (!items.length) throw 0;
      box.innerHTML = items.map((p) => `<article class="post reveal">
        <div class="meta"><span class="kind">${esc(p.kind || 'NOWOŚĆ')}</span><time datetime="${esc(p.date)}">${fmt(p.date)}</time></div>
        <h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join('');
      observe(box);
    } catch {
      box.outerHTML = '<p class="empty">Na razie cisza przed przygodą. Najnowsze informacje znajdziesz na <a href="https://discord.gg/w9wUDA2wny">Discordzie</a>.</p>';
    }
  });

  // --- Soczek ---
  const mascot = $('.mascot');
  const bubble = mascot && $('.bubble', mascot);
  const lines = ['Widzimy się na serwerze!', 'Masz już ekipę do Jaskiń?', 'IP masz pod ręką? juicycraft.pl', 'Soczki same się nie zarobią.', 'Wódz czeka na śmiałków…'];
  let li = 0;
  function soczekSay(text, happy) {
    if (!bubble) return;
    bubble.textContent = text; bubble.classList.add('show');
    if (happy) { mascot.classList.remove('happy'); void mascot.offsetWidth; mascot.classList.add('happy'); }
    clearTimeout(bubble._h); bubble._h = setTimeout(() => bubble.classList.remove('show'), 2600);
  }
  if (mascot) {
    const img = $('img', mascot);
    img.addEventListener('click', () => { soczekSay(lines[li++ % lines.length], true); });
    img.setAttribute('tabindex', '0'); img.setAttribute('role', 'button');
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); img.click(); } });
  }

  // --- czasteczki w hero (lekkie, CSS) ---
  const pr = $('.particles');
  if (pr && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const n = innerWidth < 700 ? 8 : 16;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%'; p.style.top = 40 + Math.random() * 60 + '%';
      p.style.animationDuration = 6 + Math.random() * 8 + 's'; p.style.animationDelay = -Math.random() * 10 + 's';
      if (Math.random() < .3) p.style.background = '#FFD23F';
      pr.appendChild(p);
    }
  }

  // --- pojawianie sie przy przewijaniu ---
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  function observe(root = document) { $$('.reveal:not(.in)', root).forEach((el) => io ? io.observe(el) : el.classList.add('in')); }
  observe();

  // --- mapa na zadanie (iframe po kliknieciu) ---
  $$('[data-map-load]').forEach((b) => b.addEventListener('click', () => {
    const f = $(b.dataset.mapLoad);
    if (!f) return;
    f.innerHTML = `<iframe src="${b.dataset.src}" title="Mapa świata JuicyCraft" loading="lazy" allowfullscreen></iframe>`;
    b.remove();
  }));
})();
