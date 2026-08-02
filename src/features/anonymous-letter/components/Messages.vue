<template>
  <div class="messages">
    <h1 class="page-title">💬 匿名回信</h1>
    <p class="page-sub">全程匿名，双方都不暴露真实身份。</p>

    <div class="msg-layout">
      <!-- 会话列表 -->
      <aside class="conv-list glass">
        <div class="conv-head">
          <span>对话 ({{ conversations.length }})</span>
          <button class="chip" @click="clearAllRead" v-if="conversations.length">标记已读</button>
        </div>
        <div v-if="conversations.length" class="conv-items">
          <div
            v-for="c in conversations"
            :key="c.id"
            class="conv-item"
            :class="{ active: activeId === c.id, blocked: c.blocked }"
            @click="selectConv(c)"
          >
            <div class="conv-avatar">{{ c.peerCodename.charAt(0) }}</div>
            <div class="conv-info">
              <b>{{ c.peerCodename }}</b>
              <small>{{ lastMsg(c) }}</small>
            </div>
            <span v-if="c.blocked" class="conv-blocked">已屏蔽</span>
          </div>
        </div>
        <EmptyState v-else title="还没有任何对话" sub="去随机树洞给陌生人写回信吧" />
      </aside>

      <!-- 对话面板 -->
      <section class="chat glass" v-if="active">
        <div class="chat-head">
          <div class="chat-peer">
            <div class="conv-avatar">{{ active.peerCodename.charAt(0) }}</div>
            <div>
              <b>{{ active.peerCodename }}</b>
              <small>我的代号：{{ active.myCodename }}</small>
            </div>
          </div>
          <div class="chat-acts">
            <button class="mini" @click="blockConv" v-if="!active.blocked">屏蔽</button>
            <button class="mini" @click="clearConv" v-if="active.messages.length">清空</button>
            <button class="mini danger" @click="delConv">删除</button>
          </div>
        </div>

        <div class="chat-body">
          <div v-if="active.messages.length" class="bubbles">
            <div
              v-for="(m, i) in active.messages"
              :key="m.id || i"
              class="bubble"
              :class="[m.from === 'me' ? 'mine' : 'peer', { recalled: m.recalled }]"
            >
              <template v-if="m.recalled">{{ m.text }}</template>
              <template v-else>
                <span class="bubble-text">{{ m.text }}</span>
                <button v-if="m.from === 'me' && !m.recalled" class="bubble-recall" @click="recall(active.id, m)">
                  撤回
                </button>
              </template>
            </div>
          </div>
          <EmptyState v-else title="还没有消息" sub="写下第一句匿名问候吧～" />
        </div>

        <div class="chat-input" v-if="!active.blocked">
          <textarea
            v-model="text"
            placeholder="匿名回复…"
            @keyup.enter.exact="send"
            rows="1"
            :class="{ 'send-ripple': rippling }"
            @animationend="rippling = false"
          ></textarea>
          <button class="btn-grad" :disabled="!text.trim()" @click="send">发送</button>
        </div>
        <div v-else class="chat-blocked">已屏蔽该陌生人，消息已停止。</div>
      </section>

      <EmptyState v-else class="chat-empty" title="选择左侧对话开始" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import EmptyState from '../components/EmptyState.vue';
import * as store from '../stores/storage';

const conversations = ref([]);
const activeId = ref('');
const text = ref('');
const rippling = ref(false);

const active = computed(() => conversations.value.find((c) => c.id === activeId.value) || null);

onMounted(() => {
  conversations.value = store.getReplies();
  if (conversations.value.length) activeId.value = conversations.value[0].id;
});

function lastMsg(c) {
  if (!c.messages.length) return '暂无消息';
  const m = c.messages[c.messages.length - 1];
  return (m.recalled ? '[撤回] ' : m.from === 'me' ? '我：' : '') + m.text;
}

function selectConv(c) {
  activeId.value = c.id;
}
function send() {
  if (!text.value.trim() || !active.value) return;
  const msg = {
    id: 'm_' + Date.now() + Math.floor(Math.random() * 100),
    from: 'me',
    text: text.value.trim(),
    at: Date.now(),
  };
  store.appendMessage(activeId.value, msg);
  conversations.value = store.getReplies();
  text.value = '';
  rippling.value = true;
  nextTick(scrollBottom);
}
function recall(convId, msg) {
  store.recallMessage(convId, msg.id);
  conversations.value = store.getReplies();
  ElMessage({ message: '已撤回', type: 'success', customClass: 'th-toast' });
}
function blockConv() {
  store.blockConversation(activeId.value);
  conversations.value = store.getReplies();
  ElMessage({ message: '已屏蔽该陌生人', type: 'success', customClass: 'th-toast' });
}
function clearConv() {
  store.clearConversation(activeId.value);
  conversations.value = store.getReplies();
}
function delConv() {
  store.deleteConversation(activeId.value);
  conversations.value = store.getReplies();
  activeId.value = conversations.value[0]?.id || '';
}
function clearAllRead() {
  store.clearInbox();
  ElMessage({ message: '已标记全部已读', type: 'success', customClass: 'th-toast' });
}
function scrollBottom() {
  const el = document.querySelector('.chat-body');
  if (el) el.scrollTop = el.scrollHeight;
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
.msg-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 768px) {
  .msg-layout {
    grid-template-columns: 1fr;
  }
}

.conv-list {
  padding: 14px;
  border-radius: 20px;
  max-height: 70vh;
  overflow-y: auto;
}
.conv-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 14px;
}
.conv-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.conv-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  cursor: pointer;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
  border: 1px solid transparent;
}
.conv-item:hover {
  background: rgba(255, 255, 255, 0.4);
}
.conv-item.active {
  background: rgba(255, 255, 255, 0.55);
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--glow);
}
.conv-item.blocked {
  opacity: 0.55;
}
.conv-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--grad-soft);
  color: var(--accent);
  border: 1px solid var(--card-border);
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
}
.conv-info {
  flex: 1;
  min-width: 0;
}
.conv-info b {
  font-size: 13px;
  display: block;
}
.conv-info small {
  font-size: 11px;
  color: var(--text-sub);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conv-blocked {
  font-size: 10px;
  color: var(--danger);
}

.chat {
  padding: 16px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  min-height: 60vh;
}
.chat-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--card-border);
}
.chat-peer {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-peer small {
  display: block;
  font-size: 11px;
  color: var(--text-sub);
}
.chat-acts {
  display: flex;
  gap: 6px;
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

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 4px;
  max-height: 52vh;
}
.bubbles {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: calc(14px * var(--font-scale));
  line-height: 1.6;
  word-break: break-word;
  animation: floatUp 0.3s both;
  position: relative;
}
.bubble.mine {
  align-self: flex-end;
  background: var(--grad-soft);
  color: var(--accent);
  border: 1px solid var(--card-border);
  border-bottom-right-radius: 4px;
}
.bubble.peer {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.55);
  color: var(--text-main);
  border-bottom-left-radius: 4px;
}
.bubble.recalled {
  opacity: 0.6;
  font-style: italic;
  font-size: 12px;
}
.bubble-recall {
  position: absolute;
  top: -8px;
  right: 6px;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.7);
  color: var(--text-sub);
  border-radius: 999px;
  font-size: 10px;
  padding: 1px 7px;
  cursor: pointer;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--card-border);
}
.chat-input textarea {
  flex: 1;
  border-radius: 14px;
  padding: 10px 14px;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.45);
  color: var(--text-main);
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
}
.chat-input textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--glow);
}
.chat-blocked {
  text-align: center;
  color: var(--text-sub);
  font-size: 13px;
  padding: 16px;
}
.chat-empty {
  grid-column: 2;
}
@media (max-width: 768px) {
  .chat-empty {
    grid-column: 1;
  }
}
</style>
