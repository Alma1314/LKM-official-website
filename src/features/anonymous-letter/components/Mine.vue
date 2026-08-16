<template>
  <div class="mine">
    <h1 class="page-title">🌙 {{ t('treehole.mine.title') }}</h1>
    <p class="page-sub">{{ t('treehole.mine.subtitle') }}</p>

    <template>
      <!-- 统计 -->
      <section class="stats">
        <div class="stat glass">
          <b>{{ letters.length }}</b
          ><span>{{ t('treehole.mine.statLetters') }}</span>
        </div>
        <div class="stat glass">
          <b>{{ favs.length }}</b
          ><span>{{ t('treehole.mine.statFavs') }}</span>
        </div>
        <div class="stat glass">
          <b>{{ drafts.length }}</b
          ><span>{{ t('treehole.mine.statDrafts') }}</span>
        </div>
      </section>

      <div class="tabs">
        <button class="chip" :class="{ active: tab === 'letters' }" @click="tab = 'letters'">
          {{ t('treehole.mine.tabLetters') }}
        </button>
        <button class="chip" :class="{ active: tab === 'fav' }" @click="tab = 'fav'">
          {{ t('treehole.mine.tabFavs') }}
        </button>
        <button class="chip" :class="{ active: tab === 'drafts' }" @click="tab = 'drafts'">
          {{ t('treehole.mine.tabDrafts') }}
        </button>
      </div>

      <!-- 我的信件 -->
      <section v-if="tab === 'letters'">
        <div v-if="letters.length" class="list">
          <div v-for="l in letters" :key="l.id" class="item glass">
            <div class="item-head">
              <span class="item-cat" :style="{ background: getCategory(l.category).color }"
                >{{ getCategory(l.category).emoji }} {{ t(getCategory(l.category).label) }}</span
              >
              <span class="item-status" :class="l.status">{{ statusLabel(l.status) }}</span>
            </div>
            <p class="item-content">{{ l.content }}</p>
            <div class="item-foot">
              <span>{{ timeText(l.createdAt) }}</span>
              <div class="item-acts">
                <button
                  v-if="['pending', 'rejected', 'scheduled'].includes(l.status)"
                  class="mini"
                  @click="editLetter(l)"
                >
                  {{ t('treehole.mine.edit') }}
                </button>
                <button class="mini danger" @click="removeLetter(l)">{{ t('treehole.mine.delete') }}</button>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else :title="t('treehole.mine.emptyLettersTitle')" :sub="t('treehole.mine.emptyLettersSub')" />
      </section>

      <!-- 收藏夹 -->
      <section v-if="tab === 'fav'">
        <div v-if="favs.length" class="list">
          <LetterCard v-for="l in favs" :key="l.id" :letter="l" @fav="onFav" />
        </div>
        <EmptyState v-else :title="t('treehole.mine.emptyFavsTitle')" :sub="t('treehole.mine.emptyFavsSub')" />
      </section>

      <!-- 草稿（本地） -->
      <section v-if="tab === 'drafts'">
        <div v-if="drafts.length" class="list">
          <div v-for="d in drafts" :key="d.id" class="item glass">
            <p class="item-content">{{ d.content || t('treehole.mine.emptyDraft') }}</p>
            <div class="item-foot">
              <span>{{ timeText(d.updatedAt) }}</span>
              <div class="item-acts">
                <button class="mini" @click="editDraft(d)">{{ t('treehole.mine.continueEdit') }}</button>
                <button class="mini danger" @click="removeDraft(d)">{{ t('treehole.mine.delete') }}</button>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else :title="t('treehole.mine.emptyDraftsTitle')" :sub="t('treehole.mine.emptyDraftsSub')" />
      </section>
    </template>

    <!-- 数据备份 -->
    <BackupPanel />

    <!-- 危险操作 -->
    <section class="danger-zone glass">
      <div>
        <b>{{ t('treehole.mine.clearAllTitle') }}</b>
        <p>{{ t('treehole.mine.clearAllDesc') }}</p>
      </div>
      <button class="btn-reset" @click="reset">{{ t('treehole.mine.clearDraftsBtn') }}</button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDialog, useMessage } from 'naive-ui';
import LetterCard from '../components/LetterCard.vue';
import EmptyState from '../components/EmptyState.vue';
import BackupPanel from '../components/BackupPanel.vue';
import { getCategory } from '../stores/constants';
import * as store from '../stores/storage';
import { t } from '~/lib/i18n';

const router = useRouter();
const message = useMessage();
const dialog = useDialog();
const tab = ref('letters');
const letters = ref([]);
const favs = ref([]);
const drafts = ref([]);

function load() {
  letters.value = store.getLetters();
  const favIds = store.getFavorites();
  favs.value = store
    .getLetters()
    .filter((l) => favIds.includes(l.id) && l.status === 'published' && l.privacy === 'public');
}

onMounted(() => {
  load();
  drafts.value = store.getDrafts();
});

function statusLabel(s) {
  return s === 'pending'
    ? t('treehole.mine.statusPending')
    : s === 'published'
      ? t('treehole.mine.statusPublished')
      : s === 'rejected'
        ? t('treehole.mine.statusRejected')
        : s === 'scheduled'
          ? t('treehole.mine.statusScheduled')
          : s === 'sealed'
            ? t('treehole.mine.statusSealed')
            : t('treehole.mine.statusPrivate');
}
function timeText(ts) {
  const d = new Date(ts);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return t('treehole.mine.dateTime', { month: d.getMonth() + 1, day: d.getDate(), time });
}

function editLetter(l) {
  router.push({ name: 'write', query: { letterId: l.id } });
}
function removeLetter(l) {
  dialog.warning({
    title: t('treehole.mine.confirmDelete'),
    content: t('treehole.mine.confirmDeleteLetter'),
    positiveText: t('treehole.mine.delete'),
    negativeText: t('treehole.mine.cancel'),
    onPositiveClick: () => {
      store.deleteLetter(l.id);
      letters.value = store.getLetters();
      message.success(t('treehole.mine.deleted'));
    },
  });
}
function onFav() {
  load();
}
function editDraft(d) {
  router.push({ name: 'write', query: { draftId: d.id } });
}
function removeDraft(d) {
  store.deleteDraft(d.id);
  drafts.value = store.getDrafts();
}

function reset() {
  dialog.warning({
    title: t('treehole.mine.confirmReset'),
    content: t('treehole.mine.confirmResetDrafts'),
    positiveText: t('treehole.mine.clear'),
    negativeText: t('treehole.mine.cancel'),
    onPositiveClick: () => {
      store.resetDrafts();
      drafts.value = [];
      message.success(t('treehole.mine.draftsCleared'));
    },
  });
}
</script>

<style scoped>
.page-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 4px;
}
.page-sub {
  color: var(--text-sub);
  margin: 0 0 18px;
  font-size: 14px;
}
.login-hint {
  padding: 24px;
  text-align: center;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.stat {
  padding: 16px;
  text-align: center;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat b {
  font-size: 24px;
  color: var(--accent);
}
.stat span {
  font-size: 12px;
  color: var(--text-sub);
}
.tabs {
  display: flex;
  gap: 8px;
  margin: 16px 0;
  flex-wrap: wrap;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.item {
  padding: 16px;
  border-radius: 18px;
  cursor: default;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
}
.item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.item-cat {
  color: #5a4a3f;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.item-status {
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  color: var(--text-sub);
}
.item-status.published {
  background: rgba(155, 230, 160, 0.4);
  color: #3a7d44;
}
.item-status.pending {
  background: rgba(255, 218, 165, 0.4);
  color: #9a6a1f;
}
.item-status.rejected {
  background: rgba(255, 180, 180, 0.4);
  color: #b04a4a;
}
.item-content {
  margin: 0 0 10px;
  white-space: pre-wrap;
  font-size: calc(14px * var(--font-scale));
  line-height: 1.7;
}
.item-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-sub);
}
.item-acts {
  display: flex;
  gap: 8px;
}
.mini {
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.4);
  color: var(--text-main);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
}
.mini:hover {
  border-color: var(--accent);
}
.mini.danger:hover {
  border-color: var(--danger);
  color: var(--danger);
}
.danger-zone {
  margin-top: 8px;
  padding: 18px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(229, 115, 115, 0.3);
}
.danger-zone b {
  font-size: 14px;
}
.danger-zone p {
  font-size: 12px;
  color: var(--text-sub);
  margin: 4px 0 0;
}
.btn-reset {
  border: 1px solid var(--danger);
  color: var(--danger);
  background: rgba(229, 115, 115, 0.1);
  border-radius: 999px;
  padding: 8px 18px;
  cursor: pointer;
  font-size: 13px;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
  white-space: nowrap;
}
.btn-reset:hover {
  background: var(--danger);
  color: #fff;
}
</style>
