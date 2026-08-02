<template>
  <!-- 许愿墙 -->
  <div class="wish-wall">
    <div class="ww-head">
      <h3>🌟 许愿墙</h3>
      <button class="btn-grad" @click="openMake = true">+ 许个愿</button>
    </div>
    <div class="ww-grid">
      <div v-for="w in wishes" :key="w.id" class="wish-note glass glass-hover" :style="{ '--wc': colorOf(w.id) }">
        <p class="wish-text">{{ w.text }}</p>
        <div class="wish-foot">
          <span class="wish-light" @click="light(w)">🕯️ {{ w.lights || 0 }}</span>
          <span class="wish-date">{{ dateText(w.createdAt) }}</span>
        </div>
        <div v-if="canManage(w)" class="wish-acts">
          <button class="mini" @click="openEdit(w)">✏️ 编辑</button>
          <button class="mini danger" @click="remove(w)">🗑️ 删除</button>
        </div>
      </div>
      <div v-if="!wishes.length" class="wish-empty">还没有愿望，做第一个许愿的人吧～</div>
    </div>

    <el-dialog v-model="openMake" title="写下你的愿望" align-center width="min(420px,92vw)">
      <el-input v-model="text" type="textarea" :rows="3" placeholder="把愿望交给星光…" />
      <template #footer>
        <button class="btn-grad" :disabled="!text.trim()" @click="make">🌟 点亮愿望</button>
      </template>
    </el-dialog>

    <el-dialog v-model="openEditBox" title="编辑愿望" align-center width="min(420px,92vw)">
      <el-input v-model="editText" type="textarea" :rows="3" placeholder="修改你的愿望…" />
      <template #footer>
        <button class="btn-grad" :disabled="!editText.trim()" @click="saveEdit">💾 保存</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getWishes, addWish, lightWish, saveWishes } from '../stores/storage';

const wishes = ref([]);
const openMake = ref(false);
const text = ref('');
const openEditBox = ref(false);
const editText = ref('');
const editId = ref('');

const COLORS = ['#ffd6a5', '#caffbf', '#a0c4ff', '#ffc6ff', '#bdb2ff', '#9bf6ff'];
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
  return w.userId === 'local' || w.ownerId === 'local';
}

function light(w) {
  lightWish(w.id);
  w.lights = (w.lights || 0) + 1;
  load();
}

function make() {
  if (!text.value.trim()) return;
  const w = addWish({
    id: 'wish_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    text: text.value.trim(),
    lights: 0,
    status: 'published',
    createdAt: Date.now(),
    ownerId: 'local',
  });
  wishes.value.unshift(w);
  text.value = '';
  openMake.value = false;
  ElMessage({ message: '愿望已点亮 🌟', type: 'success', customClass: 'th-toast' });
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
  ElMessage({ message: '已更新 ✏️', type: 'success', customClass: 'th-toast' });
}

function remove(w) {
  ElMessageBox.confirm('确定删除这个愿望吗？', '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const list = getWishes().filter((x) => x.id !== w.id);
      saveWishes(list);
      wishes.value = list;
      ElMessage({ message: '已删除', type: 'success', customClass: 'th-toast' });
    })
    .catch(() => {});
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
