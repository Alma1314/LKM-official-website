import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '../layout/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'home', component: () => import('../views/Home.vue') },
      { path: 'write', name: 'write', component: () => import('../views/Write.vue') },
      { path: 'random', name: 'random', component: () => import('../views/Random.vue') },
      { path: 'mine', name: 'mine', component: () => import('../views/Mine.vue') },
      { path: 'messages', name: 'messages', component: () => import('../views/Messages.vue') },
      { path: 'settings', name: 'settings', component: () => import('../views/Settings.vue') },
      { path: 'rank', name: 'rank', component: () => import('../views/Rank.vue') },
      { path: 'bottle', name: 'bottle', component: () => import('../views/Bottle.vue') },
      { path: 'wish', name: 'wish', component: () => import('../views/Wish.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
