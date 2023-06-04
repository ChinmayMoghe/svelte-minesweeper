<script lang="ts">
function uniqueRandomIndices(row_count:number,col_count:number,range:number) {
    const [lower_row,upper_row]:Array<number> = [0,row_count-1];
      const [lower_col, upper_col]:Array<number> = [0,col_count - 1];
      const idxArr = [];
      while(idxArr.length !== range) {
        const rowIdx = Math.floor(Math.random()*((upper_row - lower_row + 1) + lower_row));
        const colIdx = Math.floor(Math.random()*((upper_col - lower_col + 1) + lower_col));
        idxArr.push(`${rowIdx}${colIdx}`);
      }
      return idxArr;
};
  let mines: number = 32;
  let rows: number = 13;
  let cols: number = 12;
  let minePositions = uniqueRandomIndices(rows,cols,mines);
  let board = Array.from({length:rows},(_,row_idx)=>Array.from({length:cols},(_,col_idx)=>{
    if(minePositions.includes(`${row_idx}${col_idx}`)) {
      return '💣';
    } else {
      return 0;
    }
  }));
  let cellSize: string = "35px";
  enum CellClickStates {
    clicked,
    not_clicked,
  };

  enum CellType {
    empty,
    mine,
    number
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
  	{#each rows as col}
    	<div class="cell">{col}</div>
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
