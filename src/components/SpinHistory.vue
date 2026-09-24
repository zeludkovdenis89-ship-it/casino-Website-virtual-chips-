<script setup>
import { getColor } from '../utils/roulette'

defineProps({
  history: { type: Array, default: () => [] },
})

function colorClass(n) {
  const c = getColor(n)
  if (c === 'red') return 'bg-red-600 text-white'
  if (c === 'black') return 'bg-slate-900 text-white border border-slate-600'
  return 'bg-emerald-600 text-white'
}
</script>

<template>
  <div class="w-full bg-slate-900/60 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs uppercase tracking-wider text-slate-400">История спинов</h3>
      <span class="text-xs text-slate-500">{{ history.length }} / 12</span>
    </div>
    <div class="flex flex-wrap gap-1.5 min-h-[36px]">
      <div
        v-for="(n, i) in history"
        :key="i"
        class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
               shadow-lg transition-transform hover:scale-110"
        :class="colorClass(n)"
      >
        {{ n }}
      </div>
      <div v-if="!history.length" class="text-xs text-slate-600 italic self-center">
        Пока пусто — сделайте первый спин
      </div>
    </div>
  </div>
</template>