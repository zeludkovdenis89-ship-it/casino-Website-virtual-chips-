<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col items-center py-6 px-4">
    <header class="text-center mb-4">
      <h1 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 bg-clip-text text-transparent drop-shadow-lg">
        🎰 ROYAL CASINO
      </h1>
      <p class="text-slate-400 mt-1 text-sm">Рулетка · Блэкджек</p>
    </header>

    <NavBar />

    <main class="w-full flex-1 flex flex-col items-center">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="text-xs text-slate-600 mt-6">
      Игра на виртуальные фишки · Не является азартной игрой
    </footer>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>