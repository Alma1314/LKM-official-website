<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '~/features/starhope/stores/auth.svelte';
  import { questionBankStore } from '~/features/starhope/stores/question-bank.svelte';

  let questionCount = $state(0);
  let folderCount = $state(0);
  let practiceCount = $state(0);

  onMount(async () => {
    await questionBankStore.loadQuestions();
    await questionBankStore.loadFolders();
    questionCount = questionBankStore.questions.length;
    folderCount = questionBankStore.folders.length;
  });
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-deep-text mb-1">
    你好，{authStore.currentUser?.nickname ?? '用户'}
  </h1>
  <p class="text-sm text-text-muted mb-8">欢迎回到 StarHope 学习助手</p>

  <!-- 统计卡片 -->
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
    <div class="card-base p-5 text-center">
      <div class="text-3xl mb-2">📚</div>
      <div class="text-2xl font-bold text-deep-text">{questionCount}</div>
      <div class="text-xs text-text-muted mt-1">题目总数</div>
    </div>
    <div class="card-base p-5 text-center">
      <div class="text-3xl mb-2">📁</div>
      <div class="text-2xl font-bold text-deep-text">{folderCount}</div>
      <div class="text-xs text-text-muted mt-1">文件夹</div>
    </div>
    <div class="card-base p-5 text-center">
      <div class="text-3xl mb-2">✏️</div>
      <div class="text-2xl font-bold text-deep-text">{practiceCount}</div>
      <div class="text-xs text-text-muted mt-1">练习记录</div>
    </div>
    <div class="card-base p-5 text-center">
      <div class="text-3xl mb-2">📝</div>
      <div class="text-2xl font-bold text-deep-text">0</div>
      <div class="text-xs text-text-muted mt-1">考试记录</div>
    </div>
  </div>

  <!-- 快捷入口模块 -->
  <h2 class="text-lg font-semibold text-deep-text mb-4">快捷功能</h2>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {#each [
      { label: '题库管理', desc: '创建和管理题目', icon: '📚' },
      { label: '开始练习', desc: '自定义选题练习', icon: '✏️' },
      { label: '模拟考试', desc: '全真考试模拟', icon: '📝' },
      { label: '错题本', desc: '回顾错题', icon: '📕' },
      { label: 'AI 助手', desc: '智能学习伙伴', icon: '🤖' },
      { label: '文档阅读', desc: 'PDF 标注阅读', icon: '📖' },
      { label: '插件中心', desc: '扩展功能', icon: '🧩' },
      { label: '应用设置', desc: '备份与偏好', icon: '⚙️' },
    ] as item}
      <div class="card-base p-4 cursor-pointer hover:border-primary/30 transition-colors">
        <div class="text-2xl mb-2">{item.icon}</div>
        <div class="text-sm font-semibold text-deep-text">{item.label}</div>
        <div class="text-xs text-text-muted mt-1">{item.desc}</div>
      </div>
    {/each}
  </div>
</div>
