import App from '@/App.vue'
import { createApp } from 'vue'
import { createStore, storeSymbol } from '@/store'
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

createApp(App)
  .provide(storeSymbol, createStore())
  .mount('#app');

library.add(fas);
dom.watch();