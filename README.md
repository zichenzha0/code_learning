# 🐍 Python 游乐场 (Python Playground)

用**玩游戏**的方式学 Python。每个知识点都是一个小关卡，你在浏览器里写**真正的 Python**（不是假的模拟器 —— 用 Pyodide 把 CPython 编译成 WebAssembly 跑在你的浏览器里），点「运行」立刻看到结果，点「提交检查」过关。

- ✅ 阶梯式：从 `print` 一路爬到 `函数`，关卡按难度解锁
- ✅ 游戏化：回声鸟、魔药、守门人、火箭倒计时、咒语工厂…
- ✅ 进度自动保存（存在你浏览器里）
- ✅ 纯前端，零后端 —— 部署到 Vercel 完全免费

---

## 🛠 在 Cursor 里跑起来（3 步）

1. **打开项目**：把这个文件夹拖进 Cursor（或 `File → Open Folder`）。
2. **装依赖**：在 Cursor 底部打开终端（`Ctrl/Cmd + \``），运行：
   ```bash
   npm install
   ```
3. **启动**：
   ```bash
   npm run dev
   ```
   终端会给一个网址（通常 http://localhost:5173），按住 Cmd/Ctrl 点击就能在浏览器打开。
   > 第一次进去，Python 引擎要加载几秒，控制台会显示「正在启动」，属正常现象。

需要 Node.js（18+）。没装的话去 https://nodejs.org 下载 LTS 版即可。

---

## 🚀 部署到 Vercel（给自己长期用）

最顺的路线是 **GitHub → Vercel**：

1. 在 Cursor 里把项目推到一个 GitHub 仓库（Cursor 左侧的 Source Control 面板，或终端里 `git init` → 提交 → push）。
2. 打开 https://vercel.com ，用 GitHub 登录。
3. `Add New… → Project`，选中你这个仓库。
4. Vercel 会自动识别这是 **Vite** 项目，构建命令 `npm run build`、输出目录 `dist` 都已自动填好 —— 直接点 **Deploy**。
5. 一分钟后给你一个 `xxx.vercel.app` 网址，手机电脑都能打开，随时随地学。

> 也可以用命令行：`npm i -g vercel`，然后在项目里运行 `vercel`，跟着提示走。

---

## ➕ 自己加关卡（重点！）

所有课程都在 **`src/lessons.js`** 里，一个关卡就是一个对象。复制一个、改改内容就有新关卡了：

```js
{
  id: 'l14',                 // 唯一编号，往后排
  world: 'w5',               // 属于哪个世界（见文件顶部 WORLDS）
  emoji: '🎲', title: '掷骰子',
  story: '一句有趣的情境……',
  learn: '这一关要教的知识点……',
  task: '让玩家做什么……',
  starter: '# 起始代码\n',

  // 二选一的过关判定：
  expect: '6',                                  // ① 期望的输出（适合"看结果"的关卡）
  // test: 'assert roll() in range(1,7)\nprint("ok")', // ② 测试代码（适合"写函数"的关卡）

  hints: ['提示1', '提示2', '直接给答案'],
  reward: '过关后的鼓励语 🎉',
}
```

想加新「世界」就在 `WORLDS` 数组里加一项（`id / name / emoji / color`），关卡的 `world` 指过去即可。

---

## 📁 文件结构

```
index.html              加载 Pyodide 和字体
src/
  main.jsx              入口
  App.jsx               总调度（地图 ↔ 关卡）
  lessons.js            ⭐ 课程数据，加关卡改这里
  usePyodide.js         加载 Python、运行并判分的"裁判"
  useProgress.js        进度存到 localStorage
  styles.css            全部样式
  components/
    LessonMap.jsx        关卡地图
    GameScreen.jsx       游戏界面（编辑器 + 控制台）
    CodeEditor.jsx       带缩进的代码编辑框
    Confetti.jsx         过关撒花
```

玩得开心，慢慢来，但一直走 💛
