import { createRouter, createWebHistory, RouteLocationNormalizedGeneric } from 'vue-router'
import RootPage from './pages/root-page.vue'
import ContainerView from './pages/container-view.vue'
import { HttpFileProvider, LocalFileProvider, VirtualFS } from '@tomsoftware/virtual-fs';

const localProvider = new LocalFileProvider();

async function buildNew() {
  const fs = new VirtualFS();
  fs.registerFileProvider(localProvider);

  const httpProvider = await HttpFileProvider.fromUrlList('test-files/', 'file-list.txt')
  fs.registerFileProvider(httpProvider)

  return fs;
}

const fsPromise: Promise<VirtualFS> = buildNew();

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ 
    path: '/',
    component: RootPage,
    props: (_: RouteLocationNormalizedGeneric) => ({
      fsPromise,
      localProvider,
     })
  },{ 
    path: '/container-view',
    name: 'container-view',
    component: ContainerView,
    props: (route: RouteLocationNormalizedGeneric) => ({
      path: (route.query.path as string) ?? '',
      fsPromise,
     })
  },
  ]
});
