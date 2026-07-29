<template>
  <div class="max-w-lg mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-amber-200">写一封信</h1>
      <p class="text-amber-200/60 mt-2 text-sm">写下你想说的，没有人知道你是谁</p>
    </div>

    <div class="space-y-4">
      <input
        v-model="title"
        type="text"
        class="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-amber-800/30 text-gray-200 text-sm focus:border-amber-700/50 outline-none placeholder-gray-500"
        placeholder="标题（选填）"
      />
      <textarea
        v-model="content"
        rows="8"
        class="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-amber-800/30 text-gray-200 text-sm focus:border-amber-700/50 outline-none placeholder-gray-500 resize-none"
        placeholder="在这里写下你想说的话..."
      ></textarea>
      <div>
        <label class="text-xs text-gray-500 mb-1.5 block">选择标签</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in LETTER_TAGS"
            :key="tag"
            type="button"
            class="px-3 py-1 rounded-full text-xs border transition-colors"
            :class="
              selectedTags.includes(tag)
                ? 'border-amber-500 bg-amber-900/30 text-amber-300'
                : 'border-gray-700 text-gray-500 hover:border-gray-600'
            "
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
      <button
        class="w-full py-3 rounded-xl bg-amber-900/40 border border-amber-800/50 text-amber-300 font-medium hover:bg-amber-900/50 transition-colors text-sm"
        :disabled="!content.trim()"
        @click="submit"
      >
        匿名发送
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LETTER_TAGS } from '../data/mock-letters';

const title = ref('');
const content = ref('');
const selectedTags = ref<string[]>([]);

function toggleTag(tag: string) {
  const i = selectedTags.value.indexOf(tag);
  if (i >= 0) selectedTags.value.splice(i, 1);
  else selectedTags.value.push(tag);
}

function submit() {
  if (!content.value.trim()) return;
  alert('你的信已匿名发出。');
  window.location.href = import.meta.env.BASE_URL + 'letters';
}
</script>
