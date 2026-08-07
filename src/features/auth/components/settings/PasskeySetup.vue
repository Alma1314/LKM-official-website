<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">通行密钥 (Passkey)</h3>

    <AuthStatus v-if="error" type="error" :message="error" class="text-xs" />

    <!-- 创建表单 -->
    <form class="flex gap-2 items-center" @submit.prevent="createPasskey">
      <input
        v-model.trim="newName"
        type="text"
        class="input input-bordered input-sm flex-1"
        placeholder="为新密钥命名（如：我的手机）"
      />
      <button type="submit" class="btn btn-primary btn-sm" :disabled="creating || !newName">
        <span v-if="creating" class="loading loading-spinner loading-xs"></span>
        <template v-else>创建</template>
      </button>
    </form>

    <div v-if="loadingList" class="py-4 text-center text-sm text-text-muted">加载中…</div>

    <!-- 列表 -->
    <ul v-else class="space-y-2">
      <li v-for="pk in passkeys" :key="pk.id" class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
        <div class="flex-1 min-w-0">
          <template v-if="renamingId === pk.id">
            <form class="flex gap-2" @submit.prevent="rename">
              <input v-model.trim="renameValue" type="text" class="input input-bordered input-sm w-full" />
              <button type="submit" class="btn btn-primary btn-xs" :disabled="!renameValue">保存</button>
              <button type="button" class="btn btn-ghost btn-xs" @click="renamingId = null">取消</button>
            </form>
          </template>
          <div v-else>
            <span class="font-medium block truncate">{{ pk.name }}</span>
            <span class="text-xs text-text-muted">{{ pk.credential_id.slice(0, 12) }}…</span>
          </div>
        </div>
        <div v-if="renamingId !== pk.id" class="flex gap-1 shrink-0">
          <button type="button" class="btn btn-ghost btn-xs" @click="beginRename(pk)">重命名</button>
          <button
            type="button"
            class="btn btn-ghost btn-xs text-error"
            :disabled="!!deletingId"
            @click="confirmDelete = pk.id"
          >
            删除
          </button>
        </div>
      </li>
      <li v-if="!passkeys.length" class="text-sm text-text-muted py-2">暂无通行密钥</li>
    </ul>

    <ConfirmDialog
      :open="confirmDelete !== null"
      title="删除通行密钥"
      message="确定删除该通行密钥吗？此操作不可撤销。"
      confirm-text="删除"
      danger
      @confirm="doDelete(confirmDelete!)"
      @cancel="confirmDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authApi } from '~/lib/api/modules/auth';
import type { PasskeyData } from '~/lib/api/modules/auth';
import type { User } from '~/types/auth';
import AuthStatus from '../shared/AuthStatus.vue';
import ConfirmDialog from './ConfirmDialog.vue';

defineProps<{
  user: User;
}>();

const passkeys = ref<PasskeyData[]>([]);
const loadingList = ref(false);
const error = ref('');
const newName = ref('');
const creating = ref(false);
const renamingId = ref<number | null>(null);
const renameValue = ref('');
const confirmDelete = ref<number | null>(null);
const deletingId = ref<number | null>(null);

async function load() {
  loadingList.value = true;
  error.value = '';
  try {
    const r = await authApi.listPasskeys();
    if (r.isErr()) {
      error.value = r.error.message;
      return;
    }
    passkeys.value = r.value;
  } finally {
    loadingList.value = false;
  }
}

async function createPasskey() {
  error.value = '';
  if (!newName.value) return;
  creating.value = true;
  try {
    const r = await authApi.createPasskey(newName.value);
    if (r.isErr()) {
      error.value = r.error.message;
      return;
    }
    passkeys.value = [...passkeys.value, r.value];
    newName.value = '';
  } finally {
    creating.value = false;
  }
}

function beginRename(pk: PasskeyData) {
  renamingId.value = pk.id;
  renameValue.value = pk.name;
}

async function rename() {
  error.value = '';
  const id = renamingId.value;
  if (id === null || !renameValue.value) return;
  const r = await authApi.renamePasskey(id, renameValue.value);
  if (r.isErr()) {
    error.value = r.error.message;
    return;
  }
  const idx = passkeys.value.findIndex((p) => p.id === id);
  if (idx >= 0) passkeys.value[idx] = r.value;
  renamingId.value = null;
  renameValue.value = '';
}

async function doDelete(id: number) {
  confirmDelete.value = null;
  deletingId.value = id;
  error.value = '';
  try {
    const r = await authApi.deletePasskey(id);
    if (r.isErr()) {
      error.value = r.error.message;
      return;
    }
    passkeys.value = passkeys.value.filter((p) => p.id !== id);
  } finally {
    deletingId.value = null;
  }
}

onMounted(load);
</script>
