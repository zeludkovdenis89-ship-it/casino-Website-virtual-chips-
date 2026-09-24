<script setup>
import { ref, computed } from 'vue'
import { balance, addBalance } from '../store/wallet'
import PlayingCard from '../components/PlayingCard.vue'

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']

function buildDeck() {
  const deck = []
  for (const s of SUITS) for (const r of RANKS) deck.push({ rank: r, suit: s })
  // Тасуем Фишером-Йетсом
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function cardValue(card) {
  if (card.rank === 'A') return 11
  if (['J', 'Q', 'K'].includes(card.rank)) return 10
  return Number(card.rank)
}

function handValue(hand) {
  let sum = 0
  let aces = 0
  for (const c of hand) {
    sum += cardValue(c)
    if (c.rank === 'A') aces++
  }
  while (sum > 21 && aces > 0) { sum -= 10; aces-- }
  return sum
}

const deck = ref(buildDeck())
const playerHand = ref([])
const dealerHand = ref([])
const bet = ref(50)
const phase = ref('idle')      // idle | playing | dealer | finished
const message = ref('Сделайте ставку и нажмите «Раздать»')
const revealDealer = ref(false)
const lastOutcome = ref(null)  // win | lose | push | blackjack

const playerScore = computed(() => handValue(playerHand.value))
const dealerScore = computed(() => handValue(dealerHand.value))
const canBet = computed(() => phase.value === 'idle' && !isNaN(bet.value) && bet.value > 0 && bet.value <= balance.value)

function drawCard() {
  if (deck.value.length < 10) deck.value = buildDeck()
  return deck.value.pop()
}

function deal() {
  if (!canBet.value) {
    if (bet.value > balance.value) message.value = '❌ Недостаточно средств!'
    else if (bet.value <= 0) message.value = '❌ Ставка должна быть больше нуля!'
    return
  }

  addBalance(-bet.value)
  playerHand.value = []
  dealerHand.value = []
  revealDealer.value = false
  lastOutcome.value = null

  // По 2 карты игроку и дилеру
  playerHand.value.push(drawCard(), drawCard())
  dealerHand.value.push(drawCard(), drawCard())

  phase.value = 'playing'
  message.value = 'Ваш ход: возьмите карту или остановитесь'

  // Проверка на блэкджек сразу
  if (playerScore.value === 21) {
    setTimeout(() => stand(), 400)
  }
}

function hit() {
  if (phase.value !== 'playing') return
  playerHand.value.push(drawCard())
  if (playerScore.value > 21) {
    phase.value = 'finished'
    lastOutcome.value = 'lose'
    revealDealer.value = true
    message.value = `💥 Перебор (${playerScore.value}). Вы проиграли ${bet.value}`
  }
}

async function stand() {
  if (phase.value !== 'playing') return
  phase.value = 'dealer'
  revealDealer.value = true
  message.value = 'Ход дилера...'

  // Дилер берёт до 17
  while (handValue(dealerHand.value) < 17) {
    await new Promise(r => setTimeout(r, 700))
    dealerHand.value.push(drawCard())
  }

  await new Promise(r => setTimeout(r, 400))

  const p = playerScore.value
  const d = dealerScore.value

  if (d > 21) {
    lastOutcome.value = 'win'
    addBalance(bet.value * 2)
    message.value = `🎉 Дилер перебрал (${d}). Вы выиграли ${bet.value * 2}!`
  } else if (p > d) {
    lastOutcome.value = 'win'
    addBalance(bet.value * 2)
    message.value = `🎉 Победа! ${p} против ${d}. Выигрыш ${bet.value * 2}`
  } else if (p < d) {
    lastOutcome.value = 'lose'
    message.value = `😢 Проигрыш. ${p} против ${d}`
  } else {
    lastOutcome.value = 'push'
    addBalance(bet.value)
    message.value = `🤝 Ничья (${p}). Ставка возвращена.`
  }
  phase.value = 'finished'
}

function newRound() {
  if (phase.value !== 'idle' && phase.value !== 'finished') return
  playerHand.value = []
  dealerHand.value = []
  revealDealer.value = false
  lastOutcome.value = null
  phase.value = 'idle'
  message.value = 'Сделайте ставку и нажмите «Раздать»'
}

function addBet(n) {
  if (phase.value !== 'idle') return
  bet.value = Math.max(1, Math.min(balance.value, bet.value + n))
}
</script>

<template>
  <div class="w-full max-w-4xl flex flex-col items-center">
    <!-- Dealer -->
    <section class="w-full mb-6">
      <div class="flex items-center justify-between mb-2 px-2">
        <h2 class="text-sm uppercase tracking-wider text-slate-400">Дилер</h2>
        <div v-if="dealerHand.length" class="text-2xl font-black"
             :class="dealerScore > 21 ? 'text-rose-400' : 'text-amber-300'">
          {{ revealDealer ? dealerScore : '?' }}
        </div>
      </div>
      <div class="flex gap-3 justify-center min-h-[140px] items-center
                  bg-slate-900/40 rounded-2xl border border-slate-700/50 p-4">
        <PlayingCard
          v-for="(card, i) in dealerHand"
          :key="'d' + i"
          :card="card"
          :face-down="!revealDealer && i === 1"
          :delay="i * 180"
        />
        <div v-if="!dealerHand.length" class="text-slate-600 text-sm italic">Ожидание раздачи...</div>
      </div>
    </section>

    <!-- Message -->
    <p class="text-lg font-medium min-h-[28px] mb-6 text-center"
       :class="{
         'text-emerald-400': lastOutcome === 'win',
         'text-rose-400': lastOutcome === 'lose',
         'text-sky-300': lastOutcome === 'push',
         'text-amber-300': !lastOutcome,
       }">
      {{ message }}
    </p>

    <!-- Player -->
    <section class="w-full mb-6">
      <div class="flex items-center justify-between mb-2 px-2">
        <h2 class="text-sm uppercase tracking-wider text-slate-400">Вы</h2>
        <div v-if="playerHand.length" class="text-2xl font-black"
             :class="playerScore > 21 ? 'text-rose-400' : 'text-amber-300'">
          {{ playerScore }}
        </div>
      </div>
      <div class="flex gap-3 justify-center min-h-[140px] items-center
                  bg-slate-900/40 rounded-2xl border border-slate-700/50 p-4">
        <PlayingCard
          v-for="(card, i) in playerHand"
          :key="'p' + i"
          :card="card"
          :delay="i * 180"
        />
        <div v-if="!playerHand.length" class="text-slate-600 text-sm italic">Ожидание раздачи...</div>
      </div>
    </section>

    <!-- Controls -->
    <div class="w-full bg-slate-900/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 shadow-xl">
      <!-- Bet -->
      <div class="flex items-center gap-2 mb-5" v-if="phase === 'idle' || phase === 'finished'">
        <span class="text-slate-400 text-sm w-16">Ставка:</span>
        <button @click="addBet(-10)" class="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold">−</button>
        <input v-model.number="bet" type="number" min="1" :max="balance"
               class="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-center text-lg font-bold focus:outline-none focus:border-amber-400" />
        <button @click="addBet(10)" class="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold">+</button>
        <button @click="bet = balance"
                class="px-3 h-10 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 text-sm font-semibold">MAX</button>
      </div>

      <!-- Buttons -->
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="deal"
          :disabled="!canBet"
          class="col-span-1 py-4 rounded-xl font-black text-slate-900 transition-all shadow-xl
                 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-amber-400
                 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
          🎴 РАЗДАТЬ
        </button>

        <button
          @click="hit"
          :disabled="phase !== 'playing'"
          class="py-4 rounded-xl font-black text-white transition-all shadow-xl
                 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400
                 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
          ➕ ВЗЯТЬ
        </button>

        <button
          @click="stand"
          :disabled="phase !== 'playing'"
          class="py-4 rounded-xl font-black text-white transition-all shadow-xl
                 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400
                 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
          ✋ ХВАТИТ
        </button>
      </div>

      <button
        v-if="phase === 'finished'"
        @click="newRound"
        class="w-full mt-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition"
      >
        🔄 Новый раунд
      </button>
    </div>
  </div>
</template>