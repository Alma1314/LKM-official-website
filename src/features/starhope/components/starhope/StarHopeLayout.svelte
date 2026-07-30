<script lang="ts">
  import { navigation, navItems } from '../../stores/navigation.svelte';
  import { authStore } from '../../stores/auth.svelte';

  let { children } = $props<{ children: import('svelte').Snippet }>();

  function handleNav(route: string) {
    navigation.navigate(route as typeof navigation.current);
  }
</script>

<div class="flex min-h-screen">
  <!-- 侧边栏 -->
  <aside class="w-56 shrink-0 border-r border-surface-3 bg-card-bg min-h-screen p-4">
    <div class="mb-6">
      <h1 class="text-lg font-bold text-primary">StarHope</h1>
      <p class="text-xs text-text-muted mt-1">学习助手</p>
    </div>

    <nav class="space-y-1">
      {#each navItems as item}
        <button
          onclick={() => handleNav(item.route)}
          class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 {navigation.current === item.route ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-3'}"
        >
          <span class="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      {/each}
    </nav>

    <div class="mt-auto pt-4 border-t border-surface-3 absolute bottom-4 left-4 right-4">
      {#if authStore.currentUser}
        <div class="flex items-center gap-2 px-3 py-2">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {authStore.currentUser.nickname.charAt(0)}
          </div>
          <div class="text-sm">
            <div class="font-medium text-deep-text">{authStore.currentUser.nickname}</div>
            <div class="text-xs text-text-muted">@{authStore.currentUser.account}</div>
          </div>
        </div>
      {/if}
      <button
        onclick={() => { authStore.logout(); navigation.navigate('login'); }}
        class="w-full text-left px-3 py-2 text-xs text-text-muted hover:text-red-500 rounded-lg hover:bg-surface-3 transition-colors"
      >
        退出登录
      </button>
    </div>
  </aside>

  <!-- 主内容区 -->
  <main class="flex-1 min-w-0">
    {@render children()}
  </main>
</div>
