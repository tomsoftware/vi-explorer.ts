import { createRouter, createWebHistory, RouteLocationNormalizedGeneric } from 'vue-router'
import RootPage from './pages/root-page.vue'
import ContainerView from './pages/container-view.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ 
    path: '/',
    component: RootPage
  },{ 
    path: '/container-view',
    name: 'container-view',
    component: ContainerView,
    props: (route: RouteLocationNormalizedGeneric) => ({
       path: (route.query.path as string) ?? '',

     })
  },
  ]
});
