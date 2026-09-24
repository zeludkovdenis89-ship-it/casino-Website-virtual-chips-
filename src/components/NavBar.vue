<script setup>
import { useRoute } from 'vue-router'
import { balance, resetWallet } from '../store/wallet'

const route = useRoute()
</script>

<template>
  <nav class="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 py-3 mb-4
              bg-slate-900/60 backdrop-blur rounded-2xl border border-amber-500/20 shadow-lg">
    <div class="flex gap-2">
      <RouterLink
        to="/roulette"
        class="px-4 py-2 rounded-lg font-bold transition-all"
        :class="route.name === 'roulette'
          ? 'bg-amber-500 text-slate-900 shadow-lg'
          : 'text-slate-300 hover:bg-slate-800'"
      >
        🎰 Рулетка
      </RouterLink>
      <RouterLink
        to="/blackjack"
        class="px-4 py-2 rounded-lg font-bold transition-all"
        :class="route.name === 'blackjack'
          ? 'bg-amber-500 text-slate-900 shadow-lg'
          : 'text-slate-300 hover:bg-slate-800'"
      >
        🃏 Блэкджек
      </RouterLink>
    </div>

    <div class="flex items-center gap-3">
      <div class="text-right">
        <div class="text-[10px] uppercase tracking-wider text-slate-400">Баланс</div>
        <div class="text-xl font-black text-amber-400">{{ balance }} <span class="text-xs">фишек</span></div>
      </div>
      <button
        @click="resetWallet"
        class="px-3 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
        title="Сбросить баланс"
      >
        🔄
      </button>
    </div>
  </nav>
</template>