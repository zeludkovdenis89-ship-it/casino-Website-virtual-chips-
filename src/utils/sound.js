// Звуки генерируем программно — не нужны mp3-файлы
let ctx = null

function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) {}
  }
  return ctx
}

function beep({ freq = 440, duration = 0.08, type = 'sine', gain = 0.08, when = 0 } = {}) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g).connect(c.destination)
  const t = c.currentTime + when
  osc.start(t)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.stop(t + duration + 0.02)
}

// Короткий «тик» шарика по лункам — вызывать много раз во время вращения
export function playTick() {
  beep({ freq: 1200 + Math.random() * 400, duration: 0.03, type: 'square', gain: 0.03 })
}

// Звук победы — восходящее арпеджио
export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5] // C E G C
  notes.forEach((f, i) => beep({ freq: f, duration: 0.18, type: 'triangle', gain: 0.1, when: i * 0.09 }))
}

// Звук проигрыша — нисходящий
export function playLose() {
  beep({ freq: 330, duration: 0.15, type: 'sawtooth', gain: 0.08, when: 0 })
  beep({ freq: 220, duration: 0.25, type: 'sawtooth', gain: 0.08, when: 0.12 })
}

// Клик по фишке
export function playChip() {
  beep({ freq: 800, duration: 0.05, type: 'triangle', gain: 0.06 })
}

// Звук вращения — серия тиков, имитирующая замедление
export function playSpinSound(durationMs = 4000) {
  const start = performance.now()
  let lastTick = 0
  function loop() {
    const elapsed = performance.now() - start
    if (elapsed >= durationMs) return
    const progress = elapsed / durationMs
    // Интервал между тиками растёт (замедление)
    const interval = 30 + progress * progress * 400
    if (elapsed - lastTick > interval) {
      playTick()
      lastTick = elapsed
    }
    requestAnimationFrame(loop)
  }
  loop()
}