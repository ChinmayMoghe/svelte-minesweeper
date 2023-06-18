<script lang="ts">
  import MineSweeper from "./lib/client/MineSweeper.svelte";
  import { GameDifficulty } from "./lib/client/interfaces/GameInterfaces";
  let difficulty: String = "baby";
  let isModeSelected: Boolean = false;
</script>

<div class="app">
  {#if isModeSelected}
    <MineSweeper {difficulty} />
  {:else}
    <form
      on:submit|preventDefault={() => {
        isModeSelected = true;
      }}
    >
      {#each Object.keys(GameDifficulty) as key}
        <div>
          <input
            type="radio"
            bind:group={difficulty}
            name="difficulty"
            id={key}
            value={key}
          />
          <label for={key}>{key}</label>
        </div>
      {/each}
      <button>Select mode</button>
    </form>
  {/if}
</div>

<style>
  .app {
    display: grid;
    min-height: 100vh;
    place-items: center;
  }
</style>
