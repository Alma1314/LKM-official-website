<script setup lang="ts">
import { ref } from 'vue';

const _props = defineProps<{
  replyTo: string;
  isLoggedIn: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [content: string];
  cancel: [];
}>();

const content = ref('');

function handleSubmit() {
  if (!content.value.trim()) return;
  emit('submit', content.value.trim());
  content.value = '';
}
</script>

<template>
  <div class="mt-4">
    <div v-if="replyTo" class="text-sm text-text-muted mb-2">
      回复：{{ replyTo }}
      <button class="text-primary ml-2" @click="emit('cancel')">取消</button>
    </div>
    <div v-if="!isLoggedIn" class="text-sm text-text-muted">
      请<a href="/login" class="text-primary">登录</a>后发表评论
    </div>
    <form v-else @submit.prevent="handleSubmit" class="flex gap-2">
      <textarea
        v-model="content"
        class="flex-1 rounded-lg border border-border bg-input p-2 text-sm resize-none"
        rows="2"
        placeholder="写下你的想法..."
      />
      <button
        type="submit"
        class="btn-plain rounded-lg px-4 py-2 bg-primary text-white text-sm self-end"
        :disabled="submitting || !content.trim()"
      >
        {{ submitting ? '发送中...' : '发送' }}
      </button>
    </form>
  </div>
</template>
