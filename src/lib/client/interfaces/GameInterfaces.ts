export enum CellType {
	empty = 0,
	mine = 1,
	count = 2,
}

export enum CellClickState {
	clicked = 0,
	not_clicked = 1,
}
export enum CellSymbols {
	mine = "💣",
	flag = "🚩",
	empty = "",
	explode = "💥",
}

export enum FlagState {
	flagged = 0,
	not_flagged = 1,
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
	on = 0,
	win = 1,
	lose = 2,
}

export type GameConfig = {
	rows: number;
	cols: number;
	mines: number;
	cellSize: string;
};

export type GameModes = "baby" | "normal" | "expert" | "cheat with an AI";

export const GameDifficulty: Record<GameModes, GameConfig> = {
	baby: { rows: 5, cols: 5, mines: 2, cellSize: "40px" }, // 8% board covered with mines
	normal: { rows: 9, cols: 9, mines: 10, cellSize: "30px" }, // 12% covered with mines
	expert: { rows: 16, cols: 16, mines: 40, cellSize: "27px" }, // 15% covered with mines
	"cheat with an AI": { rows: 16, cols: 46, mines: 180, cellSize: "25px" }, // 25% covered with mines - u need to be only lucky to beat this
};
