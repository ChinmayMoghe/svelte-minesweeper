<script lang="ts">
  const _noop = () => {};

  enum CellType {
    empty,
    mine,
    count,
    flag,
  }

  enum CellClickState {
    clicked,
    not_clicked,
  }

  enum CellSymbols {
    mine = "💣",
    flag = "🚩",
  }

  enum FlagState {
    flagged,
    not_flagged,
  }

  type Cell = {
    text: string;
    row: number;
    col: number;
    type: CellType;
    clicked: CellClickState;
    flagged: FlagState;
  };

  type Bound = {
    row_min: number;
    row_max: number;
    col_min: number;
    col_max: number;
  };

  enum ClickType {
    left = 0,
    right = 2,
  }

  function uniqueRandomIndices(
    row_count: number,
    col_count: number,
    range: number
  ) {
    const [lower_row, upper_row]: Array<number> = [0, row_count - 1];
    const [lower_col, upper_col]: Array<number> = [0, col_count - 1];
    const idxArr = [];
    while (idxArr.length !== range) {
      const rowIdx = Math.floor(
        Math.random() * (upper_row - lower_row + 1 + lower_row)
      );
      const colIdx = Math.floor(
        Math.random() * (upper_col - lower_col + 1 + lower_col)
      );
      idxArr.push(`${rowIdx}${colIdx}`);
    }
    return idxArr;
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

  const getBounds = (row_idx: number, col_idx: number) => {
    return {
      row_min: getMinIdx(row_idx),
      col_min: getMinIdx(col_idx),
      row_max: getMaxIdx(row_idx, rows),
      col_max: getMaxIdx(col_idx, cols),
    };
  };

  const checkAdjacentCells = (bounds: Bound, board: Array<Array<Cell>>) => {
    const { row_min, row_max, col_min, col_max } = bounds;
    let count = 0;
    for (let row_idx = row_min; row_idx <= row_max; row_idx++) {
      for (let col_idx = col_min; col_idx <= col_max; col_idx++) {
        if (board[row_idx][col_idx].type === CellType.mine) {
          count += 1;
        }
      }
    }
    return count;
  };

  function annotate(boardWithMines: Array<Array<Cell>>) {
    for (let row_idx = 0; row_idx < rows; row_idx++) {
      for (let col_idx = 0; col_idx < cols; col_idx++) {
        if (boardWithMines[row_idx][col_idx].type === CellType.empty) {
          const bounds = getBounds(row_idx, col_idx);
          let mineCount = checkAdjacentCells(bounds, boardWithMines);
          if (mineCount > 0) {
            boardWithMines[row_idx][col_idx].text = `${mineCount}`;
            boardWithMines[row_idx][col_idx].type = CellType.count;
          }
        }
      }
    }
    return boardWithMines;
  }

  function createBoard(
    rows: number,
    cols: number,
    minePositions: Array<string>
  ) {
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
        if (minePositions.includes(`${row_idx}${col_idx}`)) {
          cell.text = CellSymbols.mine;
          cell.type = CellType.mine;
        }
        return cell;
      })
    );
    return boardWithMines;
  }
  let mines: number = 46;
  let rows: number = 16;
  let cols: number = 30;
  let minePositions = uniqueRandomIndices(rows, cols, mines);
  let board = annotate(createBoard(rows, cols, minePositions));
  let cellSize: string = "40px";

  const clickEmptyCell = (row_idx: number, col_idx: number) => {
    // recursively click adjacent cells until:
    // 1. hit a boundary of mine counts - is it same as 3 ?
    // 2. cells are already clicked
    // 3. cells have mines - same as 1 maybe
    // 4. cells that are flagged - need to add a flag feature as well
    const { row_min, row_max, col_min, col_max } = getBounds(row_idx, col_idx);
    // loop over bounds to click each cell within the bounds
    for (let r_idx = row_min; r_idx <= row_max; r_idx++) {
      for (let c_idx = col_min; c_idx <= col_max; c_idx++) {
        const cell = board[r_idx][c_idx];
        if (
          [CellType.empty, CellType.count].includes(cell.type) &&
          cell.clicked === CellClickState.not_clicked
        ) {
          const cellElement = document.querySelector(
            `.cell[data-row='${r_idx}'][data-col='${c_idx}']`
          );
          setTimeout(() => {
            cellElement.dispatchEvent(new MouseEvent("mousedown"));
          });
        } else {
          break;
        }
      }
    }
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
      } else if (cell.flagged === FlagState.flagged) {
        board[row_idx][col_idx] = { ...cell, flagged: FlagState.not_flagged };
      } else {
        return;
      }
      switch (cell.type) {
        case CellType.mine:
          console.log("Game over!!! You lose mf!!!");
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
        board[row_idx][col_idx] = {
          ...cell,
          flagged:
            cell.flagged === FlagState.flagged
              ? FlagState.not_flagged
              : FlagState.flagged,
        };
      } else {
        return;
      }
    }
  };
</script>

<div class="minesweeper_container">
  <div class="grid" style="--rows:{rows};--cols:{cols};--cell-size:{cellSize}">
    {#each board as rows}
      {#each rows as cell}
        <button
          on:mousedown={cell.clicked === CellClickState.not_clicked
            ? handleCellClick
            : _noop}
          on:contextmenu|preventDefault
          data-row={cell.row}
          data-col={cell.col}
          class="cell"
          class:clicked={cell.clicked === CellClickState.clicked}
        >
          {#if cell.clicked === CellClickState.clicked && cell.flagged === FlagState.not_flagged}
            {cell.text}
          {:else if cell.flagged === FlagState.flagged}
            {CellSymbols.flag}
          {/if}
        </button>
      {/each}
    {/each}
  </div>
</div>

<style>
  .minesweeper_container {
    min-height: 100vh;
    background-color: green;
    display: grid;
    place-items: center;
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
  }

  .cell.clicked {
    background-color: lightgrey;
  }
</style>
