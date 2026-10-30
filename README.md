# 网站与浏览器插件开发规范

发布包版本：1.3.0；前端 Skill：1.0.3；后端 Skill：1.0.0；架构 Skill：1.0.0；插件 Skill：1.0.0；日期时间组件：1.0.0。四个独立 Skill 按实际任务使用。

## 新电脑与其他工具

[打开可复制的接入指令](SETUP-PROMPTS.txt)：包含 GPT／Codex、其他 AI 编码工具两种接入方式，以及新对话验证句。安装四个完整文件夹；工具不支持 Skill 时使用它实际支持的规则入口，不能假定所有工具都自动读取 `AGENTS.md`。普通聊天环境不能凭一段提示词获得本机文件权限。

## 按实际场景使用

规则不是需要全部实现的功能清单。先判断本次任务涉及什么，再执行适用条款；不能为了满足规范而新增数据库、登录、缓存、队列或后台服务。项目有某项能力，也不代表每次无关改动都要检查或修改它。

| Skill | 何时使用 |
| --- | --- |
| [前端规范](frontend-ui-standards/SKILL.md) | 创建或修改 PC 页面和交互；日期、表格、表单等仅在实际涉及时启用 |
| [后端、数据复用与部署规范](backend-data-deployment-standards/SKILL.md) | 涉及接口、共享数据、持久化、后台任务或部署；先按场景表选择规则 |
| [项目架构经验规范](project-architecture-standards/SKILL.md) | 规划新项目，或调整跨模块职责、数据流、共享边界、服务与环境结构；不因局部修改重做架构 |
| [浏览器插件规范](browser-extension-standards/SKILL.md) | 插件开发先执行通用要求，按需选择采集、登录、监控、恢复及回填；不默认为全部插件增加这些功能 |

例如：静态介绍页不需要数据库规则；读取已有接口不必再建数据库；改数据库结构才执行迁移规则；改静态文案不需要数据库迁移。确实涉及但未验证的检查，不能标成“不适用”。

插件示例：只做侧栏展示不启用账号场景；主动填写账号不启用失效监控；仅监控过期并提醒不自动登录；只有明确需要自动恢复或认证回填时才读取对应章节。

## 当前范围

前端规范默认只做 PC 网站开发与验收，支持电脑浏览器、鼠标、键盘、桌面窗口变化及缩放。手机专用布局、移动端断点和触屏验收暂不纳入；用户明确要求后另行安排。组件代码和样式保持 1.0.0，已有窄屏样式保留。

## 中文阅读与英文对照

- [中文完整规范](frontend-ui-standards/SKILL.md)：供开发工具执行，也方便人工逐项检查。
- [英文原文对照](frontend-ui-standards/references/english-reference.md)：保留上一版英文正文，供检查翻译有无遗漏；执行以中文规范为准。
- [具体界面规则](frontend-ui-standards/references/ui-rules.md)与[组件来源、用法](frontend-ui-standards/references/date-time-components.md)也使用中文。

1.0.1 将原有 11 个章节的全部要求翻译为中文，保留必要英文术语和原文对照；组件代码、样式和行为保持 1.0.0。MIT 许可证保留原文。

## 内容

- `frontend-ui-standards/SKILL.md`：Agent Skills 格式入口。
- `frontend-ui-standards/references/ui-rules.md`：页面空间、查询状态、表格、筛选、保存和弹窗标准。
- `frontend-ui-standards/references/date-time-components.md`：来源、接入示例、版本及已知边界。
- `frontend-ui-standards/assets/date-time/`：日期/范围与时刻选择的原生 JS、CSS 和演示页。
- `frontend-ui-standards/tests/`：组件逻辑测试及浏览器交互检查。
- `backend-data-deployment-standards/SKILL.md`：按场景启用的后端、数据复用、存储、任务和发布规则。
- `project-architecture-standards/SKILL.md`：模块职责、数据流、权威来源、隔离与兼容演进。
- `browser-extension-standards/SKILL.md`：插件通用规则和场景选择表；账号、监控、恢复、回填分别启用。
- `SETUP-PROMPTS.txt`：新电脑安装、其他工具接入及新对话验证指令。

## 安装与使用

**Codex 项目安装：** 将本仓库的 `frontend-ui-standards` 整个文件夹复制到目标项目的 `.agents/skills/frontend-ui-standards/`，保留资源与引用的相对路径。在该项目的 `AGENTS.md` 中加入下面的入口。需要让所有本机项目使用时，将该文件夹安装到当前 Codex 配置实际使用的个人 Skill 目录，并在个人全局规则中加入入口。

后端、共享数据或部署任务可按同样方式安装 `backend-data-deployment-standards`；架构任务可安装 `project-architecture-standards`；插件任务可安装 `browser-extension-standards`。四个 Skill 独立使用，只有任务相关时才加载，不要求纯静态页面启用后端规范。

**其他支持 Agent Skills 的开发工具：** 按该工具的 Skill 目录规则安装整个文件夹。`SKILL.md` 与 JS/CSS 不依赖 Codex 专用接口；`agents/openai.yaml` 是可选的 Codex 界面元数据，其他工具可忽略。尚未对每种工具做安装验收，不保证任意工具自动识别。

**没有 Skill 加载功能的工具：** 在项目开发规则中明确要求先读取本仓库的 `SKILL.md`，或在新对话中直接指定该文件。将组件复制到网站自身目录后使用，不把远程原始文件地址当生产依赖。

建议添加的规则入口：

```text
创建或修改网站、看板、后台页面时，先读取并执行 frontend-ui-standards Skill
及 references/ui-rules.md。涉及日期、日期范围或时刻选择时，读取
references/date-time-components.md，使用 assets/date-time/ 的对应组件。
保留已确认的外观和交互；说明采用的组件版本。资源缺失或存在明确冲突时，
说明情况，不得假称已使用标准组件，不修改无关页面。
后端、共享数据、持久化、后台任务或部署工作先读取
backend-data-deployment-standards，按本次实际场景启用规则；不增加无关功能。
新项目规划或跨模块职责、数据流、服务边界变化时读取
project-architecture-standards；局部修改不触发全项目架构设计。
浏览器扩展开发读取 browser-extension-standards，通用与条件场景分别执行，
不默认增加监控、自动登录或认证回填。
```

新对话可用这句话检查规则是否加载：

> 先不要改代码。请说明实际读取的前端、后端、架构和插件规范及其版本、组件位置，以及本次任务适用和不适用的部分。

## 预览与验证

直接用浏览器打开 `frontend-ui-standards/assets/date-time/demo.html`。演示使用本地静态资源，不请求业务接口、不执行自动任务、不保存真实设置。

macOS/Linux 终端或 Windows PowerShell：先进入本仓库的 `frontend-ui-standards` 文件夹，再执行以下完整命令：

```sh
node --test tests/components.test.cjs
```

用途：检查时间校验、去重、关闭计划、边界和来源哈希。正常结果为 6 项通过、0 失败；失败时检查文件是否完整及 Node.js 是否可用。

浏览器交互检查命令（同一目录）：

```sh
node tests/browser-check.cjs
```

用途：检查日期交互、时间增删回填、焦点及不同宽度。需要测试环境已安装 Playwright 和 Chromium；浏览器路径也可通过 `CHROME_PATH` 指定，或以 `PLAYWRIGHT_CHANNEL` 选择已安装通道。正常输出包含 `"passed": true`；无法加载 Playwright 或启动浏览器时，先检查测试环境，不能据此宣称组件功能失败或已通过。

## 来源与升级

组件来源记录在 `frontend-ui-standards/references/component-provenance.json`。日期组件为来源版本原样副本；时刻组件从已使用的自动采集设置中提取为独立控件。它们不包含原业务的服务、数据、账号或任务执行器。

日期组件的部分逻辑使用浏览器当地时间，跨时区业务接入前须阅读组件说明并显式设置业务基准日期。时刻输入沿用 HTML `input[type=time]`，系统选择面板随操作系统和浏览器变化。

各项目使用固定组件版本并记录复制文件哈希；中央包更新不自动改变既有网站。React/Vue 等框架需按组件文档做生命周期接入。确有能力缺口时进行兼容扩展并重新验证，不自行换掉已确认的交互。

MIT 许可，见 `LICENSE`。发布包只包含本仓库文件，不包含安装者的全局规则或本机配置。
