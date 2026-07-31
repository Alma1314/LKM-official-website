<script lang="ts">
  import Icon from '@iconify/svelte';
  import { buildUrl } from '~/core/utils/paths';

  interface SearchResultItem {
    type: 'post' | 'file' | 'user';
    title: string;
    desc: string;
    url: string;
    tag?: string;
  }

  const mockData: SearchResultItem[] = [
    { type: 'post', title: '量子力学入门：波函数坍缩', desc: '作者：七月O · 12 点赞 · 34 评论', url: buildUrl(`/forum/post/post-1`), tag: '物理学' },
    { type: 'post', title: '数学建模竞赛经验分享', desc: '作者：七月花 · 28 点赞 · 56 评论', url: buildUrl(`/forum/post/post-3`), tag: '数学' },
    { type: 'post', title: 'Python 数据分析入门教程', desc: '作者：七月墨染 · 45 点赞 · 23 评论', url: buildUrl(`/forum/post/post-5`), tag: '信息科学' },
    { type: 'file', title: '天体物理数据集（2026版）.zip', desc: '上传者：七月O · 128 MB · 下载 230 次', url: buildUrl(`/files/file-1`), tag: '文件' },
    { type: 'file', title: '线性代数习题集.pdf', desc: '上传者：七月墨染 · 5.2 MB · 下载 89 次', url: buildUrl(`/files/file-3`), tag: '文件' },
    { type: 'user', title: '七月O', desc: '中国科学院国家天文台博士 · 引力波与黑洞物理', url: buildUrl(`/user/qiyue-o`), tag: '用户' },
    { type: 'user', title: '七月花', desc: '有理想的博士 · 科学教育倡导者', url: buildUrl(`/user/qiyue-hua`), tag: '用户' },
    { type: 'user', title: '七月墨染', desc: '双非物理，卧薪尝胆三千日', url: buildUrl(`/user/qiyue-moran`), tag: '用户' },
  ];

  let keyword = $state('');
  let isOpen = $state(false);
  let results: { posts: SearchResultItem[]; files: SearchResultItem[]; users: SearchResultItem[] } = $state({
    posts: [],
    files: [],
    users: [],
  });

  const totalCount = $derived(results.posts.length + results.files.length + results.users.length);

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      setTimeout(() => {
        const input = document.getElementById('global-search-input');
        input?.focus();
      }, 100);
    }
  }

  function close() {
    isOpen = false;
    keyword = '';
    results = { posts: [], files: [], users: [] };
  }

  let searchTimer: ReturnType<typeof setTimeout>;

  function doSearch(kw: string) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (!kw.trim()) {
        results = { posts: [], files: [], users: [] };
        return;
      }
      const lower = kw.toLowerCase();
      const filtered = mockData.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.desc.toLowerCase().includes(lower)
      );
      results = {
        posts: filtered.filter((r) => r.type === 'post'),
        files: filtered.filter((r) => r.type === 'file'),
        users: filtered.filter((r) => r.type === 'user'),
      };
    }, 200);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    keyword = target.value;
    doSearch(keyword);
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const panel = document.getElementById('global-search-panel');
    const btn = document.getElementById('global-search-btn');
    if (panel && !panel.contains(target) && btn && !btn.contains(target)) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<!-- 桌面端搜索框 -->
<div id="global-search-btn" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
    bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
    dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10 cursor-pointer"
  onclick={toggle}
  onkeydown={(e) => e.key === 'Enter' && toggle()}
  role="button"
  tabindex="0"
>
  <Icon icon="material-symbols:search" class="text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
  <span class="text-sm text-black/30 dark:text-white/30 px-3 w-40 select-none">搜索</span>
</div>

<!-- 移动端搜索按钮 -->
<button
  aria-label="搜索"
  class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90"
  id="global-search-mobile-btn"
  onclick={toggle}
>
  <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- 搜索面板 -->
{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/40 dark:bg-black/70 z-[100] flex items-start justify-center pt-20" onclick={close}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      id="global-search-panel"
      class="w-full max-w-xl max-h-[80vh] overflow-y-auto card-base rounded-2xl shadow-2xl p-3 mx-4"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center gap-3 px-2 pb-3 border-b border-surface-3">
        <Icon icon="material-symbols:search" class="w-5 h-5 text-text-muted shrink-0" />
        <input
          id="global-search-input"
          type="text"
          value={keyword}
          oninput={handleInput}
          placeholder="搜索帖子、文件、用户..."
          class="flex-1 bg-transparent text-sm text-deep-text outline-none placeholder:text-text-muted/50"
        />
        <button class="text-xs text-text-muted hover:text-deep-text px-2" onclick={close}>ESC</button>
      </div>

      {#if keyword.trim() === ''}
        <div class="px-3 py-8 text-center text-sm text-text-muted">
          输入关键词搜索社区内容
        </div>
      {:else if totalCount === 0}
        <div class="px-3 py-8 text-center text-sm text-text-muted">
          未找到与 "<span class="text-deep-text">{keyword}</span>" 相关的内容
        </div>
      {:else}
        <div class="space-y-4 pt-2">
          {#if results.posts.length > 0}
            <div>
              <div class="text-xs text-text-muted/60 font-medium px-2 mb-1 uppercase">帖子</div>
              {#each results.posts as item}
                <a href={item.url} class="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-page-bg transition-colors group">
                  <Icon icon="material-symbols:article-outline" class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-deep-text group-hover:text-primary truncate">{item.title}</div>
                    <div class="text-xs text-text-muted mt-0.5">{item.desc}</div>
                  </div>
                  <span class="text-xs text-text-muted/50 shrink-0">{item.tag}</span>
                </a>
              {/each}
            </div>
          {/if}

          {#if results.files.length > 0}
            <div>
              <div class="text-xs text-text-muted/60 font-medium px-2 mb-1 uppercase">文件</div>
              {#each results.files as item}
                <a href={item.url} class="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-page-bg transition-colors group">
                  <Icon icon="material-symbols:folder-outline" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-deep-text group-hover:text-primary truncate">{item.title}</div>
                    <div class="text-xs text-text-muted mt-0.5">{item.desc}</div>
                  </div>
                  <span class="text-xs text-text-muted/50 shrink-0">{item.tag}</span>
                </a>
              {/each}
            </div>
          {/if}

          {#if results.users.length > 0}
            <div>
              <div class="text-xs text-text-muted/60 font-medium px-2 mb-1 uppercase">用户</div>
              {#each results.users as item}
                <a href={item.url} class="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-page-bg transition-colors group">
                  <Icon icon="material-symbols:person-outline" class="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-deep-text group-hover:text-primary truncate">{item.title}</div>
                    <div class="text-xs text-text-muted mt-0.5">{item.desc}</div>
                  </div>
                  <span class="text-xs text-text-muted/50 shrink-0">{item.tag}</span>
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
