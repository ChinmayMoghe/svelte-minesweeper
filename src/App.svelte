<script lang="ts">
  import MineSweeper from "./lib/client/MineSweeper.svelte";
  import {
    GameDifficulty,
    type GameModes,
  } from "./lib/client/interfaces/GameInterfaces";
  import { slide } from "svelte/transition";
  let difficulty: GameModes = "baby";
  let isModeSelected: Boolean = false;

  const resetMode = () => (isModeSelected = false);
</script>

<div class="app">
  {#if isModeSelected}
    <div class="minesweeper_ctn" in:slide|local>
      <button class="select_mode_btn" on:click={resetMode}>Select mode</button>
      <MineSweeper {difficulty} />
    </div>
  {:else}
    <form
      on:submit|preventDefault={() => {
        isModeSelected = true;
      }}
    >
      {#each Object.keys(GameDifficulty) as key}
        <div>
          <label class="radio_grp radio_label" for={key}>
            <input
              type="radio"
              bind:group={difficulty}
              name="difficulty"
              id={key}
              value={key}
            />
            {key}
          </label>
        </div>
      {/each}
      <button class="select_mode_btn">Select mode</button>
    </form>
  {/if}
</div>

<style>
  .app {
    display: grid;
    min-height: 100vh;
    place-items: center;
  }

  .radio_grp {
    margin: 10px 0;
    display: flex;
    align-items: center;
    column-gap: 15px;
  }

  .radio_label {
    font-size: 15px;
    text-transform: capitalize;
  }

  .radio_grp input[type="radio"] {
    width: 20px;
    height: 20px;
  }

  .select_mode_btn {
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  .minesweeper_ctn {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }
</style>
