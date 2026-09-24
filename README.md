# Casino Website — Virtual Chips

A web casino app with games played on virtual chips: European roulette (37 numbers)
and blackjack. The project was built for learning purposes. No real money is accepted
or paid out.

## Features

### Roulette
- European roulette: 37 numbers (0–36)
- Bets on numbers, dozens, red/black, and zero
- Realistic payouts: number x36, dozen x3, color x2
- Animated wheel with a rolling ball
- Confetti on win
- Sound effects via Web Audio API
- History of the last spins

### Blackjack
- Full round against the dealer
- Dealer rule: draws until 17
- Score counting with a flexible ace (11 or 1)
- Buttons: deal, hit, stand
- Card dealing animation with 3D flip

### Common
- Shared balance across all games
- Balance saved to localStorage
- Animated gradient background
- Floating chips and icons
- Responsive layout

## Tech Stack

- Vue 3 (Composition API, script setup)
- Vue Router 4
- Vite 5
- Tailwind CSS 3
- canvas-confetti

## Installation

Node.js 18 or higher is required.

    npm install
    npm run dev

Open http://localhost:5173

## Build

    npm run build

The output files will appear in the dist folder.

## Project Structure

    src/
      components/
        NavBar.vue              navigation between games
        RouletteWheel.vue       wheel with numbers and ball
        BettingTable.vue        betting table
        SpinHistory.vue         spin history
        PlayingCard.vue         card for blackjack
        BigBetModal.vue         all-in confirmation modal
        AnimatedBackground.vue  background with floating chips
      views/
        RouletteView.vue        roulette logic
        BlackjackView.vue       blackjack logic
      router/
        index.js                routes
      store/
        wallet.js               shared balance
      utils/
        roulette.js             roulette data
        sound.js                sounds
        bigBets.js              all-in bets
      App.vue
      main.js
      style.css

## Game Rules

### Roulette
- Red numbers: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
- Black numbers: 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
- Zero: 0 (green, x36)

### Blackjack
- Goal: reach 21 or get closer to 21 than the dealer without going over
- Cards 2–10 = face value, J/Q/K = 10, A = 11 or 1
- Blackjack (21 with two cards) = win
- Bust (over 21) = loss

## Disclaimer

This is a game played with virtual chips. The project is not a gambling game
in the legal sense: no real money is accepted, withdrawn, or has any value.
All bets, apartments, and families in the game are jokes and virtual.
The project was built for learning and entertainment purposes.

## License

MIT
