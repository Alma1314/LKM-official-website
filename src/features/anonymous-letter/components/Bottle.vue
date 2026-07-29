<template>
  <!-- 漂流瓶 -->
  <div class="bottle">
    <div class="bt-head">
      <h3>🍶 漂流瓶</h3>
      <button class="btn-grad" @click="onThrow">扔一个瓶</button>
    </div>

    <div class="bt-pick glass" v-if="!current">
      <div class="bt-emoji">🌊</div>
      <p>海里有 {{ total }} 个漂流瓶在漂流</p>
      <button class="btn-grad" :disabled="picking" @click="pick">
        <span v-if="picking" class="spinner"></span><span v-else>捞一个漂流瓶</span>
      </button>
    </div>

    <div class="bt-reader glass" v-else>
      <div class="bt-paper">
        <p class="bt-text">{{ current.text }}</p>
        <div class="bt-foot">— 来自海那边的陌生人 · {{ dateText(current.createdAt) }}</div>
        <div v-if="current.reply" class="bt-reply-show">↩️ {{ current.reply }}</div>
      </div>
      <div class="bt-reply">
        <textarea v-model="reply" class="bt-input" placeholder="写句话放回去，匿名回信…" :style="{ fontSize: replyFont }"></textarea>
        <div class="bt-acts">
          <button class="chip" @click="replyFont = replyFont === '15px' ? '18px' : '15px'">A±</button>
          <button class="btn-grad" :disabled="!reply.trim()" @click="send">📨 放回海里</button>
        </div>
      </div>
      <button class="bt-back" @click="current = null">← 再捞一个</button>
    </div>

    <el-dialog v-model="openThrow" title="扔一个漂流瓶" align-center width="min(420px,92vw)">
      <el-input v-model="throwText" type="textarea" :rows="3" placeholder="把心事装进瓶子，交给海流…" />
      <template #footer>
        <button class="btn-grad" :disabled="!throwText.trim()" @click="throwBottle">🍶 扔进海里</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getBottles, addBottle, pickBottle, markBottlePicked } from '../store/storage'

const bottles = ref([])
const current = ref(null)
const picking = ref(false)
const reply = ref('')
const replyFont = ref('15px')
const openThrow = ref(false)
const throwText = ref('')

const total = computed(() => bottles.value.length)

onMounted(load)
function load() {
  bottles.value = getBottles()
}

function dateText(ts) { const d = new Date(ts || Date.now()); return `${d.getMonth() + 1}/${d.getDate()}` }

function pick() {
  picking.value = true
  setTimeout(() => {
    const b = pickBottle()
    if (!b) { picking.value = false; ElMessage({ message: '海里暂时没有漂流瓶，先扔一个吧', type: 'info', customClass: 'th-toast' }); return }
    current.value = b
    reply.value = ''; picking.value = false
  }, 900)
}

function send() {
  if (!current.value || !reply.value.trim()) return
  markBottlePicked(current.value.id, reply.value.trim())
  current.value.reply = reply.value.trim()
  ElMessage({ message: '回信已放回海里 🌊', type: 'success', customClass: 'th-toast' })
  current.value = null
  load()
}

function onThrow() {
  openThrow.value = true
}
function throwBottle() {
  if (!throwText.value.trim()) return
  const b = addBottle({
    id: 'bt_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    text: throwText.value.trim(),
    picked: false,
    reply: null,
    repliedAt: null,
    status: 'published',
    createdAt: Date.now(),
    ownerId: 'local'
  })
  bottles.value.unshift(b)
  throwText.value = ''; openThrow.value = false
  ElMessage({ message: '漂流瓶已扔进海里 🍶', type: 'success', customClass: 'th-toast' })
}
</script>

<style scoped>
.bottle { display: flex; flex-direction: column; gap: 12px; }
.bt-head { display: flex; justify-content: space-between; align-items: center; }
.bt-head h3 { margin: 0; font-size: 18px; }
.bt-pick { padding: 36px 20px; text-align: center; border-radius: var(--radius); }
.bt-emoji { font-size: 48px; margin-bottom: 8px; }
.bt-pick p { color: var(--text-sub); margin: 0 0 16px; font-size: 14px; }
.bt-reader { padding: 20px; border-radius: var(--radius); }
.bt-paper { background: rgba(255,255,255,0.4); border-radius: var(--radius-sm); padding: 18px; }
.bt-text { margin: 0 0 10px; white-space: pre-wrap; line-height: 1.8; }
.bt-foot { text-align: right; font-size: 12px; color: var(--text-sub); }
.bt-reply-show { margin-top: 10px; padding: 10px; border-radius: 12px; background: rgba(232,168,124,0.15); font-size: 13px; color: var(--text-main); }
.bt-reply { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
.bt-input { width: 100%; min-height: 80px; border-radius: var(--radius-sm); padding: 12px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.45); color: var(--text-main); resize: vertical; outline: none; font-family: inherit; line-height: 1.7; }
.bt-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--glow); }
.bt-acts { display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
.bt-back { background: none; border: none; color: var(--text-sub); cursor: pointer; margin-top: 10px; font-size: 13px; }
</style>
