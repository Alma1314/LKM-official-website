<template>
  <!-- 许愿墙 -->
  <div class="wish-wall">
    <div class="ww-head">
      <h3>🌟 {{ t("treehole.wish.title") }}</h3>
      <button class="btn-grad" @click="openMake = true">
        {{ t("treehole.wish.makeWish") }}
      </button>
    </div>
    <div class="ww-grid">
      <div
        v-for="w in wishes"
        :key="w.id"
        class="wish-note glass glass-hover"
        :style="{ '--wc': colorOf(w.id) }"
      >
        <p class="wish-text">{{ w.text }}</p>
        <div class="wish-foot">
          <span class="wish-light" @click="light(w)"
            >🕯️ {{ w.lights || 0 }}</span
          >
          <span class="wish-date">{{ dateText(w.createdAt) }}</span>
        </div>
        <div v-if="canManage(w)" class="wish-acts">
          <button class="mini" @click="openEdit(w)">
            {{ t("treehole.wish.edit") }}
          </button>
          <button class="mini danger" @click="remove(w)">
            {{ t("treehole.wish.delete") }}
          </button>
        </div>
      </div>
      <div v-if="!wishes.length" class="wish-empty">
        {{ t("treehole.wish.empty") }}
      </div>
    </div>

    <n-modal
      v-model:show="openMake"
      preset="card"
      :show-icon="false"
      :title="t('treehole.wish.makeDialogTitle')"
      style="width: min(420px, 92vw)"
    >
      <n-input
        v-model="text"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 3 }"
        :placeholder="t('treehole.wish.makePlaceholder')"
      />
      <template #footer>
        <button class="btn-grad" :disabled="!text.trim()" @click="make">
          {{ t("treehole.wish.lightWishBtn") }}
        </button>
      </template>
    </n-modal>

    <n-modal
      v-model:show="openEditBox"
      preset="card"
      :show-icon="false"
      :title="t('treehole.wish.editTitle')"
      style="width: min(420px, 92vw)"
    >
      <n-input
        v-model="editText"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 3 }"
        :placeholder="t('treehole.wish.editPlaceholder')"
      />
      <template #footer>
        <button class="btn-grad" :disabled="!editText.trim()" @click="saveEdit">
          {{ t("treehole.wish.save") }}
        </button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDialog, useMessage } from "naive-ui";
import { getWishes, addWish, lightWish, saveWishes } from "../stores/storage";
import { t } from "~/lib/i18n";

const message = useMessage();
const dialog = useDialog();
const wishes = ref([]);
const openMake = ref(false);
const text = ref("");
const openEditBox = ref(false);
const editText = ref("");
const editId = ref("");

const COLORS = [
  "#ffd6a5",
  "#caffbf",
  "#a0c4ff",
  "#ffc6ff",
  "#bdb2ff",
  "#9bf6ff",
];
function colorOf(id) {
  return COLORS[Math.abs(hash(id)) % COLORS.length];
}
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

onMounted(load);
function load() {
  wishes.value = getWishes();
}

function dateText(ts) {
  const d = new Date(ts || Date.now());
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function canManage(w) {
  return w.userId === "local" || w.ownerId === "local";
}

function light(w) {
  lightWish(w.id);
  w.lights = (w.lights || 0) + 1;
  load();
}

function make() {
  if (!text.value.trim()) return;
  const w = addWish({
    id: "wish_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
    text: text.value.trim(),
    lights: 0,
    status: "published",
    createdAt: Date.now(),
    ownerId: "local",
  });
  wishes.value.unshift(w);
  text.value = "";
  openMake.value = false;
  message.success(t("treehole.wish.lightSuccess"));
}

function openEdit(w) {
  editId.value = w.id;
  editText.value = w.text;
  openEditBox.value = true;
}

function saveEdit() {
  if (!editText.value.trim()) return;
  const list = getWishes();
  const i = list.findIndex((x) => x.id === editId.value);
  if (i > -1) {
    list[i].text = editText.value.trim();
    saveWishes(list);
  }
  wishes.value = list;
  openEditBox.value = false;
  message.success(t("treehole.wish.updateSuccess"));
}

function remove(w) {
  dialog.warning({
    title: t("treehole.wish.confirmDelete"),
    content: t("treehole.wish.confirmDeleteWish"),
    positiveText: t("treehole.wish.delete"),
    negativeText: t("treehole.wish.cancel"),
    onPositiveClick: () => {
      const list = getWishes().filter((x) => x.id !== w.id);
      saveWishes(list);
      wishes.value = list;
      message.success(t("treehole.wish.deleted"));
    },
  });
}
</script>

<style scoped>
.wish-wall {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ww-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ww-head h3 {
  margin: 0;
  font-size: 18px;
}
.ww-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.wish-note {
  padding: 14px;
  border-radius: var(--radius-sm);
  border-left: 4px solid var(--wc);
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}
.wish-text {
  margin: 0;
  font-size: calc(13px * var(--font-scale));
  line-height: 1.6;
}
.wish-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--text-sub);
  margin-top: 6px;
}
.wish-light {
  cursor: pointer;
  transition: transform 0.2s;
}
.wish-light:active {
  transform: scale(1.3);
}
.wish-acts {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.wish-acts .mini {
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.4);
  color: var(--text-main);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 11px;
  cursor: pointer;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
}
.wish-acts .mini:hover {
  border-color: var(--accent);
}
.wish-acts .mini.danger:hover {
  border-color: var(--danger);
  color: var(--danger);
}
.wish-empty {
  grid-column: 1/-1;
  text-align: center;
  color: var(--text-sub);
  padding: 24px;
}
</style>
