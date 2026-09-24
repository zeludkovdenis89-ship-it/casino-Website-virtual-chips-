import { createRouter, createWebHashHistory } from 'vue-router'
import RouletteView from '../views/RouletteView.vue'
import BlackjackView from '../views/BlackjackView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/roulette' },
    { path: '/roulette', name: 'roulette', component: RouletteView },
    { path: '/blackjack', name: 'blackjack', component: BlackjackView },
  ],
})