<script setup lang="ts">
const plugins = [
  { id: 'lottery', name: '抽奖与点名', desc: '随机抽取题目或点名' },
  { id: 'timer', name: '计时器', desc: '考试倒计时' },
  { id: 'calculator', name: '计算器', desc: '科学计算器' },
];
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">插件中心</h1>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="p in plugins" :key="p.id" class="card-base p-6 text-center">
        <div class="text-3xl mb-3">🧩</div>
        <h3 class="font-semibold text-deep-text">{{ p.name }}</h3>
        <p class="text-xs text-text-muted mt-1">{{ p.desc }}</p>
      </div>
    </div>
  </div>
</template>
