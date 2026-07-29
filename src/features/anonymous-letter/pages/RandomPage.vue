<template>
  <TreeholeShell active-nav="random">
    <div class="container">
      <!-- 抽取状态 -->
      <section v-if="!current" class="random-hero glass float-up">
        <div class="random-pick-area">
          <div class="pick-emoji">🌌</div>
          <p class="pick-slogan">每一次随机，都是一次未知的相遇</p>
          <button class="btn-grad pick-btn" @click="pickRandom" :disabled="picking">
            {{ picking ? '✨ 抽取中...' : '🎲 随机抽取一封' }}
          </button>
          <p v-if="poolCount === 0" class="empty-hint">还没有公开信件，去写一封吧～</p>
          <p v-else class="pool-hint">共有 {{ poolCount }} 封公开信件等待相遇</p>
        </div>
      </section>

      <!-- 阅读状态 -->
      <section v-else class="letter-read glass float-up">
        <div class="letter-paper" :style="{ background: paperBg }">
          <!-- 信件元信息 -->
          <div class="letter-meta">
            <span class="letter-cat">
              <span class="cat-emoji">{{ catInfo.emoji }}</span>
              {{ catInfo.label }}
            </span>
          </div>

          <!-- 信件内容 -->
          <div class="letter-body" :style="{ fontSize: letterFontSize }">
            {{ current.content }}
          </div>

          <!-- 心情标签 -->
          <div v-if="current.moods && current.moods.length" class="letter-moods">
            <span v-for="m in current.moods" :key="m" class="mood-tag">#{{ m }}</span>
          </div>

          <!-- 署名 + 日期 -->
          <div class="letter-footer">
            <span class="letter-codename">—— {{ current.codename || '匿名' }}</span>
            <span class="letter-date">{{ formatDate(current.createdAt) }}</span>
          </div>
        </div>

        <!-- 操作栏 -->
        <div class="read-actions">
          <button class="chip" @click="pickRandom">🎲 换一封</button>
          <button class="chip" @click="current = null">← 返回</button>
        </div>

        <!-- 回复区域 -->
        <div class="reply-section">
          <p class="reply-label">💬 给 {{ current.codename || '匿名' }} 写匿名回信</p>
          <textarea
            v-model="replyText"
            class="reply-textarea"
            :style="{ fontSize: replyFontSize }"
            :placeholder="'用温柔的话回应这封信...'"
            rows="3"
          ></textarea>
          <div class="reply-bar">
            <button class="chip" @click="toggleReplyFont">
              {{ replyFontLarge ? 'A⁻' : 'A⁺' }}
            </button>
            <button class="btn-grad btn-sm" @click="sendReply" :disabled="!replyText.trim()">📨 发送回信</button>
          </div>
          <p v-if="replySent" class="reply-ok">回信已发送，愿文字温暖彼此 🌿</p>
        </div>
      </section>
    </div>
  </TreeholeShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import TreeholeShell from '../components/TreeholeShell.vue';
import { getCategory, getPaper } from '../store/constants';
import { getLetters, getOrCreateConversation, appendMessage } from '../store/storage';
import { useApp } from '../store/app';

const base = import.meta.env.BASE_URL || '/';

const app = useApp();

const current = ref(null);
const picking = ref(false);
const replyText = ref('');
const replyFontLarge = ref(false);
const replySent = ref(false);

const poolCount = computed(() => {
  const all = getLetters();
  return all.filter((l) => l.status === 'published' && l.privacy === 'public').length;
});

const catInfo = computed(() => {
  if (!current.value) return { emoji: '💌', label: '' };
  return getCategory(current.value.category || 'confess');
});

const paperBg = computed(() => {
  if (!current.value) return 'transparent';
  return getPaper(current.value.paper || 'paper').gradient;
});

const letterFontSize = computed(() => {
  const s = app.state.settings.fontScale;
  return s === 'large' ? '1.15rem' : s === 'small' ? '0.9rem' : '1rem';
});

const replyFontSize = computed(() => {
  const base = parseFloat(letterFontSize.value);
  return (replyFontLarge.value ? base * 1.15 : base) + 'rem';
});

function pickRandom() {
  const all = getLetters();
  const pool = all.filter((l) => l.status === 'published' && l.privacy === 'public');
  if (!pool.length) {
    current.value = null;
    return;
  }
  picking.value = true;
  replyText.value = '';
  replySent.value = false;
  // slight delay for animation feel
  setTimeout(() => {
    current.value = pool[Math.floor(Math.random() * pool.length)];
    picking.value = false;
  }, 400);
}

function toggleReplyFont() {
  replyFontLarge.value = !replyFontLarge.value;
}

function sendReply() {
  if (!current.value || !replyText.value.trim()) return;
  const conv = getOrCreateConversation(
    'random_' + current.value.id,
    current.value.codename || '匿名',
    current.value.id
  );
  appendMessage(conv.id, {
    id: 'msg_' + Date.now(),
    text: replyText.value.trim(),
    from: 'me',
    createdAt: Date.now(),
  });
  replyText.value = '';
  replySent.value = true;
  setTimeout(() => {
    replySent.value = false;
  }, 3000);
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
</script>

<style scoped>
/* ========== 随机树洞页面内容样式 ========== */

/* 抽取 Hero */
.random-hero {
  padding: 60px 26px;
  text-align: center;
  border-radius: 26px;
  max-width: 520px;
  margin: 0 auto;
}
.pick-emoji {
  font-size: 80px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.pick-slogan {
  color: var(--text-sub);
  font-size: 15px;
  margin: 0 0 24px;
}
.pick-btn {
  font-size: 16px;
  padding: 12px 36px;
  border: none;
  cursor: pointer;
}
.pick-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.empty-hint {
  color: var(--text-sub);
  margin-top: 14px;
  font-size: 13px;
}
.pool-hint {
  color: var(--text-sub);
  margin-top: 10px;
  font-size: 12px;
}

/* 阅读状态 */
.letter-read {
  padding: 24px;
  border-radius: 26px;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.letter-paper {
  padding: 28px 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.letter-meta {
  margin-bottom: 14px;
}
.letter-cat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-sub);
  background: var(--grad-soft);
  padding: 4px 14px;
  border-radius: 999px;
}
.cat-emoji {
  font-size: 16px;
}
.letter-body {
  color: var(--text-main);
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 16px;
}
.letter-moods {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.mood-tag {
  font-size: 12px;
  color: var(--accent);
  background: rgba(255, 255, 255, 0.45);
  padding: 2px 10px;
  border-radius: 999px;
}
:root.dark .mood-tag {
  background: rgba(255, 255, 255, 0.08);
}
.letter-footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-sub);
}
.letter-codename {
  font-style: italic;
}

/* 操作栏 */
.read-actions {
  display: flex;
  gap: 10px;
}

/* 回复区域 */
.reply-section {
  border-top: 1px solid var(--card-border);
  padding-top: 16px;
}
.reply-label {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
}
.reply-textarea {
  width: 100%;
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg-card, rgba(255, 255, 255, 0.6));
  color: var(--text-main);
  font-size: 1rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.reply-textarea:focus {
  border-color: var(--accent);
}
.reply-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.btn-sm {
  padding: 8px 20px;
  font-size: 13px;
  border: none;
  cursor: pointer;
  border-radius: 999px;
}
.btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.reply-ok {
  color: var(--accent);
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
}

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .random-hero {
    padding: 40px 16px;
  }
  .pick-emoji {
    font-size: 60px;
  }
  .letter-read {
    padding: 16px;
  }
  .letter-paper {
    padding: 20px 16px;
  }
}

@media (max-width: 600px) {
  .pick-emoji {
    font-size: 48px;
  }
  .pick-slogan {
    font-size: 14px;
  }
}
</style>
