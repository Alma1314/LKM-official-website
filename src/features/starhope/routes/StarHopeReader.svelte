<script lang="ts">
  let uploadedFile = $state<File | null>(null);
  let fileText = $state('');
  let fileName = $state('');
  let isLoading = $state(false);
  let error = $state('');

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploadedFile = file;
    fileName = file.name;
    isLoading = true;
    error = '';

    try {
      const text = await file.text();
      fileText = text;
    } catch (e) {
      error = `无法读取文件: ${e instanceof Error ? e.message : '未知错误'}`;
      fileText = '';
    } finally {
      isLoading = false;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    uploadedFile = file;
    fileName = file.name;
    handleFileSelect({ target: { files: [file] } } as unknown as Event);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }
</script>

<div class="max-w-5xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-deep-text mb-6">文档阅读器</h1>

  {#if !fileText && !isLoading}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="card-base p-12 text-center border-dashed border-2 border-surface-3 hover:border-primary/30 transition-colors cursor-pointer"
      ondrop={handleDrop}
      ondragover={handleDragOver}
    >
      <div class="text-5xl mb-4">📄</div>
      <h2 class="text-lg font-semibold text-deep-text mb-2">拖放文件到此处</h2>
      <p class="text-sm text-text-muted mb-4">支持 .txt, .md, .csv, .html, .json, .xml, .log, .rtf 等文本文件</p>
      <label class="btn-primary rounded-lg px-6 py-2 text-sm font-semibold cursor-pointer inline-block">
        选择文件
        <input type="file" accept=".txt,.md,.csv,.html,.json,.xml,.log,.rtf,.ts,.js,.py,.css" onchange={handleFileSelect} class="hidden" />
      </label>
      <p class="text-xs text-text-muted mt-4">
        PDF 阅读和多格式支持即将推出。当前支持所有文本格式。
      </p>
    </div>
  {:else if isLoading}
    <div class="text-center py-16">
      <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-text-muted">正在解析文件...</p>
    </div>
  {:else}
    <!-- 文件内容展示 -->
    <div class="card-base">
      <div class="flex items-center justify-between border-b border-surface-3 px-6 py-3 mb-4">
        <div class="flex items-center gap-3">
          <span class="text-lg">📄</span>
          <div>
            <h3 class="text-sm font-semibold text-deep-text">{fileName}</h3>
            <p class="text-xs text-text-muted">{fileText.length.toLocaleString()} 字符</p>
          </div>
        </div>
        <button
          onclick={() => { fileText = ''; fileName = ''; uploadedFile = null; }}
          class="text-xs text-text-muted hover:text-red-500"
        >关闭</button>
      </div>
      <div class="px-6 py-4">
        <pre class="text-sm text-deep-text whitespace-pre-wrap font-mono bg-page-bg rounded-lg p-4 max-h-[60vh] overflow-y-auto leading-relaxed">{fileText}</pre>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="mt-4 p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
      {error}
    </div>
  {/if}
</div>
