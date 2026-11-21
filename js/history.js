
// history.js
// 使用栈保存历史游戏状态

export class HistoryStack {
    constructor(maxSize = 50) {
        this.data = [];
        if (!Number.isInteger(maxSize) || maxSize < 1) { throw new RangeError("maxSize must be a positive integer"); }
        this.maxSize = maxSize;
    }

    // 入栈
    push(state) {
        if (this.data.length >= this.maxSize) {
            this.data.shift();
        }

        this.data.push({
            board: state.board.map(row => [...row]),
            score: state.score
        });
    }

    // 出栈
    pop() {
        if (this.isEmpty()) return null;
        return this.data.pop();
    }

    // 判空
    isEmpty() {
        return this.data.length === 0;
    }

    // 清空
    clear() {
        this.data = [];
    }
}
