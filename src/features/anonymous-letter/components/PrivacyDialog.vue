<template>
  <!-- 隐私声明弹窗：明确数据仅本地存储不上传 -->
  <div v-if="modelValue" class="dialog-overlay">
    <div class="dialog glass">
      <div class="privacy">
        <div class="privacy-emoji">🔒</div>
        <h2 class="grad-text">隐私声明</h2>
        <p class="privacy-text">欢迎来到 <b>拾光树洞</b>。这是一个 <b>纯匿名、无注册登录</b> 的倾诉空间：</p>
        <ul class="privacy-list">
          <li>🌿 你发布的信件保存在 <b>服务器数据库</b>，匿名代号随机生成</li>
          <li>🌿 系统 <b>不收集任何真实个人信息</b>，账号可选登录</li>
          <li>🌿 所有投稿需经 <b>管理员审核</b> 通过后才公开展示</li>
          <li>🌿 随机树洞与回信均为 <b>双向匿名</b>，不暴露身份</li>
        </ul>
        <p class="privacy-tip">请理性倾诉，共同维护温暖治愈的树洞环境。</p>
        <div class="privacy-actions">
          <button class="btn-grad" @click="accept">我已知晓，进入树洞</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApp } from '../stores/app';
const _props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue']);
const { acceptPrivacy } = useApp();

function accept() {
  acceptPrivacy();
  emit('update:modelValue', false);
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--mask);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.dialog {
  padding: 24px;
  border-radius: var(--radius);
  max-width: 440px;
  width: 92vw;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
}
.privacy {
  padding: 28px 26px;
  text-align: center;
  border-radius: 22px;
}
.privacy-emoji {
  font-size: 46px;
  margin-bottom: 6px;
}
.privacy h2 {
  font-size: 22px;
  margin: 4px 0 14px;
}
.privacy-text {
  text-align: left;
  color: var(--text-sub);
  margin: 0 0 10px;
}
.privacy-list {
  text-align: left;
  padding-left: 4px;
  list-style: none;
  margin: 0 0 12px;
}
.privacy-list li {
  margin: 8px 0;
  font-size: 14px;
}
.privacy-tip {
  font-size: 12px;
  color: var(--text-sub);
  margin: 6px 0 18px;
}
.privacy-actions .btn-grad {
  width: 100%;
}
</style>
