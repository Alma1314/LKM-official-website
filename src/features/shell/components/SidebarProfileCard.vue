<template>
  <div
    class="bg-white dark:bg-[oklch(0.23_0.015_var(--hue))] rounded-[var(--radius-large)] overflow-hidden shadow-sm dark:shadow-none p-3"
  >
    <!-- 头像 -->
    <div
      class="block relative mx-auto mt-1 lg:mx-0 lg:mt-0 mb-3 max-w-[12rem] lg:max-w-none overflow-hidden rounded-xl"
    >
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        alt="Profile Image"
        class="mx-auto lg:w-full h-full lg:mt-0 block"
        @error="avatarFailed = true"
      />
      <span
        v-else
        class="flex items-center justify-center mx-auto w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-3xl"
        >{{ avatarLetter }}</span
      >
    </div>

    <div class="px-2">
      <div
        class="font-bold text-xl text-center mb-1 dark:text-text-muted-50 transition"
      >
        {{ displayName }}
      </div>
      <div
        class="h-1 w-5 bg-primary mx-auto rounded-full mb-2 transition"
      ></div>
      <div v-if="bio" class="text-center text-text-muted-400 mb-2.5 transition">
        {{ bio }}
      </div>
      <div v-if="links.length" class="flex flex-wrap gap-2 justify-center mb-1">
        <a
          v-for="(l, idx) in links"
          :key="idx"
          rel="me noopener noreferrer"
          :aria-label="l.name"
          :href="l.url || '#'"
          target="_blank"
          :class="
            l.icon
              ? 'btn-regular rounded-lg h-10 w-10 active:scale-90 flex items-center justify-center'
              : 'btn-regular rounded-lg h-10 gap-2 px-3 font-bold active:scale-95 flex items-center'
          "
        >
          <Icon v-if="l.icon" :icon="l.icon" class="text-[1.5rem]" />
          <template v-else>{{ l.name }}</template>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { profileConfig } from "~/lib/config";
import { authApi } from "~/lib/api";
import { buildUrl } from "~/lib/utils/paths";
import type { ContactLink } from "~/lib/api/modules/auth";

const props = defineProps<{ username?: string }>();

type UserCard = {
  nickname?: string | null;
  avatar?: string | null;
  contact_links?: ContactLink[];
} & {
  username: string;
};

const user = ref<UserCard | null>(null);
const avatarFailed = ref(false);

const hasUserMode = computed(() => !!props.username);

// 通用卡默认值 = 理科迷卡
const displayName = computed(() =>
  hasUserMode.value && user.value
    ? user.value.nickname || user.value.username || "?"
    : profileConfig.name || "",
);
const bio = computed(() => (hasUserMode.value ? "" : profileConfig.bio || ""));
const links = computed(() =>
  hasUserMode.value ? user.value?.contact_links || [] : profileConfig.links,
);

// 头像：http(s)/data: 直接用；否则 buildUrl 拼 base 前缀；空则空 → 首字
const avatarSrc = computed(() => {
  if (avatarFailed.value) return "";
  const raw = hasUserMode.value ? user.value?.avatar : profileConfig.avatar;
  if (!raw) return "";
  if (/^https?:/i.test(raw) || raw.startsWith("data:")) return raw;
  return buildUrl(raw);
});
const avatarLetter = computed(() => displayName.value.charAt(0).toUpperCase());

onMounted(async () => {
  if (!props.username) return;
  const r = await authApi.getUserByUsername(props.username);
  r.match(
    (d) => {
      user.value = { ...d, username: props.username };
    },
    () => {
      /* user stays null → 回退理科迷卡 */
    },
  );
});
</script>
