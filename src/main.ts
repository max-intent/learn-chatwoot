import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import { useChatwoot } from './composables/useChatwoot'

// const { initChatwoot } = useChatwoot()

// // Initialize Chatwoot with your settings
// initChatwoot({
//   websiteToken: 'YNcFGxYPyoB34AuVVwmFBmtJ',
//   baseUrl: 'https://app.chatwoot.com', // Or your self-hosted URL
//   locale: 'en',
//   placement: 'unbound', // This makes it embed instead of popup
//   darkMode: false,
//   position: 'right'
// })

const app = createApp(App)
app.mount('#app')
