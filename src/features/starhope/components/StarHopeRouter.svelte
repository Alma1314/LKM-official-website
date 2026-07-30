<script lang="ts">
  import { authStore } from '~/features/starhope/stores/auth.svelte';
  import AuthGuard from '~/features/starhope/hooks/AuthGuard.svelte';
  import StarHopeLogin from '~/features/starhope/routes/StarHopeLogin.svelte';
  import StarHopeDashboard from '~/features/starhope/routes/StarHopeDashboard.svelte';
  import StarHopeBank from '~/features/starhope/routes/StarHopeBank.svelte';
  import StarHopePractice from '~/features/starhope/routes/StarHopePractice.svelte';
  import StarHopeExam from '~/features/starhope/routes/StarHopeExam.svelte';
  import StarHopeWrongBook from '~/features/starhope/routes/StarHopeWrongBook.svelte';
  import StarHopeAi from '~/features/starhope/routes/StarHopeAi.svelte';
  import StarHopeReader from '~/features/starhope/routes/StarHopeReader.svelte';
  import StarHopePlugins from '~/features/starhope/routes/StarHopePlugins.svelte';
  import StarHopeSettings from '~/features/starhope/routes/StarHopeSettings.svelte';
  import { navigation, type StarHopeRoute } from '~/features/starhope/stores/navigation.svelte';

  const { currentRoute: current } = navigation;

  const routeTable: Record<StarHopeRoute, unknown> = {
    login: StarHopeLogin,
    dashboard: StarHopeDashboard,
    bank: StarHopeBank,
    practice: StarHopePractice,
    exam: StarHopeExam,
    'wrong-book': StarHopeWrongBook,
    ai: StarHopeAi,
    reader: StarHopeReader,
    plugins: StarHopePlugins,
    settings: StarHopeSettings,
  };
</script>

{#if current === 'login'}
  <StarHopeLogin />
{:else}
  <AuthGuard>
    {#each Object.keys(routeTable) as key}
      {#if current === key}
        {#if key === 'dashboard'}
          <StarHopeDashboard />
        {:else if key === 'bank'}
          <StarHopeBank />
        {:else if key === 'practice'}
          <StarHopePractice />
        {:else if key === 'exam'}
          <StarHopeExam />
        {:else if key === 'wrong-book'}
          <StarHopeWrongBook />
        {:else if key === 'ai'}
          <StarHopeAi />
        {:else if key === 'reader'}
          <StarHopeReader />
        {:else if key === 'plugins'}
          <StarHopePlugins />
        {:else if key === 'settings'}
          <StarHopeSettings />
        {:else}
          <StarHopeDashboard />
        {/if}
      {/if}
    {/each}
  </AuthGuard>
{/if}
