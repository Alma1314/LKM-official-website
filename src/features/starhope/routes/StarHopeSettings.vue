<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../stores/db';
import type { Question } from '~/features/starhope/types';
import { t } from '~/lib/i18n';
const exportStatus = ref('');

async function exportData() {
  try {
    const questions = (await db.questions.toArray()) as Question[];
    const json = JSON.stringify({ questions, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starhope-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    exportStatus.value = t('starhope.settings.exportSuccess');
  } catch {
    exportStatus.value = t('starhope.settings.exportFailed');
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">{{ t('starhope.settings.title') }}</h1>
    <div class="card-base p-6">
      <h3 class="text-sm font-semibold text-deep-text mb-3">{{ t('starhope.settings.dataManagement') }}</h3>
      <button @click="exportData" class="btn-primary rounded-lg px-4 py-2 text-sm">
        {{ t('starhope.settings.exportBank') }}
      </button>
      <p v-if="exportStatus" class="text-sm text-text-muted mt-2">{{ exportStatus }}</p>
    </div>
  </div>
</template>
