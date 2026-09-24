<script setup>
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import { balance, addBalance } from '../store/wallet'
import { getColor, isInDozen, PAYOUTS, WHEEL_ORDER } from '../utils/roulette'
import { playSpinSound, playWin, playLose, playChip } from '../utils/sound'
import RouletteWheel from '../components/RouletteWheel.vue'
import BettingTable from '../components/BettingTable.vue'
import SpinHistory from '../components/SpinHistory.vue'

// ─────────────────────────────────────────────────────────────
// Состояние
// ─────────────────────────────────────────────────────────────
const chipValue = ref(10)
const bets = ref({})            // { '17': 50, 'red': 100, 'dozen-0': 25, ... }
const isSpinning = ref(false)
const wheelRotation = ref(0)
const winnerNumber = ref(null)
const message = ref('Выберите фишку и кликните по столу, чтобы сделать ставку')
const history = ref([])         // последние 12 выпавших чисел
const lastWinKeys = ref([])     // какие ставки сыграли

// ─────────────────────────────────────────────────────────────
// Вычисляемые
// ─────────────────────────────────────────────────────────────
const totalBet = computed(() =>
  Object.values(bets.value).reduce((s, v) => s + (Number(v) || 0), 0)
)

const canSpin = computed(() =>
  !isSpinning.value && totalBet.value > 0 && totalBet.value <= balance.value
)

// ─────────────────────────────────────────────────────────────
// Действия со ставками
// ─────────────────────────────────────────────────────────────
function placeBet({ key }) {
  if (isSpinning.value) return
  const newTotal = totalBet.value + chipValue.value
  if (newTotal > balance.value) {
    message.value = '❌ Недостаточно средств для этой ставки'
    return
  }
  bets.value[key] = (bets.value[key] || 0) + chipValue.value
  playChip()
  message.value = `Ставка: ${totalBet.value} фишек`
}

function clearBets() {
  if (isSpinning.value) return
  bets.value = {}
  lastWinKeys.value = []
  message.value = 'Ставки очищены'
}

// ─────────────────────────────────────────────────────────────
// Логика выплат
// ─────────────────────────────────────────────────────────────
function isWinningBet(key, n) {
  if (key === 'red') return getColor(n) === 'red'
  if (key === 'black') return getColor(n) === 'black'
  if (key.startsWith('dozen-')) return isInDozen(n, Number(key.split('-')[1]))
  if (/^\d+$/.test(key)) return Number(key) === n
  return false
}

function payoutFor(key) {
  if (key === 'red' || key === 'black') return PAYOUTS.color + 1  // x2
  if (key.startsWith('dozen-')) return PAYOUTS.dozen + 1          // x3
  if (/^\d+$/.test(key)) return PAYOUTS.straight + 1              // x36
  return 0
}

// ─────────────────────────────────────────────────────────────
// 🎊 Конфетти
// ─────────────────────────────────────────────────────────────
function fireConfetti() {
  const duration = 2500
  const end = Date.now() + duration

  // Первый мощный залп из центра
  confetti({
    particleCount: 140,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#fbbf24', '#f59e0b', '#dc2626', '#16a34a', '#ffffff'],
    scalar: 1.15,
  })

  // «Салют» с двух сторон
  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: ['#fbbf24', '#dc2626', '#ffffff'],
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: ['#fbbf24', '#16a34a', '#ffffff'],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

function fireLoseShake() {
  confetti({
    particleCount: 25,
    spread: 45,
    origin: { y: 0.6 },
    colors: ['#475569', '#334155', '#1e293b'],
    scalar: 0.8,
    gravity: 1.4,
    ticks: 60,
  })
}

// ─────────────────────────────────────────────────────────────
// 🎲 Спин
// ─────────────────────────────────────────────────────────────
async function spin() {
  if (!canSpin.value) {
    if (totalBet.value <= 0) message.value = '❌ Сделайте хотя бы одну ставку'
    else if (totalBet.value > balance.value) message.value = '❌ Недостаточно средств'
    return
  }

  isSpinning.value = true
  lastWinKeys.value = []
  winnerNumber.value = null
  addBalance(-totalBet.value)
  message.value = '🎲 Колесо крутится...'

  playSpinSound(4000)

  // 1. Заранее выбираем выигрышное число
  const winnerIndex = Math.floor(Math.random() * WHEEL_ORDER.length)
  const winningNumber = WHEEL_ORDER[winnerIndex]

  // 2. Считаем угол, чтобы это число встало под указателем (0° в conic-gradient)
  const S = 360 / WHEEL_ORDER.length
  const sectorCenter = winnerIndex * S + S / 2
  const neededRotation = (360 - sectorCenter + 360) % 360
  const extraSpins = 5 + Math.floor(Math.random() * 3)
  const targetAngle = wheelRotation.value + extraSpins * 360 + neededRotation

  wheelRotation.value = targetAngle

  // 3. Ждём анимацию (совпадает с 4s в CSS transition)
  await new Promise(r => setTimeout(r, 4000))

  // 4. Победитель уже известен
  winnerNumber.value = winningNumber

  let totalPayout = 0
  const winningKeys = []

  for (const [key, amount] of Object.entries(bets.value)) {
    if (isWinningBet(key, winningNumber)) {
      totalPayout += amount * payoutFor(key)
      winningKeys.push(key)
    }
  }

  lastWinKeys.value = winningKeys
  const netResult = totalPayout - totalBet.value
  addBalance(totalPayout)

  // 5. История (последние 12)
  history.value = [winningNumber, ...history.value].slice(0, 12)

  const colorName = {
    red: '🔴 Красное',
    black: '⚫ Чёрное',
    green: '🟢 Зеро',
  }[getColor(winningNumber)]

  // 6. Итог + эффекты
  if (totalPayout > 0) {
    playWin()
    fireConfetti()
    message.value = `🎉 Выпало ${winningNumber} (${colorName})! Выплата: ${totalPayout} (чистая: ${netResult >= 0 ? '+' : ''}${netResult})`
  } else {
    playLose()
    fireLoseShake()
    message.value = `😢 Выпало ${winningNumber} (${colorName}). Потеряно: ${totalBet.value}`
  }

  // 7. Сбрасываем ставки (как в казино)
  setTimeout(() => {
    bets.value = {}
    isSpinning.value = false
  }, 500)
}
</script>

<template>
  <div class="w-full max-w-3xl flex flex-col items-center gap-4">
    <!-- Колесо с числами и физикой шарика -->
    <RouletteWheel
      :rotation="wheelRotation"
      :spinning="isSpinning"
      :winner-number="winnerNumber"
    />

    <!-- Сообщение -->
    <p
      class="text-lg font-medium min-h-[28px] text-center px-4"
      :class="{
        'text-emerald-400': message.includes('🎉'),
        'text-rose-400': message.includes('😢') || message.includes('❌'),
        'text-amber-300': !message.includes('🎉') && !message.includes('😢') && !message.includes('❌'),
      }"
    >
      {{ message }}
    </p>

    <!-- Выбор фишки -->
    <div class="flex items-center gap-2 flex-wrap justify-center">
      <span class="text-slate-400 text-sm mr-2">Фишка:</span>
      <button
        v-for="v in [1, 5, 10, 25, 100]"
        :key="v"
        @click="chipValue = v"
        :disabled="isSpinning"
        class="w-12 h-12 rounded-full font-black text-sm transition-all border-4 shadow-lg
               disabled:opacity-50 disabled:cursor-not-allowed"
        :class="chipValue === v
          ? 'bg-gradient-to-br from-amber-300 to-amber-600 border-white scale-110 ring-4 ring-amber-400/50'
          : 'bg-gradient-to-br from-slate-600 to-slate-800 border-slate-400 hover:scale-105'"
      >
        {{ v }}
      </button>
    </div>

    <!-- Стол для ставок -->
    <BettingTable
      :bets="bets"
      :disabled="isSpinning"
      @place="placeBet"
      @clear="clearBets"
    />

    <!-- Панель: ставка + спин + макс. выплата -->
    <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3 items-center
                bg-slate-900/60 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
      <div class="text-center md:text-left">
        <div class="text-xs uppercase tracking-wider text-slate-400">Ваша ставка</div>
        <div class="text-2xl font-black text-amber-400">
          {{ totalBet }} <span class="text-sm">фишек</span>
        </div>
      </div>

      <button
        @click="spin"
        :disabled="!canSpin"
        class="py-4 rounded-xl font-black text-xl tracking-wider transition-all shadow-2xl
               bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-900
               hover:from-amber-400 hover:to-amber-400 hover:scale-[1.02] active:scale-[0.98]
               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span v-if="!isSpinning">🎲 КРУТИТЬ</span>
        <span v-else>⏳ ВРАЩЕНИЕ...</span>
      </button>

      <div class="text-center md:text-right">
        <div class="text-xs uppercase tracking-wider text-slate-400">Макс. выплата</div>
        <div class="text-2xl font-black text-emerald-400">
          x36 <span class="text-sm">на число</span>
        </div>
      </div>
    </div>

    <!-- История спинов -->
    <SpinHistory :history="history" />
  </div>
</template>