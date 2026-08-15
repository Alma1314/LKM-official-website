<template>
  <n-modal
    :show="show"
    :mask-closable="false"
    :close-on-esc="false"
    :closable="false"
    preset="card"
    title="我要提问"
    style="width: 640px; max-width: 92vw"
    @update:show="onUpdateShow"
    @mask-click="requestClose"
    @esc="requestClose"
  >
    <template #header-extra>
      <button
        type="button"
        class="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-deep-text hover:bg-surface-3 transition-colors"
        aria-label="关闭"
        @click="requestClose"
      >
        ✕
      </button>
    </template>

    <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="top">
      <n-form-item label="标题" path="title">
        <n-input v-model:value="formModel.title" placeholder="一句话概括你的问题" />
      </n-form-item>

      <n-form-item label="本人情况" path="situation">
        <n-input
          v-model:value="formModel.situation"
          type="textarea"
          :rows="3"
          placeholder="如：省份/分数/选科、年级、背景等"
        />
      </n-form-item>

      <n-form-item label="详细问题" path="detail">
        <n-input v-model:value="formModel.detail" type="textarea" :rows="5" placeholder="详细描述你的问题..." />
      </n-form-item>

      <div class="grid grid-cols-2 gap-4">
        <n-form-item label="悬赏人数" path="bountyPeople">
          <n-input-number v-model:value="formModel.bountyPeople" :min="1" :precision="0" placeholder="≥1" />
        </n-form-item>
        <n-form-item label="悬赏人均积分" path="bountyPerPerson">
          <n-input-number v-model:value="formModel.bountyPerPerson" :min="1" :precision="0" placeholder="≥1" />
        </n-form-item>
      </div>

      <div class="text-sm text-amber-500 font-medium mb-4">总悬赏：{{ totalBounty }} 积分</div>

      <div class="flex gap-3 justify-end">
        <n-button @click="handleSaveDraft">暂存</n-button>
        <n-button type="primary" @click="handlePublish">发布</n-button>
      </div>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NInputNumber, NModal, useDialog, useMessage } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { QA_DRAFT_STORAGE_KEY, computeTotalBounty, parseDraft, serializeDraft } from '../lib/draft';
import type { QaDraft } from '../lib/draft';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ 'update:show': [value: boolean] }>();

const dialog = useDialog();
const message = useMessage();

const formRef = ref<FormInst | null>(null);

const formModel = reactive<QaDraft>({
  title: '',
  situation: '',
  detail: '',
  bountyPeople: null,
  bountyPerPerson: null,
});

const rules: FormRules = {
  title: { required: true, message: '请输入标题', trigger: ['input', 'blur'] },
  situation: { required: true, message: '请填写本人情况', trigger: ['input', 'blur'] },
  detail: { required: true, message: '请填写详细问题', trigger: ['input', 'blur'] },
  bountyPeople: [
    { required: true, message: '请填写悬赏人数', trigger: ['blur', 'change'] },
    { type: 'integer', min: 1, message: '悬赏人数需为 ≥1 的整数', trigger: ['blur', 'change'] },
  ],
  bountyPerPerson: [
    { required: true, message: '请填写悬赏人均积分', trigger: ['blur', 'change'] },
    { type: 'integer', min: 1, message: '悬赏人均积分需为 ≥1 的整数', trigger: ['blur', 'change'] },
  ],
};

const totalBounty = computed<number>(() => computeTotalBounty(formModel.bountyPeople, formModel.bountyPerPerson));

watch(
  () => props.show,
  (open) => {
    if (open) {
      const draft = loadDraft();
      if (draft) {
        Object.assign(formModel, draft);
      } else {
        resetForm();
      }
    }
  },
);

function resetForm(): void {
  formModel.title = '';
  formModel.situation = '';
  formModel.detail = '';
  formModel.bountyPeople = null;
  formModel.bountyPerPerson = null;
  formRef.value?.restoreValidation();
}

function loadDraft(): QaDraft | null {
  return parseDraft(localStorage.getItem(QA_DRAFT_STORAGE_KEY));
}

function saveDraft(): void {
  localStorage.setItem(QA_DRAFT_STORAGE_KEY, serializeDraft(formModel));
}

function clearDraft(): void {
  localStorage.removeItem(QA_DRAFT_STORAGE_KEY);
}

function handleSaveDraft(): void {
  saveDraft();
  message.success('草稿已暂存');
}

async function handlePublish(): Promise<void> {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  clearDraft();
  message.success('问题已发布');
  resetForm();
  emit('update:show', false);
}

function requestClose(): void {
  dialog.warning({
    title: '退出提问',
    content: '退出了，不会暂存相应内容，真的要退出吗？',
    positiveText: '退出',
    negativeText: '我再考虑',
    onPositiveClick: () => {
      emit('update:show', false);
    },
  });
}

function onUpdateShow(value: boolean): void {
  if (!value) requestClose();
}
</script>
