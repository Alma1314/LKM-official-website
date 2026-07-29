<template>
  <div id="treehole-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import AppRoot from './App.vue'
import router from './router/index'
import './styles/global.css'

function bootstrap() {
  const container = document.getElementById('treehole-root')
  if (!container) return

  const app = createApp(AppRoot)

  // 注册全部 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(ElementPlus)
  app.use(router)
  app.mount(container)
}

function handleMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  const msg = event.data
  if (!msg || !msg.type) return

  switch (msg.type) {
    case 'theme':
      document.documentElement.setAttribute('data-theme', msg.theme || 'day')
      break
    case 'auth':
      // 未来可扩展用户状态同步
      break
  }
}

onMounted(() => {
  bootstrap()
  window.addEventListener('message', handleMessage)
  // 发送就绪信号
  window.parent.postMessage({ type: 'treehole-ready' }, window.location.origin)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style>
#treehole-app {
  min-height: 100vh;
}
</style>
