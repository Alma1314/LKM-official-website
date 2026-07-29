<template>
  <TreeholeShell active-nav="mine">
    <div class="container">

      <h1 class="page-title">🌙 我的本地树洞</h1>
      <p class="page-sub">这里展示你发布的所有信件、收藏与草稿，数据保存在本地浏览器。</p>

      <!-- 统计 -->
      <section class="stats">
        <div class="stat glass"><b>{{ letters.length }}</b><span>发布信件</span></div>
        <div class="stat glass"><b>{{ favList.length }}</b><span>收藏树洞</span></div>
        <div class="stat glass"><b>{{ drafts.length }}</b><span>本地草稿</span></div>
      </section>

      <div class="tabs">
        <button class="chip" :class="{ active: tab === 'letters' }" @click="tab = 'letters'">我的信件</button>
        <button class="chip" :class="{ active: tab === 'fav' }" @click="tab = 'fav'">收藏夹</button>
        <button class="chip" :class="{ active: tab === 'drafts' }" @click="tab = 'drafts'">本地草稿</button>
      </div>

      <!-- 我的信件 -->
      <section v-if="tab === 'letters'">
        <div v-if="letters.length" class="list">
          <div v-for="l in letters" :key="l.id" class="item glass">
            <div class="item-head">
              <span class="item-cat" :style="{ background: getCategory(l.category).color }">{{ getCategory(l.category).emoji }} {{ getCategory(l.category).label }}</span>
              <span class="item-status" :class="l.status">{{ statusLabel(l.status) }}</span>
            </div>
            <p class="item-content">{{ l.content }}</p>
            <div class="item-foot">
              <span>{{ timeText(l.createdAt) }}</span>
              <div class="item-acts">
                <a v-if="['pending','rejected','scheduled'].includes(l.status)" :href="`${base}treehole/write?letterId=` + l.id" class="mini">✏️ 编辑</a>
                <button class="mini danger" @click="removeLetter(l)">🗑️ 删除</button>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else title="还没有发布任何信件" sub="去写信页，投出第一封匿名信吧～" />
      </section>

      <!-- 收藏夹 -->
      <section v-if="tab === 'fav'">
        <div v-if="favList.length" class="masonry">
          <div v-for="l in favList" :key="l.id" class="masonry-col">
            <LetterCard :letter="l" @fav="refreshFavs" />
          </div>
        </div>
        <EmptyState v-else title="还没有收藏的树洞" sub="在广场点亮 ⭐ 收藏喜欢的信件" />
      </section>

      <!-- 草稿（本地） -->
      <section v-if="tab === 'drafts'">
        <div v-if="drafts.length" class="list">
          <div v-for="d in drafts" :key="d.id" class="item glass">
            <p class="item-content">{{ d.content || '（空草稿）' }}</p>
            <div class="item-foot">
              <span>{{ timeText(d.updatedAt) }}</span>
              <div class="item-acts">
                <a :href="`${base}treehole/write?draftId=` + d.id" class="mini">继续编辑</a>
                <button class="mini danger" @click="removeDraft(d)">删除</button>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else title="暂无本地草稿" sub="写信时可随时保存草稿" />
      </section>

      <!-- 数据备份 -->
      <BackupPanel />

      <!-- 危险操作 -->
      <section class="danger-zone glass">
        <div>
          <b>清空全部本地草稿</b>
          <p>仅删除本机保存的草稿，不可恢复。</p>
        </div>
        <button class="btn-reset" @click="resetDraftsConfirm">清空草稿</button>
      </section>

    </div>
  </TreeholeShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TreeholeShell from '../components/TreeholeShell.vue'
import LetterCard from '../components/LetterCard.vue'
import EmptyState from '../components/EmptyState.vue'
import BackupPanel from '../components/BackupPanel.vue'
import { getCategory } from '../store/constants'
import { getLetters, getFavorites, getDrafts, deleteLetter, deleteDraft, resetDrafts } from '../store/storage'
import { useApp } from '../store/app'
import '../styles/global.css'

const base = import.meta.env.BASE_URL || '/'

const app = useApp()

const tab = ref('letters')
const letters = ref([])
const favList = ref([])
const drafts = ref([])

function load() {
  letters.value = getLetters()
  const favIds = getFavorites()
  favList.value = getLetters().filter(l => favIds.includes(l.id) && l.status === 'published' && l.privacy === 'public')
  drafts.value = getDrafts()
}

onMounted(() => {
  // Sync theme: ensure data-theme mirrors dark class
  const isDark = document.documentElement.classList.contains("dark")
  const html = document.documentElement
  if (isDark) {
    html.setAttribute('data-theme', 'night')
    if (app.isNight.value === false) app.setTheme('night')
  } else {
    html.setAttribute('data-theme', 'day')
    if (app.isNight.value === true) app.setTheme('day')
  }

  load()
})

function refreshFavs() { load() }

function statusLabel(s) {
  return s === 'pending' ? '审核中' : s === 'published' ? '已公开' : s === 'rejected' ? '已驳回' : s === 'scheduled' ? '定时发布' : s === 'sealed' ? '已封存' : '个人可见'
}

function timeText(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function removeLetter(l) {
  if (confirm('确定删除这封信？')) {
    deleteLetter(l.id)
    load()
  }
}

function removeDraft(d) {
  if (confirm('确定删除这份草稿？')) {
    deleteDraft(d.id)
    load()
  }
}

function resetDraftsConfirm() {
  if (confirm('确定清空全部本地草稿？此操作不可恢复。')) {
    resetDrafts()
    load()
  }
}
</script>

<style scoped>
/* ========== Mine 页面内容样式 ========== */

.page-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
.page-sub { color: var(--text-sub); margin: 0 0 18px; font-size: 14px; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.stat { padding: 16px; text-align: center; border-radius: 18px; display: flex; flex-direction: column; gap: 2px; }
.stat b { font-size: 24px; color: var(--accent); }
.stat span { font-size: 12px; color: var(--text-sub); }

.tabs { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }

.list { display: flex; flex-direction: column; gap: 14px; }

.item { padding: 16px; border-radius: 18px; cursor: default; transition: all .2s; }
.item-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.item-cat { color: #5a4a3f; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.item-status { font-size: 11px; padding: 2px 9px; border-radius: 999px; background: rgba(255,255,255,0.5); color: var(--text-sub); }
.item-status.published { background: rgba(155,230,160,0.4); color: #3a7d44; }
.item-status.pending { background: rgba(255,218,165,0.4); color: #9a6a1f; }
.item-status.rejected { background: rgba(255,180,180,0.4); color: #b04a4a; }
.item-status.scheduled { background: rgba(200,184,245,0.4); color: #6b5bb0; }
.item-content { margin: 0 0 10px; white-space: pre-wrap; font-size: calc(14px * var(--font-scale)); line-height: 1.7; }
.item-foot { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--text-sub); }
.item-acts { display: flex; gap: 8px; }

.mini {
  border: 1px solid var(--card-border);
  background: rgba(255,255,255,0.4);
  color: var(--text-main);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all .2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.mini:hover { border-color: var(--accent); }
.mini.danger:hover { border-color: var(--danger); color: var(--danger); }

/* 收藏夹瀑布流 */
.masonry { columns: 3; column-gap: 16px; }
.masonry-col { break-inside: avoid; margin-bottom: 16px; display: inline-block; width: 100%; }

.danger-zone {
  margin-top: 8px;
  padding: 18px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(229,115,115,0.3);
}
.danger-zone b { font-size: 14px; color: var(--text-main); }
.danger-zone p { font-size: 12px; color: var(--text-sub); margin: 4px 0 0; }

.btn-reset {
  border: 1px solid var(--danger);
  color: var(--danger);
  background: rgba(229,115,115,0.1);
  border-radius: 999px;
  padding: 8px 18px;
  cursor: pointer;
  font-size: 13px;
  transition: all .2s;
  white-space: nowrap;
}
.btn-reset:hover { background: var(--danger); color: #fff; }

/* ---------- 响应式 ---------- */
@media (max-width: 1024px) {
  .masonry { columns: 2; }
}

@media (max-width: 600px) {
  .masonry { columns: 1; }
  .stats { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stat { padding: 12px 8px; }
  .stat b { font-size: 20px; }
}
</style>
