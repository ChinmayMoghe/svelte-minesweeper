export enum CellType {
  empty,
  mine,
  count,
  flag,
}

export enum CellClickState {
  clicked,
  not_clicked,
}
export enum CellSymbols {
  mine = "💣",
  flag = "🚩",
  empty = "",
  explode = "💥",
}

export enum FlagState {
  flagged,
  not_flagged,
}

export type Cell = {
  text: string;
  row: number;
  col: number;
  type: CellType;
  clicked: CellClickState;
  flagged: FlagState;
};

export type Bound = {
  row_min: number;
  row_max: number;
  col_min: number;
  col_max: number;
};

export enum ClickType {
  left = 0,
  right = 2,
}

export enum GameState {
  on,
  win,
  lose,
}

export type GameConfig = {
  rows: number;
  cols: number;
  mines: number;
  cellSize: string;
};

export type GameModes = "baby" | "boy" | "expert" | "gambler";

export const GameDifficulty: Record<GameModes, GameConfig> = {
  baby: { rows: 5, cols: 5, mines: 2, cellSize: "40px" }, // 8% board covered with mines
  boy: { rows: 9, cols: 9, mines: 10, cellSize: "30px" }, // 12% covered with mines
  expert: { rows: 16, cols: 16, mines: 40, cellSize: "27px" }, // 15% covered with mines
  gambler: { rows: 16, cols: 30, mines: 120, cellSize: "25px" }, // 25% covered with mines - u need to be only lucky to beat this
};
