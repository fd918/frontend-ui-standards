# 英文对照（English reference）

此文件保存 1.0.0 的英文正文，供人工逐节核对中文翻译是否遗漏；执行规则以 [当前中文 SKILL.md](../SKILL.md) 为准。自 1.0.2 起默认仅 PC，以下英文中的手机相关内容仅作历史对照，不属于当前开发或验收范围。技术资源路径以 Skill 根目录为基准，文档链接已适配本文件位置。

# Frontend UI Standards

Apply this skill to implementation work that creates or changes frontend pages and UI behavior. It governs component reuse, engineering consistency, dates and time, filters, tables, scrolling and overflow, pagination, forms, dialogs, buttons, loading/empty/error states, responsive behavior, mobile adaptation, shared-component extraction, and project design-system maintenance.

The goal is a UI that fits the existing project, works across relevant viewport sizes and input methods, and remains maintainable. Do not invent a new visual direction unless the user asks for one.

## Confirmed personal standards and bundled components

Read [references/ui-rules.md](ui-rules.md) for applicable page implementation work. These are confirmed personal defaults, including efficient content width and preserving previous results while visibly querying. Do not treat successful empty results as errors or leave old results under new query labels.

Whenever a task involves choosing a date, date range, or time of day, also read [references/date-time-components.md](date-time-components.md) and use the corresponding JS/CSS in `assets/date-time/`. Copy the pinned files into the target project, record their package version and hashes, and adapt the integration to the framework while preserving the approved interaction and appearance. Start by stating the selected component/version and relevant rules. Do not silently substitute the host project's component library for these approved controls. If explicit project requirements conflict or required functionality is absent, explain the concrete conflict/gap and follow the user's instruction; do not rewrite unrelated existing controls.

The demo is `assets/date-time/demo.html`. Source revision, extraction date and source hashes are in [references/component-provenance.json](component-provenance.json). This skill is self-contained and must not depend on the original project directory or this computer's absolute paths. No component schedules jobs, saves application data, or makes network requests by itself.

## Inspect before changing code

Before implementation, establish the project's actual conventions and available assets. Read or inspect, when present and relevant:

- project-level `AGENTS.md` and `README.md`;
- `package.json` or the equivalent dependency/build configuration;
- the frontend framework and UI component library in use;
- shared component, layout, utility, formatting, theme, icon, font, and brand-asset directories;
- existing pages with behavior similar to the requested change;
- `docs/DESIGN_SYSTEM.md` and `design-system/MASTER.md`.

Also identify the available test, build, type-check, lint, and run commands and check the current working-tree state. Preserve unrelated user changes.

Treat design-system documents as follows:

- If only `design-system/MASTER.md` exists, use it as the canonical source and do not create a duplicate `docs/DESIGN_SYSTEM.md`.
- If only `docs/DESIGN_SYSTEM.md` exists, use it as the canonical source.
- If both exist, inspect both for duplication or conflict before editing. Do not maintain the same rule in two places; default to `design-system/MASTER.md` as the maintenance target unless the project explicitly identifies another canonical source.
- Resolve stale documentation against current code and confirmed project behavior rather than assuming either document is current.

Before editing, state briefly what will change, which files are expected to change, why the approach fits the project, likely effects on existing behavior, and how success will be verified. For small, low-risk tasks this may be one concise update.

## Reuse before creating

Search the project for existing implementations of:

- date, date-range, and time pickers;
- filter bars;
- data tables, pagination, dialogs, buttons, and page-layout containers;
- loading, empty, error, no-result, and permission-denied states;
- logos, icons, fonts, themes, and brand assets;
- formatting functions and other UI-related utilities.

For dates and times, use the approved bundled components above. For other UI behavior, reuse a suitable existing component directly. If it is close but insufficient, prefer the smallest backward-compatible parameter or behavior extension over copying similar code.

Create a new similar component only when the existing component cannot meet the requirement, extending it would break many consumers, the business role is materially different, or reuse would create clear coupling or complexity. Explain the concrete reason before adding it. When a second page needs the same non-trivial UI behavior, extract or reuse a shared component instead of duplicating the implementation.

## Dates and time

- Use the approved bundled date/time components and their documented integration APIs; consult existing project wrappers before adding another wrapper.
- Keep date selection, date-range selection, and time selection as distinct responsibilities; combine them only when the business interaction genuinely requires it.
- Confirm and keep explicit the display format, API format, stored format, and timezone. Do not silently treat local time, UTC, and timezone-free dates as interchangeable.
- Use the project's established date format across pages unless a documented business rule requires a different one.
- Verify both create and edit flows, including parsing and correct value restoration on edit.
- Invalid or unsupported values need a clear Chinese message appropriate to the field and user action.
- Preserve the user's approved date/time controls across projects. Adapt unrelated page branding, controls, and layout to each project; this preference does not require introducing a component library or replacing unrelated UI.

## Tables and long lists

Choose table behavior from actual content and interaction needs:

- Do not add sticky headers to a simple short table by default. Use them when users must keep column meaning visible while scanning long content.
- For wide tables, fix only genuinely important identity or action columns when helpful.
- Contain horizontal overflow inside the table region; the table must not create a page-level horizontal scrollbar.
- After fixing columns or headers, check widths, overlap, stacking order, alignment, scroll synchronization, and mobile operability.
- Give every column a purposeful width or sizing strategy. Keep numeric columns consistently aligned and action columns at a stable width.
- Let ordinary prose wrap when readable. Identifiers such as order numbers, filenames, and user IDs may truncate only when the user can reveal or copy the complete value, for example with a tooltip, expandable cell, details view, or accessible label.
- Provide distinct handling for loading, no data, request failure, filter with no results, and insufficient permission. Do not render misleading zero or empty content for an error.
- For long datasets choose pagination, virtual scrolling, or progressive loading based on scale and interaction needs. Do not render the entire dataset unconditionally.

## Overflow and scrolling

- Prefer wrapping for normal text.
- Truncate long identifiers or filenames only with a way to access the full value.
- Put code, logs, and other whitespace-sensitive content in their own scroll container.
- In dialogs with long content, scroll only the body so the title and actions remain available.
- Prevent meaningless page-level horizontal scrolling.
- Do not solve mobile layout problems by compressing text to an unreadable size.
- Re-check truncation and wrapping when container width changes; do not rely on a single desktop width.

## Forms, dialogs, and controls

- Keep the same business field's label, value format, validation, and error wording consistent across create, edit, and filter contexts, unless the context requires a documented difference.
- Make required fields, validation errors, disabled states, submission progress, and save success/failure feedback unambiguous.
- Describe the concrete consequence of a destructive action; a generic “确定吗” is not sufficient.
- Keep dialogs within the viewport. When content is long, preserve access to the title and action buttons.
- Give icon-only buttons a clear Chinese accessible name using the framework's supported labeling mechanism.
- Reuse the project's button hierarchy and state patterns instead of creating page-specific variants.

## Responsive behavior and accessibility

Validate at the viewport widths relevant to the project, including desktop and mobile when supported. At minimum confirm:

- no meaningless horizontal page scrolling;
- primary controls are keyboard-operable and have a clearly visible focus state;
- form controls have explicit, programmatically associated labels;
- color is not the only indication of status or error;
- mobile tap targets remain usable and controls do not overlap;
- enlarged text does not hide or discard core content or actions;
- loading, empty, error, no-result, permission, and disabled states are represented as applicable;
- text is not incorrectly clipped as containers resize.

Use responsive layout changes, internal scrolling, wrapping, progressive disclosure, or an appropriate mobile representation according to the content. Do not preserve a desktop table or dialog layout at the expense of mobile operability.

## Maintain the project design system

When implementation confirms stable shared components or durable UI rules, update one canonical design-system document:

1. update `design-system/MASTER.md` when it exists and is canonical;
2. otherwise update `docs/DESIGN_SYSTEM.md` when it exists;
3. if neither exists and this is a medium or complex frontend project, create a minimal `docs/DESIGN_SYSTEM.md`;
4. for a simple or one-off project, do not create a design-system document solely for formality.

Record only verified project facts that will help later work, such as:

- current frontend stack and UI component library;
- confirmed logo and brand-asset paths;
- shared component names and exact paths;
- date/time display, API, storage, and timezone conventions;
- table scrolling and sticky-column/header rules;
- page layout and responsive behavior;
- stable interaction conventions.

Never invent component or asset paths, aspirational standards, or rules not yet adopted by the project. Avoid duplicating the same rule across both design-system documents.

## Verification and completion

Run the checks that the project actually supports and that are relevant to the change. Prefer, in order:

1. existing automated tests;
2. build;
3. type checking;
4. lint;
5. browser validation of the main flow;
6. desktop and mobile viewport checks;
7. focused checks for table scrolling, sticky headers/columns, overflow, create/edit/save, and value restoration.

Exercise the states changed by the task, not only the default happy path. Report the commands or flows run and their actual results. If a check cannot be run, state why and give the shortest manual verification path. Do not claim the implementation is complete, fixed, or working without fresh evidence.

## Boundaries with other skills

- `ui-ux-pro-max`, when available and relevant, supplies visual direction such as composition, color, typography, layout exploration, and design-system suggestions. This skill applies the engineering constraints and project conventions; do not repeat visual ideation already completed there.
- `web-design-guidelines`, when available and requested for review, performs the post-implementation UI, UX, and accessibility audit. This skill handles implementation-time consistency and verification; do not duplicate a completed audit.
- When a task needs both, use each only for its distinct phase and preserve the user's requested scope.
