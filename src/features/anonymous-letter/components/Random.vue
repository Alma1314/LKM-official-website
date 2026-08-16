<template>
  <div class="random">
    <h1 class="page-title">🎲 {{ t('treehole.random.title') }}</h1>
    <p class="page-sub">{{ t('treehole.random.subtitle') }}</p>

    <!-- 抽取状态 -->
    <section v-if="!current" class="pick glass float-up">
      <div class="pick-emoji">🌌</div>
      <p class="pick-tip">{{ t('treehole.random.pickTip') }}</p>
      <button class="btn-grad" :disabled="picking" @click="draw">
        <span v-if="picking" class="spinner"></span>
        <span v-else>{{ t('treehole.random.drawBtn') }}</span>
      </button>
      <p class="pick-hint">{{ t('treehole.random.poolHint', { count: pool.length }) }}</p>
    </section>

    <!-- 沉浸式阅读 -->
    <section v-else class="reader glass float-up">
      <button class="reader-back" @click="current = null">{{ t('treehole.random.back') }}</button>
      <div class="reader-paper" :style="{ background: paperBg }">
        <div class="reader-cat">{{ category.emoji }} {{ t(category.label) }}</div>
        <p class="reader-content">{{ current.content }}</p>
        <div class="reader-moods" v-if="current.moods && current.moods.length">
          <span v-for="m in current.moods" :key="m" class="reader-mood">#{{ t(moodKey(m)) }}</span>
        </div>
        <div class="reader-foot">{{ current.codename }} · {{ timeText }}</div>
      </div>

      <!-- 回信区（双向匿名） -->
      <div class="reply-box">
        <label class="setup-label">{{ t('treehole.random.replyLabel', { name: current.codename }) }}</label>
        <textarea
          v-model="replyText"
          class="reply-input"
          :placeholder="t('treehole.random.replyPlaceholder')"
          :style="{ fontSize: replyFont }"
        ></textarea>
        <div class="reply-acts">
          <button class="chip" @click="replyFont = replyFont === '15px' ? '18px' : '15px'">A±</button>
          <button class="btn-grad" :disabled="!replyText.trim()" @click="sendReply">
            📨 {{ t('treehole.random.sendReply') }}
          </button>
        </div>
        <p class="reply-note">{{ t('treehole.random.replyNote') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { getCategory, getPaper, moodKey } from '../stores/constants';
import { getLetters, getOrCreateConversation, appendMessage } from '../stores/storage';
import { t } from '~/lib/i18n';

const message = useMessage();
const pool = ref([]);
const current = ref(null);
const picking = ref(false);
const replyText = ref('');
const replyFont = ref('15px');

const category = computed(() => (current.value ? getCategory(current.value.category) : null));
const paperBg = computed(() => (current.value ? getPaper(current.value.paper).gradient : ''));
const timeText = computed(() => (current.value ? new Date(current.value.createdAt).toLocaleDateString() : ''));

onMounted(refreshPool);
function refreshPool() {
  pool.value = getLetters().filter((l) => l.status === 'published' && l.privacy === 'public');
}

function draw() {
  picking.value = true;
  setTimeout(() => {
    const list = pool.value;
    if (!list.length) {
      message.info(t('treehole.random.noLetters'));
      picking.value = false;
      return;
    }
    current.value = list[Math.floor(Math.random() * list.length)];
    replyText.value = '';
    picking.value = false;
  }, 900);
}

function sendReply() {
  if (!replyText.value.trim() || !current.value) return;
  const conv = getOrCreateConversation(current.value.id, current.value.codename, current.value.id);
  const msg = {
    id: 'm_' + Date.now() + Math.floor(Math.random() * 100),
    from: 'me',
    text: replyText.value.trim(),
    at: Date.now(),
  };
  appendMessage(conv.id, msg);
  message.success(t('treehole.random.replySent'));
  replyText.value = '';
  current.value = null;
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

.pick {
  padding: 50px 26px;
  text-align: center;
  border-radius: 24px;
}
.pick-emoji {
  font-size: 56px;
  margin-bottom: 10px;
  animation: floatUp 0.6s both;
}
.pick-tip {
  color: var(--text-main);
  margin: 0 0 20px;
}
.pick-hint {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 14px;
}
.pick .btn-grad {
  min-width: 180px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.reader {
  padding: 22px;
  border-radius: 24px;
}
.reader-back {
  background: none;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 14px;
}
.reader-paper {
  border-radius: 18px;
  padding: 26px;
  min-height: 200px;
  position: relative;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: floatUp 0.5s both;
}
.reader-cat {
  display: inline-block;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #5a4a3f;
}
.reader-content {
  white-space: pre-wrap;
  line-height: 2;
  font-size: calc(16px * var(--font-scale));
  margin: 16px 0;
  color: var(--text-main);
}
.reader-moods {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.reader-mood {
  font-size: 12px;
  color: var(--accent);
  background: rgba(255, 255, 255, 0.5);
  padding: 2px 8px;
  border-radius: 999px;
}
.reader-foot {
  text-align: right;
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 12px;
}

.reply-box {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.setup-label {
  font-size: 13px;
  font-weight: 700;
}
.reply-input {
  width: 100%;
  min-height: 100px;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.45);
  color: var(--text-main);
  resize: vertical;
  outline: none;
  font-family: inherit;
  line-height: 1.7;
}
.reply-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--glow);
}
.reply-acts {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
}
.reply-note {
  font-size: 11px;
  color: var(--text-sub);
  margin: 4px 0 0;
}
</style>
