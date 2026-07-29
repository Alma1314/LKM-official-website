<template>
  <div class="random">
    <h1 class="page-title">🎲 随机树洞</h1>
    <p class="page-sub">抽一封陌生人的信，安静地读，温柔地回。</p>

    <!-- 抽取状态 -->
    <section v-if="!current" class="pick glass float-up">
      <div class="pick-emoji">🌌</div>
      <p class="pick-tip">每一次随机，都是一次未知的相遇</p>
      <button class="btn-grad" :disabled="picking" @click="draw">
        <span v-if="picking" class="spinner"></span>
        <span v-else>随机抽取一封</span>
      </button>
      <p class="pick-hint">共 {{ pool.length }} 封公开信件等待被看见</p>
    </section>

    <!-- 沉浸式阅读 -->
    <section v-else class="reader glass float-up">
      <button class="reader-back" @click="current = null">← 返回</button>
      <div class="reader-paper" :style="{ background: paperBg }">
        <div class="reader-cat">{{ category.emoji }} {{ category.label }}</div>
        <p class="reader-content">{{ current.content }}</p>
        <div class="reader-moods" v-if="current.moods && current.moods.length">
          <span v-for="m in current.moods" :key="m" class="reader-mood">#{{ m }}</span>
        </div>
        <div class="reader-foot">{{ current.codename }} · {{ timeText }}</div>
      </div>

      <!-- 回信区（双向匿名） -->
      <div class="reply-box">
        <label class="setup-label">给 {{ current.codename }} 写匿名回信</label>
        <textarea v-model="replyText" class="reply-input" placeholder="你的回信同样匿名，不会暴露身份…" :style="{ fontSize: replyFont }"></textarea>
        <div class="reply-acts">
          <button class="chip" @click="replyFont = replyFont === '15px' ? '18px' : '15px'">A±</button>
          <button class="btn-grad" :disabled="!replyText.trim()" @click="sendReply">📨 发送回信</button>
        </div>
        <p class="reply-note">🌿 双向匿名：你与对方都不会看到真实身份，回信将随机送达对方的本地收件箱。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCategory, getPaper } from '../store/constants'
import { getLetters, getOrCreateConversation, appendMessage } from '../store/storage'

const pool = ref([])
const current = ref(null)
const picking = ref(false)
const replyText = ref('')
const replyFont = ref('15px')

const category = computed(() => current.value ? getCategory(current.value.category) : null)
const paperBg = computed(() => current.value ? getPaper(current.value.paper).gradient : '')
const timeText = computed(() => current.value ? new Date(current.value.createdAt).toLocaleDateString() : '')

onMounted(refreshPool)
function refreshPool() {
  pool.value = getLetters().filter(l => l.status === 'published' && l.privacy === 'public')
}

function draw() {
  picking.value = true
  setTimeout(() => {
    const list = pool.value
    if (!list.length) {
      ElMessage({ message: '暂时没有可抽取的公开信件', type: 'info', customClass: 'th-toast' })
      picking.value = false
      return
    }
    current.value = list[Math.floor(Math.random() * list.length)]
    replyText.value = ''
    picking.value = false
  }, 900)
}

function sendReply() {
  if (!replyText.value.trim() || !current.value) return
  const conv = getOrCreateConversation(current.value.id, current.value.codename, current.value.id)
  const msg = { id: 'm_' + Date.now() + Math.floor(Math.random() * 100), from: 'me', text: replyText.value.trim(), at: Date.now() }
  appendMessage(conv.id, msg)
  ElMessage({ message: '回信已匿名送达 💌', type: 'success', customClass: 'th-toast' })
  replyText.value = ''
  current.value = null
}
</script>

<style scoped>
.page-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
.page-sub { color: var(--text-sub); margin: 0 0 18px; font-size: 14px; }

.pick { padding: 50px 26px; text-align: center; border-radius: 24px; }
.pick-emoji { font-size: 56px; margin-bottom: 10px; animation: floatUp .6s both; }
.pick-tip { color: var(--text-main); margin: 0 0 20px; }
.pick-hint { font-size: 12px; color: var(--text-sub); margin-top: 14px; }
.pick .btn-grad { min-width: 180px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; }

.reader { padding: 22px; border-radius: 24px; }
.reader-back { background: none; border: none; color: var(--text-sub); cursor: pointer; font-size: 14px; margin-bottom: 14px; }
.reader-paper {
  border-radius: 18px; padding: 26px; min-height: 200px; position: relative;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);
  animation: floatUp .5s both;
}
.reader-cat { display: inline-block; background: rgba(255,255,255,0.6); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #5a4a3f; }
.reader-content { white-space: pre-wrap; line-height: 2; font-size: calc(16px * var(--font-scale)); margin: 16px 0; color: var(--text-main); }
.reader-moods { display: flex; flex-wrap: wrap; gap: 6px; }
.reader-mood { font-size: 12px; color: var(--accent); background: rgba(255,255,255,0.5); padding: 2px 8px; border-radius: 999px; }
.reader-foot { text-align: right; font-size: 12px; color: var(--text-sub); margin-top: 12px; }

.reply-box { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
.setup-label { font-size: 13px; font-weight: 700; }
.reply-input {
  width: 100%; min-height: 100px; border-radius: 14px; padding: 14px;
  border: 1px solid var(--card-border); background: rgba(255,255,255,0.45); color: var(--text-main);
  resize: vertical; outline: none; font-family: inherit; line-height: 1.7;
}
.reply-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--glow); }
.reply-acts { display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
.reply-note { font-size: 11px; color: var(--text-sub); margin: 4px 0 0; }
</style>
