# 成员 A 核心接口

成员 A：js/board.js、js/history.js、js/game.js。成员 B 提供首页及样式；main.js、ui.js 已补充联调实现，effects.js 提供合成音效与静音控制。项目运行、手机操作、测试和协作说明见 README.md；以下记录核心接口，供 UI 集成。

浏览器使用 ES module 导入 game.js。initGame() 初始化两个随机棋子；move(direction) 接受 left/right/up/down；undo() 恢复上一次有效移动前的棋盘和分数；restart() 清空历史并重新初始化；getState() 返回独立快照；isGameOver() 返回是否胜利或失败。

状态为 {board, score, highestLevel, status, canUndo}，status 为 playing/won/over。棋盘为 4×4，0 表示空位，1–10 表示等级。相同等级每回合仅合并一次，最高 10 级，合并加新等级×100 分。有效移动后随机生成一个棋子（90% 一级、10% 二级）；无效移动不生成棋子、不记历史。达到十级胜利；无空位且无可合并相邻格时失败。撤销最多保留 50 步，不回放随机数序列。

运行 npm test（Node.js 22），无需安装依赖。本项目没有构建配置。首页已通过 main.js 和 ui.js 接入核心模块，支持键盘与屏幕按钮、撤销、重开和结束提示。请通过本地 HTTP 服务打开 index.html（例如 python -m http.server 8000），不要直接以 file:// 打开 ES module。
