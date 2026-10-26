(function () {
  'use strict';

  const $app = document.getElementById('app');
  const $fx = document.getElementById('fx');
  const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));
  const SHOW_DELAY = 900; // ms chờ sau khi đổi tranh rồi mới đọc
  const QUIZ_LEN = 10; // số câu mỗi bài chơi

  // ---------- Lưu cài đặt ----------
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('bht:' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('bht:' + key, JSON.stringify(value)); } catch (e) { /* chế độ riêng tư */ }
    }
  };
  const RATES = [[0.45, 'Rất chậm'], [0.6, 'Chậm'], [0.75, 'Vừa']];
  const settings = Object.assign({ showVi: true, rate: 0.6, choices: 2, sfx: true, voice: '' }, store.get('settings', {}));
  // Tốc độ đã lưu từ bản cũ (0.65 / 0.8 / 1) -> đưa về mức chậm mới.
  if (!RATES.some(([v]) => v === settings.rate)) settings.rate = 0.6;
  let stars = store.get('stars', 0);
  Sfx.enabled = settings.sfx;

  function saveSettings() {
    store.set('settings', settings);
    Sfx.enabled = settings.sfx;
  }

  // ---------- Tiện ích ----------
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = sel => $app.querySelector(sel);

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function say(text) {
    return new Promise(resolve => {
      let done = false;
      const timer = setTimeout(() => finish(), 1500 + text.length * 110 / settings.rate);
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      }
      Voice.speak(text, { rate: settings.rate, voice: settings.voice, onend: finish });
    });
  }

  // "the dog" / "red" / "number three" / "happy" / "Mommy"
  function nameOf(topic, item) {
    if (topic.id === 'colors' || topic.ask === 'who' || item.noThe) return item.en;
    if (topic.id === 'numbers') return 'number ' + item.en;
    return 'the ' + item.en;
  }
  const askLead = (topic, item) => topic.ask === 'who' ? 'Who is' : item.plural ? 'Where are' : 'Where is';
  const askText = (topic, item) => `${askLead(topic, item)} ${nameOf(topic, item)}?`;
  const askVi = (topic, item) => topic.askVi ? topic.askVi.replace('{vi}', item.vi) : `${cap(item.vi)} ở đâu?`;
  const speechFor = item => cap(item.en) + '! ' + (item.say || '');

  function visual(item) {
    if (item.color) {
      return `<span class="swatch${item.color === '#ffffff' ? ' light' : ''}" style="--c:${item.color}"></span>`;
    }
    // Nếu art.js chưa tải (bản cũ còn trong bộ nhớ đệm) thì dùng emoji dự phòng.
    if (item.art && window.ART_SVG) {
      return `<svg class="art" viewBox="0 0 200 200" aria-hidden="true">${ART_SVG[item.art]}</svg>`;
    }
    if (item.svg) {
      return `<svg class="shape" viewBox="0 0 100 100" style="--c:${item.fill}" aria-hidden="true">${SHAPES_SVG[item.svg]}</svg>`;
    }
    if (item.n) {
      const dots = Array.from({ length: item.n }, () => `<i>${item.emoji}</i>`).join('');
      return `<span class="count"><span class="digit">${item.n}</span><span class="dots">${dots}</span></span>`;
    }
    return `<span class="emoji">${item.emoji}</span>`;
  }

  function anim(el, keyframes, opts) {
    if (el && el.animate) el.animate(keyframes, Object.assign({ duration: 400, easing: 'ease-out' }, opts));
  }
  const bounce = el => anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 450 });
  const shake = el => anim(el, [0, -14, 12, -8, 6, 0].map(x => ({ transform: `translateX(${x}px)` })), { duration: 420 });

  // ---------- Hiệu ứng ----------
  function confetti(el) {
    const r = el.getBoundingClientRect();
    confettiAt(r.left + r.width / 2, r.top + r.height / 2);
  }

  // Màn chúc mừng khi xong bài: tiếng vỗ tay, pháo hoa và tay vỗ bay lên.
  function celebrate(id) {
    Sfx.applause();
    Sfx.win();
    let n = 0;
    const timer = setInterval(() => {
      if (!alive(id) || n++ >= 6) return clearInterval(timer);
      confettiAt(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.2 + Math.random() * 0.5));
    }, 450);
    onLeave(() => clearInterval(timer));
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = pick(['👏', '👏', '🎉', '🌟']);
      s.style.left = (5 + Math.random() * 90) + '%';
      s.style.top = '100%';
      s.style.fontSize = (34 + Math.random() * 30) + 'px';
      $fx.appendChild(s);
      const a = s.animate([
        { transform: 'translateY(0) scale(.8)', opacity: 1 },
        { transform: `translateY(-${innerHeight * (0.6 + Math.random() * 0.5)}px) scale(1.2) rotate(${Math.random() * 60 - 30}deg)`, opacity: 0 }
      ], { duration: 2200 + Math.random() * 1200, delay: Math.random() * 1200, easing: 'ease-out', fill: 'backwards' });
      a.onfinish = () => s.remove();
    }
    setTimeout(() => { if (alive(id)) say('Hooray! Great job!'); }, 700);
  }

  function confettiAt(x, y) {
    const pieces = ['⭐', '✨', '🎉', '🌟', '💖', '🎈'];
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = pick(pieces);
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      $fx.appendChild(s);
      const ang = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 180;
      const a = s.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(1.2) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' });
      a.onfinish = () => s.remove();
    }
  }

  function burst(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const d = document.createElement('span');
      d.className = 'drop';
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.background = color;
      $fx.appendChild(d);
      const ang = (i / 12) * Math.PI * 2;
      const dist = 50 + Math.random() * 60;
      const a = d.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(.3)`, opacity: 0 }
      ], { duration: 500, easing: 'ease-out' });
      a.onfinish = () => d.remove();
    }
  }

  function addStar() {
    stars++;
    store.set('stars', stars);
    const el = document.getElementById('stars');
    if (el) {
      el.querySelector('b').textContent = stars;
      bounce(el);
    }
  }

  // ---------- Vòng đời màn hình ----------
  let screenId = 0;
  const cleanups = [];
  function newScreen(cls, tint) {
    screenId++;
    while (cleanups.length) cleanups.pop()();
    Voice.cancel();
    $fx.innerHTML = '';
    $app.className = 'screen ' + cls;
    $app.style.setProperty('--tint', tint || 'transparent');
    return screenId;
  }
  const alive = id => id === screenId;
  function onLeave(fn) { cleanups.push(fn); }
  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    onLeave(() => target.removeEventListener(type, fn, opts));
  }

  const starsPill = () => `<span class="stars" id="stars" title="Số sao bé đã nhận">⭐ <b>${stars}</b></span>`;

  function topBar(topic, mode) {
    return `
      <header class="topbar">
        <a class="icon-btn" href="#/" aria-label="Về trang chủ">🏠</a>
        <div class="topic-title"><span class="ti">${topic.icon}</span><span class="tt">${topic.en}</span><small>${topic.vi}</small></div>
        <nav class="tabs">
          <a href="#/topic/${topic.id}" class="${mode === 'learn' ? 'on' : ''}">📖 <span>Học</span></a>
          <a href="#/topic/${topic.id}/play" class="${mode === 'play' ? 'on' : ''}">🎯 <span>Chơi</span></a>
        </nav>
        ${starsPill()}
      </header>`;
  }

  // ---------- Trang chủ ----------
  function renderHome() {
    newScreen('home');
    $app.innerHTML = `
      <header class="topbar">
        <h1 class="logo"><span class="logo-icon">🌈</span>Bé Học <b>Tiếng Anh</b></h1>
        ${starsPill()}
        <button class="icon-btn" id="fs" aria-label="Toàn màn hình">⛶</button>
        <button class="icon-btn gear" id="gear" aria-label="Cài đặt cho bố mẹ (giữ 1 giây)">⚙️</button>
      </header>
      <main class="tiles">
        <a class="tile wide" href="#/balloons" style="--tint:#bde0fe">
          <span class="tile-icon">🎈🎈</span>
          <span class="tile-text"><span class="tile-en">Balloons</span><span class="tile-vi">Chạm bóng bay, học màu</span></span>
        </a>
        ${TOPICS.map(t => `
          <a class="tile" href="#/topic/${t.id}" style="--tint:${t.tint}">
            <span class="tile-icon">${t.icon}</span>
            <span class="tile-en">${t.en}</span>
            <span class="tile-vi">${t.vi} · ${t.items.length} từ</span>
          </a>`).join('')}
      </main>
      <p class="hint">Bố mẹ: giữ nút ⚙️ khoảng 1 giây để mở cài đặt.</p>`;

    $('#fs').addEventListener('click', toggleFullscreen);
    holdToOpen($('#gear'), openSettings);
  }

  function toggleFullscreen() {
    const d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) {
      (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    } else {
      const el = d.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el);
    }
  }

  // Giữ nút để mở — tránh bé bấm nhầm vào cài đặt.
  function holdToOpen(btn, fn) {
    let t = null;
    const stop = () => { clearTimeout(t); btn.classList.remove('holding'); };
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      btn.classList.add('holding');
      t = setTimeout(() => { stop(); fn(); }, 1000);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }

  // ---------- Chế độ Học (thẻ từ) ----------
  function renderLearn(topic) {
    const id = newScreen('learn', topic.tint);
    const items = topic.items;
    let idx = 0;
    let auto = false;
    let token = 0;

    $app.innerHTML = `
      ${topBar(topic, 'learn')}
      <main class="stage" id="stage">
        <button class="nav prev" id="prev" aria-label="Từ trước">◀</button>
        <button class="card big" id="card"></button>
        <button class="nav next" id="next" aria-label="Từ tiếp theo">▶</button>
      </main>
      <footer class="learn-foot">
        <div class="progress" id="progress">${items.map(() => '<i></i>').join('')}</div>
        <button class="pill" id="auto">▶ Tự chạy</button>
      </footer>`;

    const $card = $('#card');
    const $dots = Array.from($('#progress').children);
    const $auto = $('#auto');

    function show(dir) {
      const item = items[idx];
      $card.innerHTML = `
        <span class="vis">${visual(item)}</span>
        <span class="word">${cap(item.en)}</span>
        ${settings.showVi ? `<span class="vi">${item.vi}</span>` : ''}`;
      $card.setAttribute('aria-label', item.en);
      $dots.forEach((d, i) => d.classList.toggle('on', i === idx));
      if (dir) {
        anim($card, [
          { transform: `translateX(${dir * 60}px) scale(.9)`, opacity: 0 },
          { transform: 'none', opacity: 1 }
        ], { duration: 320 });
      }
      speak(SHOW_DELAY);
    }

    // delay: chờ bé nhìn tranh mới đọc (chạm thẻ để nghe lại thì đọc ngay).
    async function speak(delay) {
      const my = ++token;
      if (delay) {
        Voice.cancel();
        await wait(delay);
        if (!alive(id) || my !== token) return;
      }
      bounce($card.querySelector('.vis'));
      await say(speechFor(items[idx]));
      if (!alive(id) || my !== token || !auto) return;
      await wait(1600);
      if (!alive(id) || my !== token || !auto) return;
      go(1);
    }

    function go(d) {
      idx = (idx + d + items.length) % items.length;
      Sfx.tap();
      show(d);
    }

    function setAuto(on) {
      auto = on;
      $auto.classList.toggle('on', on);
      $auto.textContent = on ? '⏸ Dừng' : '▶ Tự chạy';
    }

    // Vuốt trái/phải để đổi thẻ; chạm để nghe lại.
    let startX = null;
    let swiped = false;
    const $stage = $('#stage');
    $stage.addEventListener('pointerdown', e => { startX = e.clientX; swiped = false; });
    $stage.addEventListener('pointerup', e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 60) { swiped = true; go(dx < 0 ? 1 : -1); }
    });

    $card.addEventListener('click', () => { if (!swiped) speak(); });
    $('#prev').addEventListener('click', () => { if (!swiped) go(-1); });
    $('#next').addEventListener('click', () => { if (!swiped) go(1); });
    $auto.addEventListener('click', () => { setAuto(!auto); if (auto) speak(); });
    listen(window, 'keydown', e => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    });

    show(0);
  }

  // ---------- Chế độ Chơi (tìm hình) ----------
  function renderPlay(topic) {
    const id = newScreen('play', topic.tint);
    let bag = [];
    let target = null;
    let options = [];
    let locked = false;
    let misses = 0;
    let done = 0;
    let askTimer = null;
    onLeave(() => clearTimeout(askTimer));

    $app.innerHTML = `
      ${topBar(topic, 'play')}
      <div class="ask" id="askRow">
        <button class="speak-btn" id="ask" aria-label="Nghe lại câu hỏi">🔊</button>
        <div class="ask-text" id="askText"></div>
      </div>
      <div class="quiz-progress" id="qp" aria-label="Tiến độ bài">${'<i>⭐</i>'.repeat(QUIZ_LEN)}</div>
      <main class="choices" id="choices"></main>`;

    const $choices = $('#choices');
    const $askBtn = $('#ask');
    const $qp = Array.from($('#qp').children);

    function nextTarget() {
      if (!bag.length) bag = shuffle(topic.items);
      let t = bag.pop();
      if (t === target && bag.length) t = bag.pop();
      return t;
    }

    function round() {
      target = nextTarget();
      misses = 0;
      locked = false;
      const k = Math.min(settings.choices, topic.items.length);
      const others = shuffle(topic.items.filter(i => i !== target)).slice(0, k - 1);
      options = shuffle([target].concat(others));
      $choices.className = 'choices n' + k;
      $choices.innerHTML = options.map((it, i) =>
        `<button class="card choice" data-i="${i}" style="animation-delay:${i * 90}ms"><span class="vis">${visual(it)}</span></button>`
      ).join('');
      const word = nameOf(topic, target).replace(/(\S+)$/, '<b>$1</b>');
      $('#askText').innerHTML = `${askLead(topic, target)} ${word}?${settings.showVi ? `<small>${askVi(topic, target)}</small>` : ''}`;
      askTimer = setTimeout(ask, SHOW_DELAY + 300); // đợi hình hiện xong rồi mới hỏi
    }

    function ask() {
      clearTimeout(askTimer);
      bounce($askBtn);
      return say(askText(topic, target));
    }

    // Chạm hình không đọc gì cả — chỉ có âm thanh và hiệu ứng.
    async function choose(btn) {
      if (locked) return;
      const it = options[Number(btn.dataset.i)];
      if (it === target) {
        locked = true;
        clearTimeout(askTimer);
        Voice.cancel();
        Sfx.win();
        btn.classList.add('correct');
        $choices.querySelectorAll('.choice').forEach(b => { if (b !== btn) b.classList.add('fade'); });
        bounce(btn);
        confetti(btn);
        addStar();
        const star = $qp[done++];
        star.classList.add('done');
        bounce(star);
        await wait(1400);
        if (!alive(id)) return;
        if (done >= QUIZ_LEN) finish();
        else round();
      } else {
        Sfx.oops();
        shake(btn);
        misses++;
        if (misses >= 2) {
          const right = $choices.querySelector(`[data-i="${options.indexOf(target)}"]`);
          if (right) right.classList.add('hint');
        }
      }
    }

    function finish() {
      $('#askRow').remove();
      $('#qp').remove();
      $choices.className = 'finish';
      $choices.innerHTML = `
        <div class="clap">👏</div>
        <h2>Giỏi quá!</h2>
        <p class="finish-en">Great job!</p>
        <p class="finish-stars">${'⭐'.repeat(QUIZ_LEN)}</p>
        <div class="finish-actions">
          <button class="pill primary" id="again">🔁 Chơi lại</button>
          <a class="pill" href="#/topic/${topic.id}">📖 Học tiếp</a>
          <a class="pill" href="#/">🏠 Trang chủ</a>
        </div>`;
      $('#again').addEventListener('click', () => renderPlay(topic));
      celebrate(id);
    }

    $askBtn.addEventListener('click', ask);
    $choices.addEventListener('click', e => {
      const btn = e.target.closest('.choice');
      if (btn) choose(btn);
    });

    round();
  }

  // ---------- Trò chơi Bóng bay ----------
  function renderBalloons() {
    const id = newScreen('balloons');
    const colors = TOPIC.colors.items;

    $app.innerHTML = `
      <header class="topbar">
        <a class="icon-btn" href="#/" aria-label="Về trang chủ">🏠</a>
        <div class="topic-title"><span class="ti">🎈</span><span class="tt">Balloons</span><small>Chạm vào bóng bay!</small></div>
        ${starsPill()}
      </header>
      <main class="sky" id="sky">
        <span class="cloud c1">☁️</span><span class="cloud c2">☁️</span><span class="cloud c3">☁️</span>
        <div class="sky-word" id="word"></div>
      </main>`;

    const $sky = $('#sky');
    const $word = $('#word');
    let pops = 0;

    function spawn() {
      if (!alive(id) || document.hidden) return;
      if ($sky.querySelectorAll('.balloon:not(.popped)').length >= 7) return;
      const c = pick(colors);
      const b = document.createElement('button');
      b.className = 'balloon';
      b.setAttribute('aria-label', c.en + ' balloon');
      b.style.setProperty('--c', c.color);
      b.style.setProperty('--dur', (7 + Math.random() * 4).toFixed(1) + 's');
      b.style.setProperty('--sway', (Math.random() * 40 - 20).toFixed(0) + 'px');
      b.style.left = (3 + Math.random() * 82).toFixed(1) + '%';
      b.addEventListener('animationend', () => b.remove());
      b.addEventListener('pointerdown', e => { e.preventDefault(); pop(b, c); });
      $sky.appendChild(b);
    }

    function pop(b, c) {
      if (b.classList.contains('popped')) return;
      const r = b.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, c.color);
      b.classList.add('popped');
      setTimeout(() => b.remove(), 250);
      Sfx.pop();
      $word.textContent = cap(c.en);
      $word.style.setProperty('--c', c.color);
      $word.classList.toggle('light', c.color === '#ffffff');
      anim($word, [
        { opacity: 0, transform: 'scale(.6)' },
        { opacity: 1, transform: 'scale(1.05)', offset: 0.2 },
        { opacity: 1, transform: 'scale(1)', offset: 0.75 },
        { opacity: 0, transform: 'scale(1)' }
      ], { duration: 1600, easing: 'ease-out' });
      say(cap(c.en) + '!');
      if (++pops % 5 === 0) addStar(); // cứ 5 quả bóng được 1 sao
    }

    spawn();
    const timer = setInterval(spawn, 1100);
    onLeave(() => clearInterval(timer));
  }

  // ---------- Cài đặt cho bố mẹ ----------
  function openSettings() {
    const voices = Voice.list();
    const seg = (key, opts) => `<div class="seg" data-key="${key}">${opts.map(([v, l]) =>
      `<button data-v="${v}" class="${settings[key] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;

    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="st">
        <h2 id="st">⚙️ Cài đặt cho bố mẹ</h2>
        <label class="row"><span>Hiện nghĩa tiếng Việt</span><input type="checkbox" class="switch" id="s-vi" ${settings.showVi ? 'checked' : ''}></label>
        <div class="row"><span>Tốc độ đọc</span>${seg('rate', RATES)}</div>
        <div class="row"><span>Số hình khi chơi</span>${seg('choices', [[2, '2'], [3, '3'], [4, '4']])}</div>
        <label class="row"><span>Âm thanh hiệu ứng</span><input type="checkbox" class="switch" id="s-sfx" ${settings.sfx ? 'checked' : ''}></label>
        <div class="row col">
          <span>Giọng đọc tiếng Anh</span>
          <div class="voice-row">
            <select id="s-voice">
              <option value="">Tự động chọn</option>
              ${voices.map(v => `<option value="${esc(v.name)}" ${v.name === settings.voice ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}
            </select>
            <button class="pill" id="s-test">🔊 Nghe thử</button>
          </div>
          ${!Voice.supported
            ? '<p class="warn">Trình duyệt này không hỗ trợ đọc giọng nói. Hãy dùng Chrome, Edge hoặc Safari.</p>'
            : voices.length === 0 ? '<p class="warn">Chưa thấy giọng tiếng Anh. Trên Windows: Cài đặt → Thời gian &amp; ngôn ngữ → Giọng nói → thêm giọng English.</p>' : ''}
        </div>
        <details class="tips">
          <summary>💡 Gợi ý cho bố mẹ</summary>
          <ul>
            <li>Mỗi lần chơi 5–10 phút là đủ với bé 2 tuổi. Bố mẹ ngồi cùng và nhắc lại từ theo máy.</li>
            <li>Bắt đầu ở chế độ <b>📖 Học</b>, khi bé đã quen thì chuyển sang <b>🎯 Chơi</b> với 2 hình.</li>
            <li>Chỉ vào đồ vật thật quanh nhà và nói từ tiếng Anh: “Look, a <i>ball</i>!”.</li>
            <li>Khen bé khi bé chỉ đúng, kể cả khi bé chưa nói được — bé hiểu trước, nói sau.</li>
            <li>Trên điện thoại/máy tính bảng: “Thêm vào màn hình chính” để mở như một ứng dụng.</li>
          </ul>
        </details>
        <div class="sheet-foot">
          <button class="pill ghost" id="s-reset">Đặt lại số sao</button>
          <button class="pill primary" id="s-close">Xong</button>
        </div>
      </div>`;
    document.body.appendChild(ov);

    const q = s => ov.querySelector(s);
    q('#s-vi').addEventListener('change', e => { settings.showVi = e.target.checked; saveSettings(); });
    q('#s-sfx').addEventListener('change', e => { settings.sfx = e.target.checked; saveSettings(); });
    q('#s-voice').addEventListener('change', e => { settings.voice = e.target.value; saveSettings(); say('Hello! Let\'s play!'); });
    q('#s-test').addEventListener('click', () => say('Hello! Dog, cat, duck.'));
    ov.querySelectorAll('.seg').forEach(s => s.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      settings[s.dataset.key] = Number(b.dataset.v);
      saveSettings();
      s.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      if (s.dataset.key === 'rate') say('Apple, banana, orange.');
    }));
    q('#s-reset').addEventListener('click', () => {
      if (!confirm('Đặt lại số sao của bé về 0?')) return;
      stars = 0;
      store.set('stars', 0);
    });
    const close = () => { ov.remove(); route(); };
    q('#s-close').addEventListener('click', close);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
  }

  // ---------- Điều hướng ----------
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const topic = parts[0] === 'topic' && TOPIC[parts[1]];
    if (topic) {
      if (parts[2] === 'play') renderPlay(topic);
      else renderLearn(topic);
    } else if (parts[0] === 'balloons') {
      renderBalloons();
    } else {
      renderHome();
    }
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('click', e => { if (e.target.closest('a.tile, .tabs a')) Sfx.tap(); });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault()); // chặn phóng to trên iOS
  document.addEventListener('visibilitychange', () => { if (document.hidden) Voice.cancel(); });

  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    // Có bản cập nhật (service worker mới nắm quyền) -> tải lại một lần để dùng mã mới.
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded) { reloaded = true; location.reload(); }
    });
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
