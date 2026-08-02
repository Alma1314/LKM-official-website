<script lang="ts">
  import { authStore } from '~/features/starhope/stores/auth.svelte';
  import StarHopeLoginRequired from '~/features/starhope/routes/StarHopeLoginRequired.svelte';

  let { children } = $props<{ children: import('svelte').Snippet }>();

  const isLoggedIn = $derived(authStore.isLoggedIn);
</script>

{#if !isLoggedIn}
  <StarHopeLoginRequired />
{:else}
  {@render children()}
{/if}
