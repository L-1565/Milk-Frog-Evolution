
// board.js
// 奶蛙大进化：棋盘与移动算法

const SIZE = 4;

// 创建空棋盘
export function createEmptyBoard() {
    return Array.from(
        { length: SIZE },
        () => Array(SIZE).fill(0)
    );
}

// 深拷贝棋盘
export function cloneBoard(board) {
    return board.map(row => [...row]);
}

// 随机生成一个新奶蛙
export function spawnTile(board) {
    const empty = [];

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (board[i][j] === 0) {
                empty.push([i, j]);
            }
        }
    }

    if (empty.length === 0) return false;

    const index = Math.floor(Math.random() * empty.length);
    const [row, col] = empty[index];

    // 90%生成LV.1，10%生成LV.2
    board[row][col] = Math.random() < 0.9 ? 1 : 2;

    return true;
}

// 处理一行或一列：压缩、合并、补零
function processLine(line) {
    // 去除空格
    let arr = line.filter(value => value !== 0);

    let scoreGain = 0;
    let mergeLevels = [];

    // 相邻且等级相同的奶蛙合并
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1] && arr[i] < 10) {
            arr[i]++;

            // 每次合成增加分数
            scoreGain += arr[i] * 100;
            mergeLevels.push(arr[i]);

            // 后一个奶蛙消失
            arr.splice(i + 1, 1);
        }
    }

    // 补充空格
    while (arr.length < SIZE) {
        arr.push(0);
    }

    return { line: arr, scoreGain, mergeLevels };
}

// 获取棋盘中的一行或一列
function getLine(board, index, direction) {
    if (direction === "left" || direction === "right") {
        return [...board[index]];
    }

    return board.map(row => row[index]);
}

// 将处理后的行或列写回棋盘
function setLine(board, index, direction, line) {
    if (direction === "left" || direction === "right") {
        board[index] = line;
    } else {
        for (let i = 0; i < SIZE; i++) {
            board[i][index] = line[i];
        }
    }
}

// 判断两个棋盘是否相同
function boardsEqual(a, b) {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (a[i][j] !== b[i][j]) {
                return false;
            }
        }
    }

    return true;
}

// 移动棋盘
export function moveBoard(board, direction) {
    if (!["left", "right", "up", "down"].includes(direction)) {
        return {
            board: cloneBoard(board),
            changed: false,
            scoreGain: 0,
            mergeLevels: []
        };
    }

    const newBoard = cloneBoard(board);
    let totalScore = 0;
    let allMergeLevels = [];

    for (let i = 0; i < SIZE; i++) {
        let line = getLine(newBoard, i, direction);

        // 向右或向下时，反转处理方向
        if (direction === "right" || direction === "down") {
            line.reverse();
        }

        const result = processLine(line);

        line = result.line;

        if (direction === "right" || direction === "down") {
            line.reverse();
        }

        setLine(newBoard, i, direction, line);

        totalScore += result.scoreGain;
        allMergeLevels.push(...result.mergeLevels);
    }

    return {
        board: newBoard,
        changed: !boardsEqual(board, newBoard),
        scoreGain: totalScore,
        mergeLevels: allMergeLevels
    };
}

// 判断游戏是否结束
export function hasMoves(board) {
    // 还有空格，可以移动
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (board[i][j] === 0) return true;
        }
    }

    // 检查相邻格子是否可以合并
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (j + 1 < SIZE &&
                board[i][j] === board[i][j + 1] &&
                board[i][j] !== 0 &&
                board[i][j] < 10) {
                return true;
            }

            if (i + 1 < SIZE &&
                board[i][j] === board[i + 1][j] &&
                board[i][j] !== 0 &&
                board[i][j] < 10) {
                return true;
            }
        }
    }

    return false;
}
