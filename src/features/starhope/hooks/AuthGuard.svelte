<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '~/features/starhope/stores/auth.svelte';
  import StarHopeLogin from '~/features/starhope/routes/StarHopeLogin.svelte';

  let { children } = $props<{ children: import('svelte').Snippet }>();

  const { isLoggedIn } = authStore;

  onMount(() => {
    // 检查是否已有已登录用户（IndexedDB 持久化数据）
    // authStore 在内存中初始化，首次访问需要手动触发恢复
  });
</script>

{#if !isLoggedIn}
  <StarHopeLogin />
{:else}
  {@render children()}
{/if}
