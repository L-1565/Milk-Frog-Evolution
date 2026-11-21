# 成员 A 核心接口

成员 A：js/board.js、js/history.js、js/game.js。保留上传包原有实现；成员 B 的 ui.js、effects.js、main.js 以及首页与样式均未改动。README 当前为空，仓库未提供更详细分工约定；以下记录现有接口，供 UI 集成。

浏览器使用 ES module 导入 game.js。initGame() 初始化两个随机棋子；move(direction) 接受 left/right/up/down；undo() 恢复上一次有效移动前的棋盘和分数；restart() 清空历史并重新初始化；getState() 返回独立快照；isGameOver() 返回是否胜利或失败。

状态为 {board, score, highestLevel, status, canUndo}，status 为 playing/won/over。棋盘为 4×4，0 表示空位，1–10 表示等级。相同等级每回合仅合并一次，最高 10 级，合并加新等级×100 分。有效移动后随机生成一个棋子（90% 一级、10% 二级）；无效移动不生成棋子、不记历史。达到十级胜利；无空位且无可合并相邻格时失败。撤销最多保留 50 步，不回放随机数序列。

运行 npm test（Node.js 22），无需安装依赖。本项目没有构建配置。首页尚未接入游戏模块，完整 UI 与交互仍需成员 B 集成。
