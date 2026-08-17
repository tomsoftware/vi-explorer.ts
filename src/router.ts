import { createRouter, createWebHistory } from 'vue-router'
import RootPage from './pages/root-page.vue'
import FileBrowser from './components/file-browser.vue'

const routes = [
  { path: '/', component: RootPage },
  { path: '/browser', component: FileBrowser },
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
