<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { WHEEL_ORDER, getColor } from '../utils/roulette'

const props = defineProps({
  rotation: { type: Number, default: 0 },
  spinning: { type: Boolean, default: false },
  winnerNumber: { type: Number, default: null },
})

const N = WHEEL_ORDER.length
const SECTOR = 360 / N

// ────────────────────────────────────────────────────────────
// Колесо
// ────────────────────────────────────────────────────────────
const wheelGradient = computed(() => {
  const colorMap = { red: '#dc2626', black: '#0f172a', green: '#16a34a' }
  const stops = WHEEL_ORDER.map((num, i) => {
    const c = colorMap[getColor(num)]
    return `${c} ${i * SECTOR}deg ${(i + 1) * SECTOR}deg`
  })
  return `conic-gradient(${stops.join(', ')})`
})

const numberLabels = computed(() =>
  WHEEL_ORDER.map((num, i) => ({
    num,
    angle: i * SECTOR + SECTOR / 2,
    color: getColor(num),
  }))
)

// ────────────────────────────────────────────────────────────
// 🎱 Физика шарика
// ────────────────────────────────────────────────────────────
const ballAngle = ref(0)
const ballRadius = ref(46)
const ballScale = ref(1)

let rafId = null

function stopAnimation() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function startBallAnimation(winnerAngleAbsolute) {
  stopAnimation()

  const startTime = performance.now()

  const DURATION = 4000
  const FALL_START = 0.65
  const SPINS = 9
  const DIRECTION = -1

  const startAngle = ballAngle.value
  const startRadius = ballRadius.value

  const endAngle = winnerAngleAbsolute
  const endRadius = 30

  const baseSpins = Math.round(
    (endAngle - startAngle - SPINS * 360 * DIRECTION) / 360
  )
  const totalDelta = SPINS * 360 * DIRECTION + baseSpins * 360
  const targetFinal = startAngle + totalDelta

  const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  function tick(now) {
    const t = Math.min((now - startTime) / DURATION, 1)

    const easedAngle = easeOutQuint(t)
    let angle
    if (t < 0.85) {
      angle = startAngle + (targetFinal - startAngle) * easedAngle
    } else {
      const tTail = (t - 0.85) / 0.15
      angle = targetFinal + (endAngle - targetFinal) * tTail
    }
    ballAngle.value = angle

    if (t < FALL_START) {
      const wobble = Math.sin(t * 60) * 0.4
      ballRadius.value = startRadius + wobble
    } else {
      const fallT = (t - FALL_START) / (1 - FALL_START)
      const eased = easeInOutCubic(fallT)
      ballRadius.value = startRadius + (endRadius - startRadius) * eased
    }

    ballScale.value = 1 - (1 - ballRadius.value / startRadius) * 0.4

    if (t < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      ballAngle.value = endAngle
      ballRadius.value = endRadius
      ballScale.value = 0.6
      rafId = null
    }
  }

  rafId = requestAnimationFrame(tick)
}

watch(
  () => props.spinning,
  (val, oldVal) => {
    if (val) {
      ballRadius.value = 46
      ballScale.value = 1
      startBallAnimation(ballAngle.value - 360 * 9)
    } else if (oldVal && props.winnerNumber != null) {
      const idx = WHEEL_ORDER.indexOf(props.winnerNumber)
      const S = 360 / WHEEL_ORDER.length
      const absoluteAngle = props.rotation + idx * S + S / 2
      startBallAnimation(absoluteAngle)
    }
  }
)

watch(
  () => props.winnerNumber,
  (num) => {
    if (!props.spinning && num != null) {
      const idx = WHEEL_ORDER.indexOf(num)
      const S = 360 / WHEEL_ORDER.length
      const absoluteAngle = props.rotation + idx * S + S / 2
      startBallAnimation(absoluteAngle)
    }
  }
)

onUnmounted(stopAnimation)
</script>

<template>
  <div class="relative w-[340px] h-[340px] md:w-[460px] md:h-[460px] select-none">
    <!-- Внешний обод (золотой) -->
    <div class="absolute inset-0 rounded-full
                bg-gradient-to-br from-amber-700 via-amber-500 to-amber-800
                shadow-[0_0_60px_rgba(251,191,36,0.35),inset_0_0_30px_rgba(0,0,0,0.6)]">
      <div class="absolute inset-[6px] rounded-full bg-gradient-to-br from-amber-900 to-slate-900 shadow-inner"></div>
    </div>

    <!-- Тёмный бортик, по которому катится шарик -->
    <div class="absolute inset-[14px] rounded-full bg-slate-950 shadow-inner
                border border-amber-900/40"></div>

    <!-- Вращающийся градиент -->
    <div
      class="absolute inset-[18px] rounded-full shadow-2xl"
      :style="{
        background: wheelGradient,
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.7, 0.1, 1)' : 'none',
      }"
    ></div>

    <!-- Слой с числами -->
    <div
      class="absolute inset-[18px] rounded-full pointer-events-none"
      :style="{
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.7, 0.1, 1)' : 'none',
      }"
    >
      <div
        v-for="l in numberLabels"
        :key="l.num"
        class="absolute top-1/2 left-1/2"
        :style="{ transform: `rotate(${l.angle}deg) translateY(-39%)` }"
      >
        <div
          class="w-5 text-center text-[10px] md:text-[11px] font-black text-white
                 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] leading-none"
          :style="{ transform: `rotate(${-l.angle}deg)` }"
        >
          {{ l.num }}
        </div>
      </div>
    </div>

    <!-- Радиальные линии между секторами -->
    <div
      class="absolute inset-[18px] rounded-full pointer-events-none"
      :style="{
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.7, 0.1, 1)' : 'none',
      }"
    >
      <div
        v-for="(_, i) in WHEEL_ORDER"
        :key="'line-' + i"
        class="absolute top-1/2 left-1/2 w-[1px] h-[50%] bg-black/30 origin-top"
        :style="{ transform: `translate(-50%, 0) rotate(${i * SECTOR}deg)` }"
      ></div>
    </div>

    <!-- Центральная втулка -->
    <div class="absolute inset-[28%] rounded-full bg-gradient-to-br from-slate-800 to-slate-950
                border-4 border-amber-500/60 shadow-inner flex items-center justify-center z-10
                ring-2 ring-amber-400/20">
      <div class="text-center">
        <div class="text-3xl md:text-4xl drop-shadow-lg">🎯</div>
        <div
          v-if="winnerNumber !== null"
          class="mt-1 text-xs font-black"
          :class="{
            'text-red-400': getColor(winnerNumber) === 'red',
            'text-slate-300': getColor(winnerNumber) === 'black',
            'text-emerald-400': getColor(winnerNumber) === 'green',
          }"
        >
          {{ winnerNumber }}
        </div>
      </div>
    </div>

    <!-- 🎱 Шарик -->
    <div
      class="absolute top-1/2 left-1/2 w-3.5 h-3.5 rounded-full pointer-events-none z-20
             bg-gradient-to-br from-white via-slate-100 to-slate-400
             shadow-[0_0_14px_rgba(255,255,255,0.95),0_0_4px_rgba(0,0,0,0.5)_inset]"
      :style="{
        transform: `translate(-50%, -50%) rotate(${ballAngle}deg) translateY(-${ballRadius * 3.6}px) scale(${ballScale})`,
      }"
    ></div>
  </div>
</template>