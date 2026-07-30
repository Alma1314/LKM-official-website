<script lang="ts">
  import { authStore } from '../../stores/auth.svelte';
  import AuthGuard from '../../hooks/AuthGuard.svelte';
  import StarHopeLogin from '../../routes/StarHopeLogin.svelte';
  import StarHopeDashboard from '../../routes/StarHopeDashboard.svelte';
  import StarHopeBank from '../../routes/StarHopeBank.svelte';
  import StarHopePractice from '../../routes/StarHopePractice.svelte';
  import StarHopeExam from '../../routes/StarHopeExam.svelte';
  import StarHopeWrongBook from '../../routes/StarHopeWrongBook.svelte';
  import StarHopeAi from '../../routes/StarHopeAi.svelte';
  import StarHopeReader from '../../routes/StarHopeReader.svelte';
  import StarHopePlugins from '../../routes/StarHopePlugins.svelte';
  import StarHopeSettings from '../../routes/StarHopeSettings.svelte';
  import { navigation, type StarHopeRoute } from '../../stores/navigation.svelte';

  const { current } = navigation;

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
