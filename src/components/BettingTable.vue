<script setup>
import { computed } from 'vue'
import { TABLE_LAYOUT, DOZENS, getColor } from '../utils/roulette'

const props = defineProps({
  bets: { type: Object, required: true }, // { 'red': 100, '17': 50, 'dozen-0': 100, ... }
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['place', 'clear'])

function numClass(n) {
  const c = getColor(n)
  if (c === 'red') return 'bg-red-600 hover:bg-red-500'
  if (c === 'black') return 'bg-slate-900 hover:bg-slate-700 border border-slate-600'
  return 'bg-emerald-600 hover:bg-emerald-500'
}

function place(betKey, event) {
  if (props.disabled) return
  emit('place', { key: betKey, event })
}

function hasBet(key) {
  return props.bets[key] > 0
}
</script>

<template>
  <div class="w-full bg-slate-900/40 rounded-2xl p-3 border border-slate-700/50">
    <div class="flex gap-2">
      <!-- Zero -->
      <button
        @click="place('0', $event)"
        :disabled="disabled"
        class="w-12 md:w-14 rounded-lg bg-emerald-600 hover:bg-emerald-500
               text-white font-black text-lg transition relative
               disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        :class="hasBet('0') ? 'ring-4 ring-amber-400' : ''"
      >
        0
        <span v-if="hasBet('0')" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
          {{ bets['0'] }}
        </span>
      </button>

      <div class="flex-1 grid gap-1">
        <!-- 3 ряда чисел -->
        <div v-for="(row, ri) in TABLE_LAYOUT" :key="ri" class="grid grid-cols-12 gap-1">
          <button
            v-for="n in row"
            :key="n"
            @click="place(String(n), $event)"
            :disabled="disabled"
            class="h-9 md:h-10 rounded-md text-white font-bold text-sm transition relative
                   disabled:opacity-50 disabled:cursor-not-allowed shadow"
            :class="[numClass(n), hasBet(String(n)) ? 'ring-4 ring-amber-400' : '']"
          >
            {{ n }}
            <span v-if="hasBet(String(n))" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center">
              {{ bets[String(n)] }}
            </span>
          </button>
        </div>

        <!-- Дюжины -->
        <div class="grid grid-cols-3 gap-1 mt-1">
          <button
            v-for="(d, i) in DOZENS"
            :key="i"
            @click="place('dozen-' + i, $event)"
            :disabled="disabled"
            class="h-9 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600
                   text-white font-bold text-xs uppercase tracking-wider transition relative
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :class="hasBet('dozen-' + i) ? 'ring-4 ring-amber-400' : ''"
          >
            {{ d.label }}
            <span v-if="hasBet('dozen-' + i)" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center">
              {{ bets['dozen-' + i] }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Внешние ставки: цвета + колонки -->
    <div class="grid grid-cols-3 gap-1 mt-2">
      <button
        @click="place('red', $event)"
        :disabled="disabled"
        class="h-10 rounded-md bg-red-600 hover:bg-red-500 text-white font-black text-sm
               transition relative disabled:opacity-50 disabled:cursor-not-allowed shadow"
        :class="hasBet('red') ? 'ring-4 ring-amber-400' : ''"
      >
        🔴 КРАСНОЕ
        <span v-if="hasBet('red')" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
          {{ bets['red'] }}
        </span>
      </button>
      <button
        @click="place('black', $event)"
        :disabled="disabled"
        class="h-10 rounded-md bg-slate-900 hover:bg-slate-700 border border-slate-600
               text-white font-black text-sm transition relative
               disabled:opacity-50 disabled:cursor-not-allowed shadow"
        :class="hasBet('black') ? 'ring-4 ring-amber-400' : ''"
      >
        ⚫ ЧЁРНОЕ
        <span v-if="hasBet('black')" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
          {{ bets['black'] }}
        </span>
      </button>
      <button
        @click="emit('clear')"
        :disabled="disabled"
        class="h-10 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600
               text-slate-300 font-bold text-xs transition
               disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🧹 ОЧИСТИТЬ
      </button>
    </div>
  </div>
</template>