import { createApp } from 'vue'
import App from '@/app.vue'
import { createStore, storeSymbol } from '@/store'

createApp(App)
  .provide(storeSymbol, createStore())
  .mount('#app')
