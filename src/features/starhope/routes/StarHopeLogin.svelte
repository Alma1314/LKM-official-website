<script lang="ts">
  import { authStore } from '~/features/starhope/stores/auth.svelte';

  let nickname = $state('');
  let account = $state('');
  let password = $state('');
  let error = $state('');
  let isRegistering = $state(false);

  async function handleSubmit() {
    error = '';
    if (!account || !password) {
      error = '请填写账号和密码';
      return;
    }
    if (isRegistering && !nickname) {
      error = '请填写昵称';
      return;
    }

    let result: { ok: boolean; error?: string };
    if (isRegistering) {
      result = await authStore.register(nickname, account, password);
    } else {
      result = await authStore.login(account, password);
    }

    if (!result.ok) {
      error = result.error ?? '操作失败';
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-page-bg">
  <div class="w-full max-w-md px-4">
    <div class="card-base p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary">StarHope</h1>
        <p class="text-sm text-text-muted mt-2">本地加密账号，数据安全存储在你的浏览器中</p>
      </div>

      <div class="space-y-4">
        {#if isRegistering}
          <div>
            <label class="block text-sm font-medium mb-1 text-deep-text">昵称</label>
            <input
              type="text"
              bind:value={nickname}
              class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="你的昵称"
            />
          </div>
        {/if}

        <div>
          <label class="block text-sm font-medium mb-1 text-deep-text">账号</label>
          <input
            type="text"
            bind:value={account}
            class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="@账号名"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-deep-text">密码</label>
          <input
            type="password"
            bind:value={password}
            class="w-full rounded-lg border border-surface-3 bg-page-bg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="••••••"
            onkeydown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {#if error}
          <p class="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">{error}</p>
        {/if}

        <button
          onclick={handleSubmit}
          class="w-full btn-primary rounded-lg py-2.5 text-sm font-semibold"
        >
          {isRegistering ? '注册' : '登录'}
        </button>

        <p class="text-center text-xs text-text-muted">
          {isRegistering ? '已有账号？' : '没有账号？'}
          <button
            onclick={() => { isRegistering = !isRegistering; error = ''; }}
            class="text-primary hover:underline font-medium"
          >
            {isRegistering ? '去登录' : '去注册'}
          </button>
        </p>
      </div>
    </div>
  </div>
</div>
