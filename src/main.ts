import App from '@/App.vue'
import { createApp } from 'vue'
import { createStore, storeSymbol } from '@/store'

createApp(App)
  .provide(storeSymbol, createStore())
  .mount('#app');