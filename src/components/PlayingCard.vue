<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true }, // { rank: 'A', suit: '♠' }
  faceDown: { type: Boolean, default: false },
  delay: { type: Number, default: 0 },
})

const isRed = computed(() => props.card?.suit === '♥' || props.card?.suit === '♦')

const suitColor = computed(() => (isRed.value ? 'text-red-600' : 'text-slate-900'))
</script>

<template>
  <div
    class="card-wrap"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <div class="card-inner" :class="{ 'is-flipped': faceDown }">
      <!-- Лицевая сторона -->
      <div class="card-face card-front">
        <div class="corner top-left" :class="suitColor">
          <span class="rank">{{ card.rank }}</span>
          <span class="suit">{{ card.suit }}</span>
        </div>
        <div class="center-suit" :class="suitColor">{{ card.suit }}</div>
        <div class="corner bottom-right rotate-180" :class="suitColor">
          <span class="rank">{{ card.rank }}</span>
          <span class="suit">{{ card.suit }}</span>
        </div>
      </div>

      <!-- Рубашка -->
      <div class="card-face card-back">
        <div class="back-pattern">🎴</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-wrap {
  width: 90px;
  height: 130px;
  perspective: 1000px;
  animation: dealIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes dealIn {
  from {
    opacity: 0;
    transform: translateY(-40px) rotate(-15deg) scale(0.6);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0) scale(1);
  }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  backface-visibility: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-front {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  position: relative;
}

.corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  font-weight: 800;
}

.corner.top-left {
  top: 6px;
  left: 8px;
}

.corner.bottom-right {
  bottom: 6px;
  right: 8px;
}

.rank {
  font-size: 18px;
}

.suit {
  font-size: 14px;
}

.center-suit {
  font-size: 42px;
  opacity: 0.9;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.card-back {
  background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%);
  transform: rotateY(180deg);
}

.back-pattern {
  font-size: 44px;
  opacity: 0.85;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
}

.card-wrap:hover .card-inner:not(.is-flipped) {
  transform: translateY(-6px) scale(1.05);
}
</style>