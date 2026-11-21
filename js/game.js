
// game.js
// 奶蛙大进化核心游戏控制模块

import {
    createEmptyBoard,
    cloneBoard,
    spawnTile,
    moveBoard,
    hasMoves
} from "./board.js";

import { HistoryStack } from "./history.js";

let board = createEmptyBoard();
let score = 0;
let history = new HistoryStack();
let status = "playing";

// 初始化游戏
export function initGame() {
    board = createEmptyBoard();
    score = 0;
    history.clear();
    status = "playing";

    spawnTile(board);
    spawnTile(board);

    return getState();
}

// 玩家移动
export function move(direction) {
    if (status !== "playing") return getState();

    const result = moveBoard(board, direction);

    // 无效移动不生成新奶蛙，也不记录历史
    if (!result.changed) {
        return getState();
    }

    // 保存移动之前的状态
    history.push({
        board: board,
        score: score
    });

    // 更新棋盘
    board = result.board;

    // 更新分数
    score += result.scoreGain;

    // 生成新奶蛙
    spawnTile(board);

    // 判断是否达到终极等级
    if (board.some(row => row.includes(10))) {
        status = "won";
    }
    // 判断是否无法继续移动
    else if (!hasMoves(board)) {
        status = "over";
    }

    return getState();
}

// 撤销
export function undo() {
    if (history.isEmpty()) {
        return getState();
    }

    const previous = history.pop();

    board = cloneBoard(previous.board);
    score = previous.score;
    status = "playing";

    return getState();
}

// 重新开始
export function restart() {
    return initGame();
}

// 获取游戏状态
export function getState() {
    return {
        board: cloneBoard(board),
        score: score,
        highestLevel: Math.max(...board.flat()),
        status: status,
        canUndo: !history.isEmpty()
    };
}

// 判断游戏是否结束
export function isGameOver() {
    return status === "over" || status === "won";
}
