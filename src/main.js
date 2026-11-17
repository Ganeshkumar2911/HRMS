import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { initTheme } from '@/utils/theme'
import PageTopBar from '@/components/default/PageTopBar.vue'

initTheme()
const app = createApp(App)

app.component('PageTopBar', PageTopBar)

app.use(createPinia())
app.use(router)

app.mount('#app')