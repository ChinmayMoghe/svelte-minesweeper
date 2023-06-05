<script lang="ts">

  enum CellType {
    empty,
    mine,
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

  
 const getMinIdx = (idx:number) => {
      if(idx > 0 ) {
        return idx - 1;
      } 
      return 0;
    };
    const getMaxIdx = (idx:number,maxLen:number) => {
      if(idx+1 > maxLen - 1) {
        return maxLen - 1;
      }
      return idx+1;
    };
    
    const getBounds = (row_idx:number,col_idx:number) => {
      return {
        row_min:getMinIdx(row_idx),
        col_min:getMinIdx(col_idx),
        row_max:getMaxIdx(row_idx,rows),
        col_max:getMaxIdx(col_idx,cols)
      }
    };

  const checkAdjacentCells = (bounds:{row_min:number,row_max:number,col_min:number,col_max:number},board:Array<Array<{text:string,row:number,col:number,type:CellType}>>) => {
    const {row_min,row_max,col_min,col_max} = bounds;
    let count = 0;
    for(let row_idx=row_min;row_idx<=row_max;row_idx++){
      for(let col_idx=col_min;col_idx<=col_max;col_idx++) {
        if(board[row_idx][col_idx].type === CellType.mine) {
          count +=1;
        }
      }
    }
    return count;
  };
   
  function annotate(boardWithMines:Array<Array<{text:string,row:number,col:number,type:CellType}>>) {
       for(let row_idx=0;row_idx < rows;row_idx++){
      for(let col_idx=0;col_idx < cols;col_idx++) {
         if(boardWithMines[row_idx][col_idx].type === CellType.empty) {
          const bounds = getBounds(row_idx,col_idx);
          let mineCount = checkAdjacentCells(bounds,boardWithMines);
          if(mineCount > 0) {
            boardWithMines[row_idx][col_idx].text = `${mineCount}`;
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
        if (minePositions.includes(`${row_idx}${col_idx}`)) {
          return { text: "💣", row: row_idx, col: col_idx,type:CellType.mine };
        } else {
          return { text: "", row: row_idx, col: col_idx,type:CellType.empty };
        }
      })
    );
    return boardWithMines;
  }
  let mines: number = 32;
  let rows: number = 13;
  let cols: number = 12;
  let minePositions = uniqueRandomIndices(rows, cols, mines);
  let board = annotate(createBoard(rows, cols, minePositions));
  let cellSize: string = "35px";

    enum CellClickStates {
    clicked,
    not_clicked,
  }


  const handleCellClick = (event: MouseEvent) => {
    if (event.target instanceof HTMLButtonElement) {
      console.log(event.target.dataset.row, event.target.dataset.col);
    }
  };
</script>

<div class="minesweeper_container">
  <div class="grid" style="--rows:{rows};--cols:{cols};--cell-size:{cellSize}">
    {#each board as rows}
      {#each rows as cell}
        <button
          on:click={handleCellClick}
          data-row={cell.row}
          data-col={cell.col}
          class="cell">{cell.text}</button
        >
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
</style>
