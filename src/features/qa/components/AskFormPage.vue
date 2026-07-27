<template>
  <div class="max-w-lg mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-deep-text">提出问题</h1>

    <div class="flex gap-2">
      <button v-for="tab in tabs" :key="tab.key" class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-3 text-text-muted'" @click="activeTab = tab.key">{{ tab.label }}</button>
    </div>

    <!-- 通用求助表单 -->
    <div v-if="activeTab === 'general'" class="space-y-4">
      <input v-model="title" class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none" placeholder="问题标题" />
      <textarea v-model="content" rows="5" class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm text-deep-text focus:border-primary outline-none resize-none" placeholder="详细描述你的问题..."></textarea>
      <div class="flex items-center gap-2">
        <span class="text-sm text-text-muted">悬赏积分：</span>
        <input v-model.number="bounty" type="range" min="0" max="100" step="5" class="flex-1" />
        <span class="text-sm font-bold text-amber-500">{{ bounty }} 积分</span>
      </div>
      <button class="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold" :disabled="!title.trim()" @click="submit">发布问题</button>
    </div>

    <!-- 志愿推荐模板 -->
    <div v-else class="space-y-3">
      <div><label class="text-sm font-medium text-deep-text">省份</label><input v-model="volunteerData.province" class="w-full mt-1 px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm focus:border-primary outline-none" placeholder="如：广东" /></div>
      <div><label class="text-sm font-medium text-deep-text">分数/排名</label><input v-model="volunteerData.score" class="w-full mt-1 px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm focus:border-primary outline-none" placeholder="如：640分 / 省排 12000" /></div>
      <div><label class="text-sm font-medium text-deep-text">选科</label><div class="flex flex-wrap gap-2 mt-1"><button v-for="s in ['物理','历史','化学','生物','政治','地理']" :key="s" class="px-3 py-1 rounded-full text-xs border transition-colors" :class="volunteerData.subjects.includes(s) ? 'border-primary bg-primary/10 text-primary' : 'border-surface-3 text-text-muted'" @click="toggleSubject(s)">{{ s }}</button></div></div>
      <div><label class="text-sm font-medium text-deep-text">兴趣方向</label><input v-model="volunteerData.interests" class="w-full mt-1 px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm focus:border-primary outline-none" placeholder="如：计算机、医学、师范" /></div>
      <div><label class="text-sm font-medium text-deep-text">补充说明（选填）</label><textarea v-model="volunteerData.note" rows="2" class="w-full mt-1 px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-sm focus:border-primary outline-none resize-none" placeholder="如：家庭情况、经济考量等"></textarea></div>
      <button class="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold" :disabled="!volunteerData.province" @click="submitVolunteer">发布咨询</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const activeTab = ref('general');
const tabs = [{ key: 'general', label: '通用求助' }, { key: 'volunteer', label: '志愿/专业推荐' }];

const title = ref('');
const content = ref('');
const bounty = ref(10);

const volunteerData = reactive({ province: '', score: '', subjects: [] as string[], interests: '', note: '' });

function toggleSubject(s: string) {
  const i = volunteerData.subjects.indexOf(s);
  if (i >= 0) volunteerData.subjects.splice(i, 1);
  else volunteerData.subjects.push(s);
}

function submit() { alert('问题已发布！'); window.location.href = '/qa'; }
function submitVolunteer() { alert('志愿咨询已发布！'); window.location.href = '/qa'; }
</script>
