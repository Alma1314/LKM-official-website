<script setup lang="ts">
import { onMounted } from "vue";
import { useQuestionBankStore } from "../stores/question-bank";
import { usePracticeStore } from "../stores/practice";
import { useNavigationStore } from "../stores/navigation";
import { t } from "~/lib/i18n";

const bank = useQuestionBankStore();
const practice = usePracticeStore();
const _nav = useNavigationStore();

onMounted(async () => {
  await bank.loadQuestions();
});

async function _start(_questionIds: string[]) {
  await practice.startPractice({
    questionIds: _questionIds,
    mode: "realtime",
    type: "practice",
  });
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-deep-text mb-6">
      {{ t("starhope.practice.title") }}
    </h1>
    <div class="card-base p-6 text-center text-text-muted">
      <div class="text-5xl mb-4">✏️</div>
      <p>
        {{
          t("starhope.practice.summary", { count: bank.questions.value.length })
        }}
      </p>
    </div>
  </div>
</template>
