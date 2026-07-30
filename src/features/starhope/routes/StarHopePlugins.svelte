<script lang="ts">
  const plugins = [
    {
      id: 'lottery',
      name: '抽奖与点名',
      desc: '加权/不重复抽奖、花名册点名、缺席跟踪、批量操作、历史记录。支持模板导入导出。',
      icon: '🎰',
      installed: true,
      enabled: true,
    },
    {
      id: 'markdown-export',
      name: 'Markdown 导出',
      desc: '将题库和练习记录导出为 Markdown 格式，方便分享和打印。',
      icon: '📝',
      installed: true,
      enabled: true,
    },
    {
      id: 'more-coming',
      name: '更多插件即将推出',
      desc: '插件系统正在开发中，敬请期待自定义插件和社区市场。',
      icon: '🧩',
      installed: false,
      enabled: false,
    },
  ];

  let selectedPlugin = $state<string | null>(null);
</script>

<div class="max-w-5xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-deep-text mb-6">插件工具箱</h1>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each plugins as plugin (plugin.id)}
      <div class="card-base p-6 cursor-pointer hover:border-primary/30 transition-colors" onclick={() => { selectedPlugin = plugin.id; }}>
        <div class="text-3xl mb-3">{plugin.icon}</div>
        <h3 class="text-base font-semibold text-deep-text mb-1">{plugin.name}</h3>
        <p class="text-xs text-text-muted leading-relaxed mb-4">{plugin.desc}</p>
        <div class="flex items-center gap-2">
          {#if plugin.installed}
            <span class="text-xs px-2 py-0.5 rounded-full {plugin.enabled ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400' : 'bg-surface-3 text-text-muted'}">
              {plugin.enabled ? '已启用' : '已禁用'}
            </span>
          {:else}
            <button class="btn-primary rounded-lg px-3 py-1 text-xs font-semibold">安装</button>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if selectedPlugin === 'lottery'}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onclick={(e) => { if (e.target === e.currentTarget) selectedPlugin = null; }}>
      <div class="bg-card-bg rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onclick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-deep-text">🎰 抽奖与点名</h2>
          <button onclick={() => { selectedPlugin = null; }} class="text-text-muted hover:text-red-500 text-lg">&times;</button>
        </div>
        <p class="text-sm text-text-muted mb-4">此功能开发中。完成后将支持：加权抽奖、花名册管理、随机点名、历史记录导出。</p>
        <div class="flex justify-end">
          <button onclick={() => { selectedPlugin = null; }} class="btn-primary rounded-lg px-4 py-2 text-sm">知道了</button>
        </div>
      </div>
    </div>
  {/if}
</div>
