<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-semibold text-deep-text">
        {{ t("onboarding.tasks.completeProfile") }}
      </h3>
      <p class="text-sm text-text-muted mt-1">
        {{ t("onboarding.tasks.rewardHint", { points: 100 }) }}
      </p>
    </div>

    <div class="max-w-sm mx-auto space-y-4">
      <!-- 显示名称 -->
      <div>
        <label class="block text-sm font-medium text-deep-text mb-1.5">{{
          t("onboarding.tasks.displayName")
        }}</label>
        <input
          v-model="displayName"
          type="text"
          class="input input-bordered w-full"
          :placeholder="t('onboarding.tasks.displayNamePlaceholder')"
        />
      </div>

      <!-- 座右铭 -->
      <div>
        <label class="block text-sm font-medium text-deep-text mb-1.5">{{
          t("onboarding.tasks.motto")
        }}</label>
        <input
          v-model="bio"
          type="text"
          class="input input-bordered w-full"
          :placeholder="t('onboarding.tasks.mottoPlaceholder')"
        />
      </div>

      <!-- 简介 -->
      <div>
        <label class="block text-sm font-medium text-deep-text mb-1.5">{{
          t("onboarding.tasks.intro")
        }}</label>
        <textarea
          v-model="intro"
          rows="3"
          class="w-full px-3 py-2 rounded-lg border border-surface-3 bg-card-bg text-deep-text text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
          :placeholder="t('onboarding.tasks.introPlaceholder')"
        ></textarea>
      </div>
    </div>

    <div
      class="bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-sm mx-auto"
    >
      <div class="flex items-center gap-3">
        <Icon
          icon="material-symbols:stars-outline"
          class="w-6 h-6 text-primary shrink-0"
        />
        <div class="text-sm">
          <p class="font-medium text-deep-text">
            {{ t("onboarding.tasks.rewardTitle") }}
          </p>
          <p class="text-text-muted">
            {{ t("onboarding.tasks.rewardDetail") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { t } from "~/lib/i18n";

const displayName = ref("");
const bio = ref("");
const intro = ref("");

defineExpose({
  getData: () => ({
    displayName: displayName.value,
    bio: bio.value,
    intro: intro.value,
  }),
});
</script>
