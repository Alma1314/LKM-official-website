<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-semibold text-deep-text">完善个人信息</h3>
      <p class="text-sm text-text-muted mt-1">
        完成信息填写即可获得 <span class="text-primary font-semibold">100 积分</span> + "初来乍到" 称号
      </p>
    </div>

    <div class="max-w-sm mx-auto space-y-4">
      <!-- 显示名称 -->
      <div>
        <label class="block text-sm font-medium text-deep-text mb-1.5">显示名称</label>
        <input
          v-model="displayName"
          type="text"
          class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-deep-text text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          placeholder="你的昵称"
        />
      </div>

      <!-- 座右铭 -->
      <div>
        <label class="block text-sm font-medium text-deep-text mb-1.5">座右铭</label>
        <input
          v-model="bio"
          type="text"
          class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-deep-text text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          placeholder="一句话介绍自己"
        />
      </div>

      <!-- 简介 -->
      <div>
        <label class="block text-sm font-medium text-deep-text mb-1.5">个人简介</label>
        <textarea
          v-model="intro"
          rows="3"
          class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-deep-text text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
          placeholder="简单介绍一下你自己..."
        ></textarea>
      </div>
    </div>

    <div class="bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-sm mx-auto">
      <div class="flex items-center gap-3">
        <Icon icon="material-symbols:stars-outline" class="w-6 h-6 text-primary shrink-0" />
        <div class="text-sm">
          <p class="font-medium text-deep-text">完成奖励</p>
          <p class="text-text-muted">+100 积分 · 解锁"初来乍到"称号</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const displayName = ref('');
const bio = ref('');
const intro = ref('');

defineExpose({
  getData: () => ({
    displayName: displayName.value,
    bio: bio.value,
    intro: intro.value,
  }),
});
</script>
