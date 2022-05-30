import { createApp } from 'vue'
import App from '@/App.vue'
import { createStore, storeSymbol } from '@/store'

createApp(App)
  .provide(storeSymbol, createStore())
  .mount('#app')
