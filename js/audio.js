// Giọng đọc tiếng Anh (Web Speech API) và hiệu ứng âm thanh tạo bằng Web Audio (không cần file mp3).

window.Voice = (function () {
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  // Ưu tiên các giọng nữ Mỹ rõ ràng, phổ biến trên Chrome / Edge / iOS / Windows.
  const PREFERRED = [
    'Google US English', 'Microsoft Jenny Online', 'Microsoft Aria Online', 'Microsoft Ava',
    'Samantha', 'Microsoft Zira', 'Google UK English Female'
  ];
  let voices = [];
  let current = null; // giữ tham chiếu để Chrome không thu hồi utterance trước khi onend chạy

  function load() {
    if (!synth) return;
    voices = synth.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang));
  }

  if (synth) {
    load();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', load);
    else synth.onvoiceschanged = load;
  }

  function choose(name) {
    if (!voices.length) load();
    if (name) {
      const v = voices.find(x => x.name === name);
      if (v) return v;
    }
    for (const p of PREFERRED) {
      const v = voices.find(x => x.name.includes(p));
      if (v) return v;
    }
    return voices.find(x => /en[-_]US/i.test(x.lang)) || voices[0] || null;
  }

  function speak(text, opts) {
    opts = opts || {};
    if (!synth) {
      if (opts.onend) opts.onend();
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = choose(opts.voice);
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'en-US'; }
    u.rate = opts.rate || 0.6;
    u.pitch = 1.15;
    if (opts.onend) { u.onend = opts.onend; u.onerror = opts.onend; }
    current = u;
    synth.speak(u);
    if (synth.paused) synth.resume();
  }

  return {
    supported: !!synth,
    speak,
    cancel() { if (synth) synth.cancel(); current = null; },
    list() { if (!voices.length) load(); return voices.slice(); }
  };
})();

window.Sfx = (function () {
  let ctx = null;

  function audio() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol, slideTo) {
    const c = audio();
    if (!c) return;
    const t = c.currentTime + start;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  let clapBuf = null;

  // Tiếng vỗ tay: nhiều tiếng "bép" ngắn từ nhiễu trắng, dày lúc đầu rồi thưa dần.
  function applause() {
    const c = audio();
    if (!c) return;
    if (!clapBuf) {
      clapBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.06), c.sampleRate);
      const d = clapBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    }
    const total = 3;
    for (let i = 0; i < 140; i++) {
      const at = Math.pow(Math.random(), 1.6) * total;
      const t = c.currentTime + at;
      const src = c.createBufferSource();
      src.buffer = clapBuf;
      src.playbackRate.value = 0.8 + Math.random() * 0.5;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 900 + Math.random() * 1800;
      f.Q.value = 1.2;
      const g = c.createGain();
      g.gain.value = 0.35 * (1 - at / total) + 0.05;
      src.connect(f).connect(g).connect(c.destination);
      src.start(t);
    }
  }

  const sfx = {
    enabled: true,
    tap() { if (sfx.enabled) tone(620, 0, 0.12, 'triangle', 0.15, 900); },
    pop() { if (sfx.enabled) { tone(1100, 0, 0.09, 'square', 0.08, 180); tone(300, 0.02, 0.12, 'sine', 0.15, 80); } },
    win() { if (sfx.enabled) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.28, 'triangle', 0.16)); },
    oops() { if (sfx.enabled) tone(330, 0, 0.3, 'sine', 0.15, 220); },
    applause() { if (sfx.enabled) applause(); }
  };
  return sfx;
})();
