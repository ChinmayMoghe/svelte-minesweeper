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
  <h1>😊Mine💣swee💥per😵</h1>
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
      {/each}
      <button class="select_mode_btn">Select mode</button>
    </form>
  {/if}
</div>

<style>
  h1 {
    margin: 20px 0;
  }

  .app {
    display: grid;
    min-height: 100vh;
    place-items: center;
    grid-template-rows: max-content 1fr;
  }

  form {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }

  .radio_grp {
    margin: 15px 0;
    display: flex;
    align-items: center;
    column-gap: 25px;
  }

  .radio_label {
    font-size: 25px;
    text-transform: capitalize;
    cursor: pointer;
  }

  .radio_grp input[type="radio"] {
    width: 30px;
    height: 30px;
    cursor: pointer;
  }

  .select_mode_btn {
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 20px;
  }

  .minesweeper_ctn {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }
</style>
