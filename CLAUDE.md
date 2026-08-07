# Project: timezone-planner（世界时区会议规划器）

零构建静态站，三语（zh/en/de）。跟大多数 sibling 工具用 `style.css`/`script.js` 平铺结构不同，
这个仓库用的是 `css/style.css` + `js/app.js` + `js/i18n.js` 子目录结构，i18n 字典单独拆成了
`i18n.js` 一个文件，不是内嵌在主逻辑文件里——改 i18n 相关内容去 `js/i18n.js`，改交互逻辑去 `js/app.js`。

用户可以添加任意城市/时区做跨时区会议时间对比（标题举例 Beijing/London/Zurich/New York，
不是固定预设的城市列表，没有 `data.js`）。选择状态存 `localStorage`，key 是 `tzplanner_state_v1`。

## Commands
- 无构建/测试命令
- 本地预览：项目自带 `.claude/launch.json`（端口配置见该文件），不在共享的
  `C:\Users\junpi\.claude\.claude\launch.json` 里注册——这个仓库是例外

## 部署流程
- 改完直接 commit + push 到 `main`
- Commit 作者身份：`Junping Koch <junping.koch@gmail.com>`，仓库单独设置
- `ads.txt` 已补齐真实 publisher 行（之前审查时发现缺失，已修复）

## 持续维护
每次你需要重复纠正 Claude 同一件事三次以上，就把结论补进这个文件对应章节。
