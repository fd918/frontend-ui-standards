# 标准日期与时间组件 · 1.0.0

## 资源和来源

所有路径相对本 Skill 根目录，适用于本机或复制到其他工具后的同一资源包：

- `assets/date-time/shared-date-range-picker.js` / `.css`：原生 JavaScript/CSS 日期组件，支持单日和日期范围。共享文件最早来自 2026-08-24 的经营看板日期筛选开发（提交 `feb9282a`），同批接入每日事项，随后经多个页面演进。本包保留提取时的原文件内容。
- `assets/date-time/shared-time-picker.js` / `.css`：从每日事项 `daily-work-dashboard.html` 的 `scheduleTimeRow`、`scheduleSummary`、`bindScheduleControls` 及配套样式提取。保留 HH:mm 输入、44px 输入高度、增删时间、星期选择和关闭计划语义；适配为独立 API、容器隔离样式和中文校验，增加单时刻模式及销毁接口。
- `assets/date-time/demo.html`：完全本地的演示，无业务请求、通知或真实数据。
- [component-provenance.json](component-provenance.json)：提取日期、来源提交和源文件 SHA256。包版本 1.0.0；日期文件的来源哈希可用于验证原样保留。

来源项目是原生网页看板。这里仅携带通用 UI 代码，不包含来源项目的服务、数据、账号、品牌或环境配置。时刻输入沿用原来的 HTML `input[type=time]`，输入框样式统一，系统弹出面板可能随浏览器/操作系统变化；不要宣称在所有系统上弹出面板像素一致。

## 新项目接入

将需要的 JS 和 CSS 从本包复制到目标项目的共享组件或静态资源目录，同时记录包版本、复制日期、所复制文件 SHA256 和必要适配。网站运行时仅依赖项目内文件，不引用本机用户目录。不因本包升级自动改变已有网站。

保持日期选择、日期范围和时刻选择各自职责；日期加时刻的需求可组合现有组件。React/Vue 等框架用生命周期包装 API，卸载前关闭日期浮层/销毁时刻实例；若使用 Shadow DOM、复杂多实例或现有全局样式冲突，先实测和说明适配，不能自行更换另一种选择器。

### 日期范围与单日

```html
<link rel="stylesheet" href="./shared-date-range-picker.css">
<script src="./shared-date-range-picker.js"></script>
<button id="range" type="button">选择日期范围</button>
<script>
const anchor = document.getElementById('range');
function dayInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const part = type => parts.find(value => value.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
anchor.onclick = () => window.YunzhanDateRangePicker.open(anchor, {
  title: '选择日期范围',
  baseDate: dayInZone(new Date(), 'Asia/Shanghai'),
  start: '2026-10-01', end: '2026-10-29',
  onApply: ({start, end}) => { anchor.textContent = `${start} 至 ${end}`; }
});
</script>
```

- 单日传 `mode:'single'`，选择后立即应用；范围模式先选开始，再选结束，点“应用”。默认快捷项点击后立即应用。
- 可选参数：`minDate`、`maxDate`、`baseDate`、`quickRanges`、`quickApply`、`monthSelect`、`container`、`layerId`、`onClose`、`onError`。日期格式 `YYYY-MM-DD`，接入方提供有效且有序的初始范围。
- 快捷项键为 `today/yesterday/week/last7/last30/last60/month/lastMonth`，按业务选择，不硬编码每个网站必须展示全部。
- 来源实现部分日期逻辑使用浏览器当地时间。跨时区业务必须显式传业务时区的 `baseDate`；如设置 `maxDate`，也要传 `baseDate`，避免把最新数据日当“今日”。保留原实现意味着日历“今日”标识仍按浏览器当地日期，在其他时区要求完全一致时需受测的兼容扩展。
- 组件默认挂到 body，且存在文档级 Escape/Tab 监听。嵌套模态窗、层级、焦点和日期边界需在目标页面验证；一次打开一个日期浮层，不多次加载同一脚本。

### 时刻与自动计划

```html
<link rel="stylesheet" href="./shared-time-picker.css">
<script src="./shared-time-picker.js"></script>
<div id="schedule"></div>
<script>
const control = StandardTimePicker.mount(document.getElementById('schedule'), {
  value: { enabled:false, weekdays:[1,2,3,4,5], times:['09:30'], timeZone:'Asia/Shanghai' }
});
// 用户点击保存时调用；校验失败抛出中文错误并在组件内显示。
// const payload = control.getValue(); await saveToYourApplication(payload);
// 编辑回填：control.setValue(payload);
// 卸载：control.destroy();
</script>
```

- 单时刻使用 `mode:'time'`，通过 `getValue({required:true}).times[0]` 获取必填时间；无需自动计划开关、星期和增删按钮。
- 计划模式 `getValue()` 返回 `{enabled,weekdays,times,timeZone}`；星期 0 为周日，时间去空、去重、升序，最多 48 项；启用时必须有星期和时间。
- 不默认启用任务。组件只展示和校验配置，不真正运行定时任务或发送请求。
- `onChange` 通知尚未保存的编辑值，不等于保存成功，不能在用户勾选启用时静默启动后台任务。`setValue`/初始化不触发该通知。
- 空的最后一行删除后保留输入框；添加后聚焦新输入并在支持时打开系统选择面板。不同容器可挂载不同实例；重复挂载同一容器会报错。

## 验收与维护

实际打开演示及目标页面，验证快捷范围、跨月、开始/结束、取消、Escape 和焦点恢复；时刻添加/删除、清空、编辑回填、重复去重、星期组合、关闭状态和保存错误。执行 `tests/components.test.cjs`，再执行 `tests/browser-check.cjs`（需要 Playwright 和可用浏览器），不能把语法检查当成交互验收。

保留个人确认版本；变更需提高包版本、记录原因和影响，并复验已有行为。不要随意重画样式或替换为其他组件库。来源系统不随提取包自动修改。
