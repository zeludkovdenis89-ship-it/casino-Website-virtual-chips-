import { ref, watch } from 'vue'

const STORAGE_KEY = 'casino_wallet_v1'

function loadBalance() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) return Number(saved)
  } catch (e) {}
  return 1000
}

export const balance = ref(loadBalance())

// Автосохранение при изменении
watch(balance, (val) => {
  try { localStorage.setItem(STORAGE_KEY, String(val)) } catch (e) {}
})

export function addBalance(amount) {
  balance.value = Math.max(0, balance.value + amount)
}

export function resetWallet() {
  balance.value = 1000
}