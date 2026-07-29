<template>
  <!-- 违规内容举报弹窗 -->
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="举报这封信"
    align-center
    width="min(420px, 92vw)"
  >
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
      <el-input
        v-model="detail"
        type="textarea"
        :rows="3"
        placeholder="补充说明（选填）"
        style="margin-top: 14px"
      />
    </div>
    <template #footer>
      <button class="chip" @click="$emit('update:modelValue', false)">取消</button>
      <button class="btn-grad" :disabled="!selected" @click="submit">提交举报</button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
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
  ElMessage({ message: '举报已提交，感谢你守护树洞 🌿', type: 'success', customClass: 'th-toast' })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.report-target { font-size: 13px; color: var(--text-sub); margin: 0 0 12px; }
.report-reasons { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
