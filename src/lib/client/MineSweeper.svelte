<script lang="ts">
  export let difficulty: GameModes = "baby";
  const _noop = () => {
    return;
  };
  import {
    CellClickState,
    CellSymbols,
    CellType,
    GameDifficulty,
    FlagState,
    ClickType,
    GameState,
    type GameModes,
  } from "./interfaces/GameInterfaces";
  import type { Cell, Bound } from "./interfaces/GameInterfaces";
  import { slide } from "svelte/transition";
  function uniqueRandomIndices(
    row_count: number,
    col_count: number,
    range: number,
  ) {
    const upper_row = row_count - 1;
    const upper_col = col_count - 1;
    const idxMap = new Map();
    while (idxMap.size !== range) {
      const rowIdx = Math.floor(Math.random() * upper_row);
      const colIdx = Math.floor(Math.random() * upper_col);
      idxMap.set(`${rowIdx}_${colIdx}`, [rowIdx, colIdx]);
    }
    return [...idxMap.values()];
  }

  const getMinIdx = (idx: number) => {
    if (idx > 0) {
      return idx - 1;
    }
    return 0;
  };
  const getMaxIdx = (idx: number, maxLen: number) => {
    if (idx + 1 > maxLen - 1) {
      return maxLen - 1;
    }
    return idx + 1;
  };

  const getBounds = (row_idx: number, col_idx: number): Bound => {
    return {
      row_min: getMinIdx(row_idx),
      col_min: getMinIdx(col_idx),
      row_max: getMaxIdx(row_idx, rows),
      col_max: getMaxIdx(col_idx, cols),
    };
  };

  function annotateWithMines(
    boardWithMines: Cell[][],
    minePositions: number[][],
  ) {
    for (let minePosition of minePositions) {
      const [row, col] = minePosition;
      const bounds = getBounds(row, col);
      const { row_min, row_max, col_min, col_max } = bounds;
      for (let row_idx = row_min; row_idx <= row_max; row_idx++) {
        for (let col_idx = col_min; col_idx <= col_max; col_idx++) {
          const adjacentCell = boardWithMines[row_idx][col_idx];
          switch (adjacentCell.type) {
            case CellType.count:
              const currentCount: number =
                +boardWithMines[row_idx][col_idx].text;
              boardWithMines[row_idx][col_idx].text = `${currentCount + 1}`;
              break;
            case CellType.empty:
              boardWithMines[row_idx][col_idx].text = "1";
              boardWithMines[row_idx][col_idx].type = CellType.count;
              break;
            case CellType.mine:
              break;
          }
        }
      }
    }
    return boardWithMines;
  }

  function createBoard(
    rows: number,
    cols: number,
    minePositions: number[][],
  ): Cell[][] {
    const minePositionsStrings = minePositions.map(([r, c]) => `${r}_${c}`);
    let boardWithMines = Array.from({ length: rows }, (_, row_idx) =>
      Array.from({ length: cols }, (_, col_idx) => {
        let cell: Cell = {
          text: "",
          row: row_idx,
          col: col_idx,
          type: CellType.empty,
          clicked: CellClickState.not_clicked,
          flagged: FlagState.not_flagged,
        };
        if (minePositionsStrings.includes(`${row_idx}_${col_idx}`)) {
          cell.type = CellType.mine;
          cell.text = CellSymbols.mine;
        }
        return cell;
      }),
    );
    return boardWithMines;
  }
  let { rows, cols, mines, cellSize } = GameDifficulty[difficulty];
  let minePositions = uniqueRandomIndices(rows, cols, mines);
  let game_state: GameState = GameState.on;
  let board = annotateWithMines(
    createBoard(rows, cols, minePositions),
    minePositions,
  );
  let clickedCellsCount = 0;
  let winClickCount = rows * cols - minePositions.length;
  $: flaggedCellsCount = mines;
  $: clickedCellsCount = calculateClickedCellsCount(board);
  $: if (clickedCellsCount === winClickCount) {
    game_state = GameState.win;
  }
  let timer = 0;
  let intervalWorker: Worker;
  let incrementTimer = () => {
    timer += 1;
  };
  $: if (clickedCellsCount >= 1 && timer === 0) {
    intervalWorker = new Worker("timer.worker.js");
    intervalWorker.addEventListener("message", incrementTimer);
    intervalWorker.postMessage({
      type: "START_TIMER",
      payload: { interval: 1000 },
    });
  }
  $: timerDisplay = {
    minute: Math.round(timer / 60),
    seconds: Math.round(timer % 60),
  };

  $: if (game_state !== GameState.on) {
    intervalWorker?.postMessage({ type: "STOP_TIMER" });
  }

  const calculateClickedCellsCount = (board: Array<Array<Cell>>) => {
    return board.reduce((acc, arr) => {
      acc += arr.reduce((count, cell) => {
        count += cell.clicked === CellClickState.clicked ? 1 : 0;
        return count;
      }, 0);
      return acc;
    }, 0);
  };

  const clickEmptyCell = (row_idx: number, col_idx: number) => {
    // recursively click adjacent cells until:
    // 1. hit a boundary of mine counts - is it same as 3 ?
    // 2. cells are already clicked
    // 3. cells have mines - same as 1 maybe
    // 4. cells that are flagged - need to add a flag feature as well
    if (board[row_idx][col_idx].type === CellType.count) {
      return;
    }

    const { row_min, row_max, col_min, col_max } = getBounds(row_idx, col_idx);
    // loop over bounds to click each cell within the bounds
    for (let r_idx = row_min; r_idx <= row_max; r_idx++) {
      for (let c_idx = col_min; c_idx <= col_max; c_idx++) {
        const cell = board[r_idx][c_idx];
        if (
          ![CellType.mine].includes(cell.type) &&
          cell.flagged !== FlagState.flagged &&
          cell.clicked === CellClickState.not_clicked
        ) {
          board[r_idx][c_idx] = { ...cell, clicked: CellClickState.clicked };
          clickEmptyCell(r_idx, c_idx);
        }
      }
    }
  };

  const explodeAllMines = () => {
    for (let [row, col] of minePositions) {
      board[row][col] = {
        ...board[row][col],
        text: CellSymbols.explode,
      };
    }
  };

  const setGameLose = () => {
    game_state = GameState.lose;
  };

  const handleMineClick = () => {
    for (let [row, col] of minePositions) {
      board[row][col] = {
        ...board[row][col],
        clicked: CellClickState.clicked,
      };
    }
    setTimeout(() => {
      explodeAllMines();
      setGameLose();
    }, 300);
  };

  const handleLeftClick = (event: MouseEvent) => {
    if (event.target instanceof HTMLButtonElement) {
      const row_idx = Number(event.target.dataset.row);
      const col_idx = Number(event.target.dataset.col);
      const cell = board[row_idx][col_idx];
      if (
        cell.clicked === CellClickState.not_clicked &&
        cell.flagged === FlagState.not_flagged
      ) {
        board[row_idx][col_idx] = {
          ...cell,
          clicked: CellClickState.clicked,
        };
        switch (cell.type) {
          case CellType.mine:
            handleMineClick();
            break;
          case CellType.empty:
            clickEmptyCell(row_idx, col_idx);
            break;
          case CellType.count:
            break;
          default:
            break;
        }
      }
    } else {
      return;
    }
  };

  const handleCellClick = (event: MouseEvent) => {
    switch (event.button) {
      case ClickType.left:
        handleLeftClick(event);
        break;
      case ClickType.right:
        handleRightClickonCell(event);
        break;
    }

    return;
  };

  const handleRightClickonCell = (event: MouseEvent) => {
    if (event.target instanceof HTMLButtonElement) {
      const row_idx = Number(event.target.dataset.row);
      const col_idx = Number(event.target.dataset.col);
      const cell = board[row_idx][col_idx];
      if (cell.clicked === CellClickState.not_clicked) {
        const isCellFlagged = cell.flagged === FlagState.flagged;
        board[row_idx][col_idx] = {
          ...cell,
          flagged: isCellFlagged ? FlagState.not_flagged : FlagState.flagged,
        };
        if (isCellFlagged) {
          flaggedCellsCount += 1;
        } else {
          flaggedCellsCount -= 1;
        }
      } else {
        return;
      }
    }
  };

  const getCellContent = (cell: Cell) => {
    if (
      cell.clicked === CellClickState.clicked &&
      cell.flagged === FlagState.not_flagged
    ) {
      return cell.text;
    } else if (cell.flagged === FlagState.flagged) {
      return CellSymbols.flag;
    }
    return CellSymbols.empty;
  };

  const resetGame = () => {
    timer = 0;
    flaggedCellsCount = mines;
    clickedCellsCount = 0;
    game_state = GameState.on;
    minePositions = uniqueRandomIndices(rows, cols, mines);
    board = annotateWithMines(
      createBoard(rows, cols, minePositions),
      minePositions,
    );
  };
</script>

{#if game_state !== GameState.on}
  <div
    class="game_over_banner"
    class:lose_game={game_state === GameState.lose}
    transition:slide|local
  >
    {#if game_state === GameState.win}
      You win
    {:else if game_state === GameState.lose}
      You lose !!!!
    {/if}
  </div>
{/if}
<div class="minesweeper_container">
  <div class="panel">
    <div>💣 {flaggedCellsCount}</div>
    <div class="smiley_ctn">
      <button
        class="smiley_btn"
        on:click={game_state !== GameState.on ? resetGame : _noop}
      >
        {#if game_state === GameState.on}
          🙂
        {:else if game_state === GameState.lose}
          😵
        {:else}
          😁
        {/if}
      </button>
    </div>
    <div class="timer_ctn">
      {timerDisplay.minute < 10
        ? `0${timerDisplay.minute}`
        : timerDisplay.minute}:{timerDisplay.seconds < 10
        ? `0${timerDisplay.seconds}`
        : timerDisplay.seconds}
    </div>
  </div>
  <div class="grid" style="--rows:{rows};--cols:{cols};--cell-size:{cellSize}">
    {#each board as rows}
      {#each rows as cell}
        <button
          tabindex={cell.clicked === CellClickState.clicked ? -1 : 0}
          on:mousedown={cell.clicked === CellClickState.not_clicked &&
          game_state === GameState.on
            ? handleCellClick
            : _noop}
          on:contextmenu|preventDefault
          data-row={cell.row}
          data-col={cell.col}
          class="cell"
          class:gameover={game_state !== GameState.on}
          class:clicked={cell.clicked === CellClickState.clicked}
          >{getCellContent(cell)}</button
        >
      {/each}
    {/each}
  </div>
</div>

<style>
  .minesweeper_container {
    display: grid;
    grid-template-rows: auto 1fr;
    place-items: baseline center;
    padding: 20px;
    gap: 20px;
    width: fit-content;
    background-color: grey;
    border-radius: 4px;
  }

  .panel {
    display: grid;
    align-items: center;
    align-content: flex-start;
    grid-template-columns: repeat(3, 1fr);
    font-size: 20px;
    width: 100%;
  }
  .smiley_ctn {
    justify-self: center;
  }
  .timer_ctn {
    width: 76px;
    justify-self: end;
  }
  .smiley_btn {
    font-size: 30px;
    border-radius: 4px;
    line-height: 1.5;
    cursor: pointer;
  }

  .grid {
    --border-width: 1px;
    display: grid;
    grid-template-rows: repeat(var(--rows), var(--cell-size));
    grid-template-columns: repeat(var(--cols), var(--cell-size));
    place-content: center;
    background-color: #333;
    color: #fff;
    width: calc(
      (var(--cols) * var(--cell-size)) + var(--border-width) * var(--cols)
    );
    height: calc(
      (var(--rows) * var(--cell-size)) + var(--border-width) * var(--rows)
    );
  }

  .cell {
    border: var(--border-width) solid #fff;
    overflow-wrap: break-word;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: grey;
    font-size: 20px;
  }

  .cell.gameover {
    pointer-events: none;
  }

  .cell:not(.clicked):hover {
    background-color: rgb(30 147 117 / 57%);
    cursor: pointer;
  }

  .cell.clicked {
    background-color: lightgrey;
  }

  .game_over_banner {
    color: white;
    width: 100%;
    text-align: center;
    letter-spacing: 1.3;
  }
  .lose_game {
    background-color: red;
  }
</style>
