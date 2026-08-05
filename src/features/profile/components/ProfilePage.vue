<template>
  <div class="space-y-6">
    <!-- 头部 -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div
        class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-2xl"
      >
        {{ user.displayName.charAt(0) }}
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="text-2xl font-bold text-deep-text">{{ user.displayName }}</h1>
          <span
            class="text-sm px-2 py-0.5 rounded-full font-medium"
            :style="{ color: titleInfo.color, background: titleInfo.color + '15' }"
          >
            {{ titleInfo.name }}
          </span>
        </div>
        <p class="text-sm text-text-muted mt-1">@{{ user.username }}</p>
        <div class="flex items-center gap-4 mt-2 text-sm text-text-muted/60">
          <span>{{ user.followerCount }} 关注者</span>
          <span>{{ user.followingCount }} 正在关注</span>
          <span class="text-primary font-semibold">{{ user.points.toLocaleString() }} 积分</span>
        </div>
      </div>
      <div class="flex gap-2 shrink-0">
        <button class="btn-primary px-5 py-2 rounded-lg text-sm font-semibold">关注</button>
        <button class="btn-ghost px-4 py-2 rounded-lg text-sm">私信</button>
      </div>
    </div>

    <!-- 个人资料 -->
    <div class="border-t border-surface-3 pt-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-text-muted/60">座右铭</span>
          <p class="text-deep-text mt-0.5">{{ user.bio || '未填写' }}</p>
        </div>
        <div>
          <span class="text-text-muted/60">专业方向</span>
          <p class="text-deep-text mt-0.5">{{ user.major }}</p>
        </div>
        <div>
          <span class="text-text-muted/60">年级</span>
          <p class="text-deep-text mt-0.5">{{ user.grade }}</p>
        </div>
        <div>
          <span class="text-text-muted/60">兴趣爱好</span>
          <div class="flex flex-wrap gap-1 mt-1">
            <span
              v-for="i in user.interests"
              :key="i"
              class="text-xs px-2 py-0.5 rounded-full bg-surface-3 text-text-muted"
              >{{ i }}</span
            >
          </div>
        </div>
        <div class="sm:col-span-2">
          <span class="text-text-muted/60">理想</span>
          <p class="text-deep-text mt-0.5">{{ user.ideals || '未填写' }}</p>
        </div>
      </div>
    </div>

    <!-- Tab 区域 -->
    <div class="border-t border-surface-3 pt-4">
      <div class="flex border-b border-surface-3">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
          :class="activeTab === tab.key ? 'text-primary' : 'text-text-muted hover:text-deep-text'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }} ({{ tab.count }})
          <div
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
          ></div>
        </button>
      </div>
      <div class="pt-4">
        <div v-if="activeTab === 'posts'" class="space-y-3">
          <div v-for="(post, i) in userPosts" :key="i" class="border-b border-surface-3 pb-3 last:border-0 last:pb-0">
            <a
              :href="buildUrl(`/forum/post/${post.id}`)"
              class="text-deep-text font-medium hover:text-primary transition-colors line-clamp-1"
              >{{ post.title }}</a
            >
            <div class="flex items-center gap-3 mt-1 text-xs text-text-muted/60">
              <span>{{ formatTime(post.createdAt) }}</span
              ><span>{{ post.likeCount }} 赞</span><span>{{ post.commentCount }} 评论</span>
            </div>
          </div>
          <div v-if="userPosts.length === 0" class="text-center py-8 text-sm text-text-muted">暂无发言</div>
        </div>

        <div v-if="activeTab === 'projects'" class="space-y-3">
          <div
            v-for="(proj, i) in userProjects"
            :key="i"
            class="flex items-start gap-3 border-b border-surface-3 pb-3 last:border-0 last:pb-0"
          >
            <div
              class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xs"
            >
              {{ proj.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <a
                :href="buildUrl(`/projects/${proj.id}`)"
                class="text-deep-text font-medium hover:text-primary transition-colors line-clamp-1"
                >{{ proj.name }}</a
              >
              <p class="text-xs text-text-muted mt-0.5">{{ proj.role }} · 进度 {{ proj.progress }}%</p>
            </div>
          </div>
          <div v-if="userProjects.length === 0" class="text-center py-8 text-sm text-text-muted">暂无参与项目</div>
        </div>

        <div v-if="activeTab === 'columns'" class="space-y-3">
          <div v-if="!user.hasColumnAccess" class="text-center py-8">
            <p class="text-sm text-text-muted mb-2">尚未开通专栏功能</p>
            <a :href="buildUrl('/register/onboarding')" class="text-primary text-sm font-medium hover:underline"
              >通过答题解锁专栏 →</a
            >
          </div>
          <div v-else-if="userColumns.length === 0" class="text-center py-8 text-sm text-text-muted">暂无专栏文章</div>
          <div v-for="(art, i) in userColumns" :key="i" class="border-b border-surface-3 pb-3 last:border-0 last:pb-0">
            <a :href="art.url" class="text-deep-text font-medium hover:text-primary transition-colors line-clamp-1">{{
              art.title
            }}</a>
            <div class="flex items-center gap-3 mt-1 text-xs text-text-muted/60">
              <span>{{ formatTime(art.createdAt) }}</span
              ><span>{{ art.viewCount }} 阅读</span><span>{{ art.likeCount }} 赞</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { type MockUser, TITLE_MAP } from '../data/mock-users';
import { mockPosts } from '../../forum/data/mock-posts';
import { buildUrl } from '~/lib/utils/paths';

const props = defineProps<{ user: MockUser }>();

const titleInfo = computed(() => TITLE_MAP[props.user.title] || TITLE_MAP.newbie);
const activeTab = ref('posts');
const tabs = computed(() => [
  { key: 'posts', label: '发言', count: props.user.postCount },
  { key: 'projects', label: '项目', count: props.user.projectCount },
  { key: 'columns', label: '专栏', count: props.user.columnArticleCount },
]);
const userPosts = computed(() => mockPosts.filter((p) => p.authorId === props.user.id).slice(0, 10));

const userProjects = [
  props.user.id === 'user-qiyue-o' ? { id: 'proj-1', name: '引力波数据分析工具', role: '发起人', progress: 80 } : null,
  props.user.id === 'user-qiyue-o' ? { id: 'proj-2', name: '天体物理科普系列', role: '主笔', progress: 60 } : null,
  props.user.id === 'user-qiyue-o' ? { id: 'proj-3', name: '天文观测APP', role: '顾问', progress: 40 } : null,
  props.user.id === 'user-qiyue-hua' ? { id: 'proj-4', name: '科学教育课程设计', role: '发起人', progress: 70 } : null,
  props.user.id === 'user-qiyue-hua' ? { id: 'proj-5', name: '数学建模培训体系', role: '发起人', progress: 90 } : null,
  props.user.id === 'user-qiyue-moran'
    ? { id: 'proj-6', name: 'Python物理模拟库', role: '核心开发', progress: 50 }
    : null,
  props.user.id === 'user-qiyue-moran'
    ? { id: 'proj-7', name: '数据可视化平台', role: '前端开发', progress: 30 }
    : null,
  props.user.id === 'user-qiyue-yuli' ? { id: 'proj-8', name: '社区运营体系建设', role: '负责人', progress: 85 } : null,
].filter(Boolean);

const userColumns = computed(() => {
  if (!props.user.hasColumnAccess) return [];
  return Array.from({ length: Math.min(props.user.columnArticleCount, 5) }, (_, i) => ({
    title: `${props.user.displayName}的专栏文章 #${i + 1}`,
    url: buildUrl(`/columns/${props.user.username}/article-${i + 1}`),
    createdAt: new Date(2026, 6, 20 - i).toISOString(),
    viewCount: Math.floor(Math.random() * 500) + 100,
    likeCount: Math.floor(Math.random() * 50) + 10,
  }));
});

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
</script>
