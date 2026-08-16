<template>
  <div class="write">
    <h1 class="page-title">✍️ {{ t('treehole.write.title') }}</h1>
    <p class="page-sub">{{ t('treehole.write.subtitle') }}</p>

    <div class="write-grid">
      <!-- 左：编辑器 -->
      <section class="editor-card glass">
        <!-- 工具栏 -->
        <div class="toolbar">
          <button class="tb-btn" @click="insertEmoji" :title="t('treehole.write.emoji')">😊</button>
          <button class="tb-btn" :class="{ on: recording }" @click="toggleVoice" :title="t('treehole.write.voice')">
            🎙️
          </button>
          <span class="tb-sep"></span>
          <button class="tb-btn" :class="{ on: fontSize === 'small' }" @click="setFont('small')">A-</button>
          <button class="tb-btn" :class="{ on: fontSize === 'normal' }" @click="setFont('normal')">A</button>
          <button class="tb-btn" :class="{ on: fontSize === 'large' }" @click="setFont('large')">A+</button>
          <span class="tb-sep"></span>
          <button class="tb-btn" @click="newLine" :title="t('treehole.write.newline')">↵</button>
          <button class="tb-btn" @click="clearText" :title="t('treehole.write.clear')">🗑️</button>
        </div>

        <!-- 信纸正文 -->
        <div class="paper-wrap" :style="{ background: paperBg }">
          <textarea
            ref="ta"
            v-model="content"
            class="paper-input"
            :style="{ fontSize: fontPx }"
            :placeholder="t('treehole.write.contentPlaceholder')"
            @input="onInput"
          ></textarea>
          <div v-if="sticker" class="paper-sticker">{{ sticker }}</div>
        </div>

        <!-- 字数 -->
        <div class="counter" :class="{ over: content.length > 1000 }">{{ content.length }}/1000</div>

        <!-- 表情面板 -->
        <transition name="dialog-fade">
          <div v-if="emojiOpen" class="emoji-pop glass">
            <button v-for="e in emojis" :key="e" class="emoji-item" @click="pickEmoji(e)">{{ e }}</button>
          </div>
        </transition>
      </section>

      <!-- 右：设置面板 -->
      <aside class="setup glass">
        <!-- 分类 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.category') }}</label>
          <div class="cat-grid">
            <button
              v-for="c in categories"
              :key="c.key"
              class="cat-btn"
              :class="{ active: category === c.key }"
              :style="{ '--c': c.color }"
              @click="category = c.key"
            >
              {{ c.emoji }} {{ t(c.label) }}
            </button>
          </div>
        </div>

        <!-- 保密等级 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.privacyLevel') }}</label>
          <div class="privacy-list">
            <button
              v-for="p in privacy"
              :key="p.key"
              class="privacy-btn"
              :class="{ active: privacyLevel === p.key }"
              @click="privacyLevel = p.key"
            >
              <b>{{ t(p.label) }}</b
              ><small>{{ t(p.desc) }}</small>
            </button>
          </div>
        </div>

        <!-- 匿名昵称 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.codename') }}</label>
          <div class="nick-row">
            <n-input v-model="codename" :placeholder="t('treehole.write.codenamePlaceholder')" size="large" />
            <button class="btn-grad ghost" @click="codename = randomCodename()">
              {{ t('treehole.write.random') }}
            </button>
          </div>
        </div>

        <!-- 心情标签 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.moods') }}</label>
          <div class="mood-pick">
            <button
              v-for="m in moods"
              :key="m"
              class="chip"
              :class="{ active: selectedMoods.includes(m) }"
              @click="toggleMood(m)"
            >
              {{ t(moodKey(m)) }}
            </button>
          </div>
        </div>

        <!-- 内容标签 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.tags') }}</label>
          <div class="tag-pick">
            <button
              v-for="tg in tagsList"
              :key="tg.key"
              class="tag-btn"
              :class="{ active: selectedTags.includes(tg.key) }"
              :style="{ '--tg': tg.color }"
              @click="toggleTag(tg.key)"
            >
              {{ tg.emoji }} {{ t(tg.label) }}
            </button>
          </div>
          <small class="tag-hint">{{ t('treehole.write.tagsHint') }}</small>
        </div>

        <!-- 背景贴纸 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.sticker') }}</label>
          <div class="sticker-pick">
            <button class="sticker-btn" :class="{ active: !sticker }" @click="sticker = ''">
              {{ t('treehole.write.none') }}
            </button>
            <button
              v-for="s in stickers"
              :key="s"
              class="sticker-btn"
              :class="{ active: sticker === s }"
              @click="sticker = sticker === s ? '' : s"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- 信纸模板 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.paper') }}</label>
          <div class="paper-pick">
            <button
              v-for="p in papers"
              :key="p.key"
              class="paper-btn"
              :class="{ active: paper === p.key }"
              :style="{ background: p.gradient }"
              @click="paper = p.key"
            >
              {{ t(p.label) }}
            </button>
          </div>
        </div>

        <!-- 涂鸦手写信纸 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.doodle') }}</label>
          <button class="chip" :class="{ active: doodleOn }" @click="toggleDoodle">
            {{ doodleOn ? t('treehole.write.doodling') : t('treehole.write.openDoodle') }}
          </button>
          <div v-if="doodleOn" class="doodle-wrap">
            <canvas
              ref="doodleCanvas"
              class="doodle-canvas"
              width="320"
              height="180"
              @mousedown="startDraw"
              @mousemove="draw"
              @mouseup="stopDraw"
              @touchstart.prevent="startDraw"
              @touchmove.prevent="draw"
              @touchend="stopDraw"
            ></canvas>
            <div class="doodle-tools">
              <input type="color" v-model="doodleColor" class="doodle-color" />
              <button class="mini" @click="clearDoodle">{{ t('treehole.write.clearDoodle') }}</button>
              <button class="mini" @click="saveDoodle">{{ t('treehole.write.saveToPaper') }}</button>
            </div>
          </div>
        </div>

        <!-- 定时发布 / 限时封存 -->
        <div class="setup-block">
          <label class="setup-label">{{ t('treehole.write.scheduleSeal') }}</label>
          <div class="toggle-row">
            <span>{{ t('treehole.write.scheduled') }}</span>
            <button class="switch" :class="{ on: scheduledOn }" @click="scheduledOn = !scheduledOn">
              <span class="knob"></span>
            </button>
          </div>
          <n-date-picker
            v-if="scheduledOn"
            v-model="scheduledAt"
            type="datetime"
            :placeholder="t('treehole.write.schedulePlaceholder')"
            class="full"
            size="large"
          />
          <div class="toggle-row" style="margin-top: 8px">
            <span>{{ t('treehole.write.seal') }}</span>
            <button class="switch" :class="{ on: sealOn }" @click="sealOn = !sealOn"><span class="knob"></span></button>
          </div>
          <n-date-picker
            v-if="sealOn"
            v-model="sealUntil"
            type="datetime"
            :placeholder="t('treehole.write.sealUntilPlaceholder')"
            class="full"
            size="large"
          />
        </div>

        <!-- 敏感词提示 -->
        <transition name="dialog-fade">
          <div v-if="sensitiveHit.length" class="warn">
            ⚠️ {{ t('treehole.write.sensitiveHit', { words: sensitiveHit.join('、') }) }}
          </div>
        </transition>

        <!-- 验证码防刷 -->
        <div class="setup-block captcha-block">
          <label class="setup-label">{{ t('treehole.write.captcha') }}</label>
          <div class="captcha-row">
            <div class="captcha-code" @click="refreshCaptcha">{{ captcha }}</div>
            <n-input v-model="captchaInput" :placeholder="t('treehole.write.captchaPlaceholder')" size="large" />
          </div>
        </div>

        <!-- 操作 -->
        <div class="setup-actions">
          <button class="chip" @click="saveDraft">{{ t('treehole.write.saveDraft') }}</button>
          <button class="chip" @click="clearAll">{{ t('treehole.write.clearAll') }}</button>
          <button class="btn-grad submit" :disabled="!canSubmit" @click="submit">
            {{ t('treehole.write.submit') }}
          </button>
        </div>
        <p v-if="!canSubmit" class="hint">{{ t('treehole.write.submitHint') }}</p>
      </aside>
    </div>

    <!-- 投稿成功弹窗 -->
    <n-modal
      v-model:show="successVisible"
      preset="card"
      :show-icon="false"
      :closable="false"
      style="width: min(420px, 92vw)"
    >
      <div class="success glass">
        <div class="success-ring">✓</div>
        <h2 class="grad-text">{{ t('treehole.write.successTitle') }}</h2>
        <p>{{ t('treehole.write.successPrefix') }}{{ successTip }}</p>
        <div class="success-acts">
          <button class="chip" @click="toShare">{{ t('treehole.write.shareImage') }}</button>
          <button class="btn-grad" @click="afterSubmit">{{ t('treehole.write.writeAnother') }}</button>
        </div>
      </div>
    </n-modal>

    <!-- 分享图弹窗 -->
    <n-modal v-model:show="shareVisible" preset="card" :show-icon="false" style="width: min(380px, 92vw)">
      <div class="share-card" ref="shareRef" :style="{ background: paperBg }">
        <div class="share-head">{{ t('treehole.write.shareBrand') }}</div>
        <div class="share-cat">{{ getCategory(category).emoji }} {{ t(getCategory(category).label) }}</div>
        <p class="share-content">{{ content }}</p>
        <div class="share-foot">
          {{ codename || t('treehole.write.anonymous') }} · {{ new Date().toLocaleDateString() }}
        </div>
      </div>
      <template #footer>
        <button class="btn-grad" @click="downloadShare">{{ t('treehole.write.saveImage') }}</button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import {
  CATEGORIES,
  PRIVACY,
  MOODS,
  STICKERS,
  PAPERS,
  EMOJIS,
  TAGS,
  SENSITIVE_WORDS,
  getCategory,
  getPaper,
  moodKey,
} from '../stores/constants';
import * as store from '../stores/storage';
import { randomCodename } from '../utils/codename';
import { t } from '~/lib/i18n';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const categories = CATEGORIES;
const privacy = PRIVACY;
const moods = MOODS;
const stickers = STICKERS;
const papers = PAPERS;
const emojis = EMOJIS;
const tagsList = TAGS;

const ta = ref(null);
const content = ref('');
const fontSize = ref('normal');
const fontPx = computed(() => (fontSize.value === 'small' ? '14px' : fontSize.value === 'large' ? '19px' : '16px'));
const category = ref('heart');
const privacyLevel = ref('public');
const codename = ref('');
const selectedMoods = ref([]);
const selectedTags = ref([]);
const sticker = ref('');
const paper = ref('paper');
const paperBg = computed(() => getPaper(paper.value).gradient);

const emojiOpen = ref(false);
const captcha = ref('');
const captchaInput = ref('');

const successVisible = ref(false);
const successTip = ref('');
const shareVisible = ref(false);
const shareRef = ref(null);
const lastLetter = ref(null);

// 新功能状态
const doodleOn = ref(false);
const doodleCanvas = ref(null);
const doodleColor = ref('#5a4a3f');
let drawing = false;
const scheduledOn = ref(false);
const scheduledAt = ref(null);
const sealOn = ref(false);
const sealUntil = ref(null);
const recording = ref(false);
let mediaRec = null;
let _recTimer = null;

// 编辑草稿 / 未公开信件带入
const editingId = ref('');
function hydrate(d) {
  if (!d) return;
  editingId.value = d.id || '';
  content.value = d.content || '';
  category.value = d.category || 'heart';
  privacyLevel.value = d.privacyLevel || d.privacy || 'public';
  codename.value = d.codename || '';
  selectedMoods.value = d.selectedMoods || d.moods || [];
  selectedTags.value = d.selectedTags || d.tags || [];
  sticker.value = d.sticker || '';
  paper.value = d.paper || 'paper';
}
async function hydrateFromQuery() {
  const { draftId, letterId } = route.query;
  if (draftId) {
    const d = store.getDrafts().find((x) => x.id === draftId);
    hydrate(d);
  } else if (letterId) {
    const l = store.getLetters().find((x) => x.id === letterId);
    if (l) hydrate(l);
  }
}
onMounted(hydrateFromQuery);

function genCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
function refreshCaptcha() {
  captcha.value = genCaptcha();
}
onMounted(refreshCaptcha);

const sensitiveHit = computed(() => SENSITIVE_WORDS.filter((w) => content.value.includes(w)));

const canSubmit = computed(
  () =>
    content.value.trim().length > 0 &&
    content.value.length <= 1000 &&
    captchaInput.value.toUpperCase() === captcha.value.toUpperCase() &&
    sensitiveHit.value.length === 0
);

function setFont(f) {
  fontSize.value = f;
}
function newLine() {
  content.value += '\n';
  ta.value?.focus();
}
function clearText() {
  content.value = '';
  ta.value?.focus();
}
function onInput() {
  /* input handled by v-model */
}

function insertEmoji() {
  emojiOpen.value = !emojiOpen.value;
}
function pickEmoji(e) {
  content.value += e;
  emojiOpen.value = false;
  ta.value?.focus();
}
function toggleMood(m) {
  const i = selectedMoods.value.indexOf(m);
  if (i > -1) selectedMoods.value.splice(i, 1);
  else if (selectedMoods.value.length < 4) selectedMoods.value.push(m);
}
function toggleTag(t) {
  const i = selectedTags.value.indexOf(t);
  if (i > -1) selectedTags.value.splice(i, 1);
  else if (selectedTags.value.length < 5) selectedTags.value.push(t);
}

function clearAll() {
  content.value = '';
  codename.value = '';
  selectedMoods.value = [];
  selectedTags.value = [];
  sticker.value = '';
  fontSize.value = 'normal';
  captchaInput.value = '';
  refreshCaptcha();
  scheduledOn.value = false;
  scheduledAt.value = null;
  sealOn.value = false;
  sealUntil.value = null;
  doodleOn.value = false;
  drawing = false;
}

function saveDraft() {
  if (!content.value.trim()) {
    message.info(t('treehole.write.emptyDraftMsg'));
    return;
  }
  store.saveDraft({
    id: 'draft_' + Date.now(),
    content: content.value,
    category: category.value,
    privacyLevel: privacyLevel.value,
    codename: codename.value,
    selectedMoods: selectedMoods.value,
    selectedTags: selectedTags.value,
    sticker: sticker.value,
    paper: paper.value,
    scheduledOn: scheduledOn.value,
    scheduledAt: scheduledAt.value || null,
    sealOn: sealOn.value,
    sealUntil: sealUntil.value || null,
    updatedAt: Date.now(),
  });
  message.success(t('treehole.write.draftSaved'));
}

// 语音转文字（Web Speech API，自动降级）
function toggleVoice() {
  if (recording.value) {
    stopVoice();
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    message.info(t('treehole.write.noVoiceSupport'));
    return;
  }
  const rec = new SR();
  rec.lang = 'zh-CN';
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (e) => {
    let txt = '';
    for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
    content.value = (content.value ? content.value + ' ' : '') + txt;
  };
  rec.onend = () => {
    recording.value = false;
  };
  rec.onerror = () => {
    recording.value = false;
    message.info(t('treehole.write.voiceEnd'));
  };
  try {
    rec.start();
    recording.value = true;
    mediaRec = rec;
  } catch {
    recording.value = false;
  }
}
function stopVoice() {
  try {
    mediaRec?.stop();
  } catch {
    /* empty */
  }
  recording.value = false;
}

// 涂鸦手写信纸
function toggleDoodle() {
  doodleOn.value = !doodleOn.value;
  if (doodleOn.value) nextTick(() => clearDoodle());
}
function getCtx() {
  const c = doodleCanvas.value;
  return c ? c.getContext('2d') : null;
}
function pos(e) {
  const c = doodleCanvas.value;
  const r = c.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: (t.clientX - r.left) * (c.width / r.width), y: (t.clientY - r.top) * (c.height / r.height) };
}
function startDraw(e) {
  drawing = true;
  const p = pos(e);
  const ctx = getCtx();
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
}
function draw(e) {
  if (!drawing) return;
  const p = pos(e);
  const ctx = getCtx();
  ctx.strokeStyle = doodleColor.value;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}
function stopDraw() {
  drawing = false;
}
function clearDoodle() {
  const c = doodleCanvas.value;
  const ctx = getCtx();
  if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
}
function saveDoodle() {
  const c = doodleCanvas.value;
  if (!c) return;
  const dataUrl = c.toDataURL('image/png');
  store.saveSketch(dataUrl);
  content.value += `\n${t('treehole.write.doodleSavedText')}`;
  message.success(t('treehole.write.doodleSavedMsg'));
}

function submit() {
  if (sensitiveHit.value.length) {
    message.warning(t('treehole.write.sensitiveWarning'));
    return;
  }
  if (!store.canPost()) {
    message.warning(t('treehole.write.rateLimitWarning'));
    return;
  }
  const finalContent = content.value.trim();
  const finalCode = codename.value.trim() || randomCodename();
  const isScheduled = scheduledOn.value && scheduledAt.value;
  const now = Date.now();
  const letter = {
    id: editingId.value || 'letter_' + now + '_' + Math.floor(Math.random() * 10000),
    userId: 'local',
    content: finalContent,
    encrypted: 0,
    category: category.value,
    privacy: privacyLevel.value,
    status: isScheduled ? 'scheduled' : 'published',
    scheduledPrivacy: isScheduled ? privacyLevel.value : null,
    scheduledAt: isScheduled ? scheduledAt.value : null,
    sealUntil: sealOn.value && sealUntil.value ? sealUntil.value : null,
    codename: finalCode,
    moods: selectedMoods.value,
    tags: selectedTags.value,
    sticker: sticker.value,
    paper: paper.value,
    likes: 0,
    favorites: 0,
    reportCount: 0,
    version: 1,
    createdAt: now,
  };
  if (editingId.value) {
    store.updateLetter(editingId.value, letter);
    successTip.value = t('treehole.write.updatedTip');
  } else {
    store.addLetter(letter);
    store.logPost();
    lastLetter.value = letter;
    successTip.value = isScheduled
      ? t('treehole.write.scheduledTip')
      : privacyLevel.value === 'public'
        ? t('treehole.write.publishedTip')
        : t('treehole.write.privateTip');
  }
  // 记录心情
  if (selectedMoods.value.length) {
    selectedMoods.value.forEach((m) => store.logMood(m));
  }
  successVisible.value = true;
}

function afterSubmit() {
  successVisible.value = false;
  clearAll();
  router.push('/');
}
function toShare() {
  shareVisible.value = true;
}

function downloadShare() {
  // 纯前端用 SVG 序列化导出图片（无第三方库）
  const node = shareRef.value;
  const clone = node.cloneNode(true);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="${Math.max(420, node.scrollHeight)}">
    <foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${clone.outerHTML}</div></foreignObject></svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${t('treehole.write.shareFilename')}.svg`;
  a.click();
  URL.revokeObjectURL(url);
  message.success(t('treehole.write.shareSaved'));
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
.write-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
  align-items: start;
}
@media (max-width: 880px) {
  .write-grid {
    grid-template-columns: 1fr;
  }
}

.editor-card {
  padding: 16px;
  border-radius: 18px;
  position: relative;
  border: 1px solid var(--card-border);
  border-image: var(--line-grad) 1;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}
.tb-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
  color: var(--text-main);
}
.tb-btn:hover {
  transform: translateY(-2px);
  border-color: var(--blue);
  color: var(--accent);
}
.tb-btn.on {
  background: var(--grad-soft);
  color: var(--accent);
  border-color: var(--blue);
}
.tb-sep {
  width: 1px;
  height: 24px;
  background: var(--line-grad);
  margin: 0 4px;
  opacity: 0.6;
}

.paper-wrap {
  border-radius: 14px;
  padding: 18px;
  min-height: 260px;
  position: relative;
  border: 1px solid rgba(153, 208, 255, 0.3);
  background: rgba(153, 208, 255, 0.04);
}
.paper-input {
  width: 100%;
  min-height: 240px;
  border: none;
  background: transparent;
  resize: vertical;
  outline: none;
  color: var(--text-main);
  line-height: 1.85;
  font-family: inherit;
}
.paper-input::placeholder {
  color: var(--text-sub);
}
.paper-sticker {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 28px;
  opacity: 0.85;
}
.counter {
  text-align: right;
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 6px;
}
.counter.over {
  color: var(--danger);
}

.emoji-pop {
  position: absolute;
  z-index: 30;
  margin-top: 8px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  border-radius: 16px;
  max-width: 360px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
}
.emoji-item {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px;
  transition:
    background var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease),
    border-color var(--duration-fast) var(--ease);
}
.emoji-item:hover {
  background: var(--grad-soft);
  transform: scale(1.2);
}

.setup {
  padding: 18px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--card-border);
  border-image: var(--line-grad) 1;
}
.setup-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.setup-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.cat-btn {
  border: 1px solid var(--card-border);
  background: transparent;
  color: var(--text-sub);
  border-radius: 12px;
  padding: 8px 4px;
  font-size: 12px;
  cursor: pointer;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
}
.cat-btn.active {
  background: var(--grad-soft);
  color: var(--accent);
  border-color: var(--blue);
  font-weight: 700;
}

.privacy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.privacy-btn {
  border: 1px solid var(--card-border);
  background: transparent;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.privacy-btn small {
  color: var(--text-sub);
  font-size: 11px;
}
.privacy-btn.active {
  border-color: var(--blue);
  background: var(--grad-soft);
}

.nick-row {
  display: flex;
  gap: 8px;
}
.btn-grad.ghost {
  background: transparent;
  color: var(--accent);
  box-shadow: none;
  border: 1px solid transparent;
  border-image: var(--line-grad) 1;
  background-image: linear-gradient(#fff, #fff), var(--line-grad);
  background-origin: border-box;
  background-clip: content-box, border-box;
}
.mood-pick,
.sticker-pick {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sticker-pick {
  gap: 4px;
}
.tag-pick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-hint {
  font-size: 11px;
  color: var(--text-sub);
  margin-top: 2px;
}
.tag-btn {
  border: 1px solid var(--card-border);
  background: transparent;
  color: var(--text-sub);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
}
.tag-btn.active {
  background: var(--grad-soft);
  color: var(--accent);
  border-color: var(--blue);
  font-weight: 700;
}
.sticker-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--card-border);
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
  color: var(--text-main);
}
.sticker-btn.active {
  border-color: var(--blue);
  background: var(--grad-soft);
}

.paper-pick {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.paper-btn {
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--card-border);
  cursor: pointer;
  color: var(--text-sub);
  font-size: 11px;
  font-weight: 700;
  transition:
    background var(--duration-base) var(--ease),
    color var(--duration-base) var(--ease),
    border-color var(--duration-base) var(--ease),
    opacity var(--duration-base) var(--ease);
}
.paper-btn.active {
  border-color: var(--blue);
  background: var(--grad-soft);
  box-shadow: 0 0 10px var(--glow);
}

.warn {
  background: rgba(229, 115, 115, 0.12);
  color: var(--danger);
  border: 1px solid rgba(229, 115, 115, 0.3);
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
}
.captcha-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.captcha-code {
  width: 96px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 800;
  letter-spacing: 3px;
  cursor: pointer;
  color: var(--accent);
  background: var(--grad-soft);
  border: 1px solid var(--card-border);
  user-select: none;
  font-style: italic;
}
.setup-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.setup-actions .submit {
  flex: 1;
}
.hint {
  font-size: 12px;
  color: var(--text-sub);
  margin: 0;
}

.success {
  padding: 28px;
  text-align: center;
  border-radius: 18px;
}
.success-ring {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: var(--grad-soft);
  color: var(--accent);
  border: 1px solid var(--card-border);
  display: grid;
  place-items: center;
  font-size: 32px;
  box-shadow: 0 0 24px var(--glow);
  animation: pop 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) both;
}
@keyframes pop {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
.success-acts {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 14px;
}

.share-card {
  padding: 24px;
  border-radius: 18px;
  color: var(--text-main);
  min-height: 300px;
  border: 1px solid var(--card-border);
  border-image: var(--line-grad) 1;
}
.share-head {
  font-weight: 800;
}
.share-cat {
  display: inline-block;
  background: var(--grad-soft);
  border: 1px solid var(--card-border);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  margin: 10px 0;
  color: var(--accent);
}
.share-content {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 15px;
  color: var(--text-main);
}
.share-foot {
  margin-top: 18px;
  font-size: 12px;
  color: var(--text-sub);
  text-align: right;
}

/* 涂鸦手写信纸 */
.doodle-wrap {
  margin-top: 10px;
}
.doodle-canvas {
  width: 100%;
  height: auto;
  background: #fff;
  border-radius: var(--radius-sm);
  border: 1px solid var(--card-border);
  touch-action: none;
  cursor: crosshair;
}
.doodle-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.doodle-color {
  width: 36px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
}
.mini {
  border: 1px solid var(--card-border);
  background: transparent;
  color: var(--text-main);
  border-radius: var(--radius-pill);
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
  border-color: var(--blue);
  color: var(--accent);
}

/* 定时/封存 开关行 */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}
.full {
  width: 100%;
  margin-top: 8px;
}

/* 通用开关 */
.switch {
  width: 50px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: transparent;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}
.switch.on {
  background: var(--grad-soft);
  border-color: var(--blue);
}
.switch .knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  transition: transform 0.3s;
  box-shadow: 0 2px 6px var(--glow);
}
.switch.on .knob {
  transform: translateX(22px);
}

.tb-btn.on {
  background: var(--grad-soft);
  color: var(--accent);
  border-color: var(--blue);
  animation: glowPulse 1.4s ease-in-out infinite;
}
</style>
