<template>
  <!-- 违规内容举报弹窗 -->
  <div v-if="modelValue" class="dialog-overlay" @click.self="$emit('update:modelValue', false)">
    <div class="dialog glass">
      <h2>举报这封信</h2>
      <div class="report">
        <p class="report-target">举报对象：<b>{{ target }}</b></p>
        <div class="report-reasons">
          <button
            v-for="r in reasons"
            :key="r"
            class="chip"
            :class="{ active: selected === r }"
            @click="selected = r"
          >{{ r }}</button>
        </div>
        <textarea
          v-model="detail"
          rows="3"
          placeholder="补充说明（选填）"
          class="report-textarea"
        />
      </div>
      <div class="dialog-footer">
        <button class="chip" @click="$emit('update:modelValue', false)">取消</button>
        <button class="btn-grad" :disabled="!selected" @click="submit">提交举报</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { addReported } from '../store/storage'

const props = defineProps({
  modelValue: Boolean,
  target: { type: String, default: '匿名信' },
  targetId: { type: String, default: '' },
  targetType: { type: String, default: 'letter' }
})
const emit = defineEmits(['update:modelValue', 'reported'])

const reasons = ['色情低俗', '暴力血腥', '辱骂攻击', '垃圾广告', '其他违规']
const selected = ref('')
const detail = ref('')

watch(() => props.modelValue, (v) => { if (v) { selected.value = ''; detail.value = '' } })

function submit() {
  addReported(props.targetId)
  emit('reported')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.dialog-overlay { position: fixed; inset: 0; z-index: 200; background: var(--mask); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.dialog { padding: 24px; border-radius: var(--radius); max-width: 420px; width: 92vw; background: var(--card-bg); border: 1px solid var(--card-border); box-shadow: var(--card-shadow); }
.dialog h2 { font-size: 18px; margin: 0 0 14px; }
.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.report-target { font-size: 13px; color: var(--text-sub); margin: 0 0 12px; }
.report-reasons { display: flex; flex-wrap: wrap; gap: 8px; }
.report-textarea {
  width: 100%; margin-top: 14px; padding: 10px 12px;
  border: 1px solid var(--card-border); border-radius: var(--radius);
  background: var(--bg); color: var(--text-main);
  font-size: 13px; resize: vertical; font-family: inherit;
  box-sizing: border-box;
}
.report-textarea:focus { outline: none; border-color: var(--accent); }
</style>
