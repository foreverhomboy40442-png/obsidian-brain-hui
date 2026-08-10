---
para: system
type: 技能定義索引
status: active
summary: 技能系統總索引——分為「工作流技能」與「能力技能」
---

# 技能系統

> 技能是預定義的複雜工作流或能力說明
> 用一個命令或自然語言觸發，AI 按預設流程執行
> 模型越強，技能執行質量越高

## 兩類技能

| 類型 | 結構 | 觸發方式 | 範例 |
|------|------|---------|------|
| **工作流技能** | `<name>/_index.md` 或 `.claude/commands/<name>.md` | `/<name>` 命令或關鍵字 | `/journal`、`/intake` |
| **能力技能** | `<name>/SKILL.md` | 自然語言觸發（Anthropic Skills API 規格） | `pdf`、`pptx`、`bazi` |

> 兩類共用同一目錄結構 `System/skills/<name>/`，但檔名不同。

---

## 工作流技能（內建 `/xxx` 命令）

### 核心技能

- `/journal` — `/journal` 或「建立日誌」「今日日記」
- `/agents` — `/agents`、`/agents new`、`/agents {NAME}`、`/agents use {NAME}`
- `/intake` — `/intake` 或「歸檔」
- `/maintain` — `/maintain` 或「維護」
- `/digest` — `/digest` 或「整理」
- `/writing` — `/writing` 或「寫作」
- `/reflect` — `/reflect` 或「覆盤」
- `/to-md` — `/to-md <路徑>` 或「轉成 md」（PDF／PPTX／DOCX／XLSX → Obsidian 筆記）

### 安全與偵錯技能

- `/cso` — `/cso`、`/cso --comprehensive`、「安全審計」、「漏洞掃描」、「威脅模型」
- `/investigate` — `/investigate`、「Debug」、「為什麼壞掉」、「根因分析」、「RCA」

### 基礎設施技能

- `/netbox` — `/netbox [查詢]` 或「netbox 查 IP」「netbox 查設備」
- `/garage` — `/garage [操作]` 或「garage 列出 bucket」「garage 上傳」
- `/scrape` — `/scrape <url>` 或「幫我爬 [URL]」「wagodanz 抓這個」
- `/k8s` — `/k8s [操作]` 或「查 pod」「查 namespace 狀態」
- `/mem0` — `/mem0 [操作]`、「記住這個」、「回憶」、「搜尋記憶」

### 簡報與溝通技能

- `/slides` — `/slides <主題>` 或「幫我做簡報」「用金字塔原理整理」「出 pitch deck」「SBIR 簡報」

### 業務應用技能

- `/wagodanz` — `/wagodanz [子命令]` 或「wagodanz scrape 狀態」「有幾個 job 失敗」「重試 scrape」
- `/pm` — Project Metadata Manager：更新或建立 project `_index.md`，統一 metadata（repos、status、program、links）

---

## 能力技能（自然語言觸發）

> 來自 Anthropic Skills API（`SKILL.md` 規格）。Claude 會在符合描述的場景自動載入。

### 文件與資料處理

- [`pdf`](skills/pdf/SKILL.md) — Use this skill whenever the user wants to do anything with PDF files
- [`pptx`](skills/pptx/SKILL.md) — Use this skill any time a `.pptx` file is involved in any way — as input, output, or both
- [`docx`](skills/docx/SKILL.md) — Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (`.docx`)
- [`xlsx`](skills/xlsx/SKILL.md) — Use this skill any time a spreadsheet file is the primary input or output

### 視覺設計

- [`canvas-design`](skills/canvas-design/SKILL.md) — Create beautiful visual art in `.png` and `.pdf` documents using design philosophy
- [`frontend-design`](skills/frontend-design/SKILL.md) — Create distinctive, production-grade frontend interfaces with high design quality
- [`brand-guidelines`](skills/brand-guidelines/SKILL.md) — Applies Anthropic's official brand colors and typography to any sort of artifact
- [`theme-factory`](skills/theme-factory/SKILL.md) — Toolkit for styling artifacts with a theme
- [`algorithmic-art`](skills/algorithmic-art/SKILL.md) — Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration
- [`slack-gif-creator`](skills/slack-gif-creator/SKILL.md) — Knowledge and utilities for creating animated GIFs optimized for Slack

### 寫作與溝通

- [`doc-coauthoring`](skills/doc-coauthoring/SKILL.md) — Guide users through a structured workflow for co-authoring documentation
- [`internal-comms`](skills/internal-comms/SKILL.md) — A set of resources to help write all kinds of internal communications
- `naming` — Name products, SaaS, brands, open source projects, bots, and apps（未安裝）

### 開發工具

- [`claude-api`](skills/claude-api/SKILL.md) — Build, debug, and optimize Claude API / Anthropic SDK apps
- [`mcp-builder`](skills/mcp-builder/SKILL.md) — Guide for creating high-quality MCP (Model Context Protocol) servers
- [`skill-creator`](skills/skill-creator/SKILL.md) — Create new skills, modify and improve existing skills, and measure skill performance
- [`web-artifacts-builder`](skills/web-artifacts-builder/SKILL.md) — Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts
- [`webapp-testing`](skills/webapp-testing/SKILL.md) — Toolkit for interacting with and testing local web applications using Playwright

### 專業領域

- `bazi` — 四柱八字命理分析。透過交互式步驟收集出生資訊（姓名、曾用名、陽曆/農曆生日、時辰、性別、出生地），排出四柱八字，參照經典命理典籍（窮通寶典、三命通會、滴天髓、淵海子平、子平真詮等）進行專業分析。（未安裝）

### 內部整合

- `nexus-integration` — Rhincodon Studio 內部 Nexus 套件庫整合指南。設定新的 CI/CD pipeline、Dockerfile、或本地開發環境時，應優先使用 Nexus 作為套件代理。（未安裝）

---

## 安裝狀態快照

### ✅ 能力技能（已安裝 17 個於 `System/skills/`）

| 名稱 | 來源 | 大小 |
|------|------|------|
| docx | PR #2 (balnibarbian) | 1.3M |
| pdf | PR #2 | 85K |
| pptx | PR #2 | 1.3M |
| xlsx | PR #3 | 1.2M |
| algorithmic-art | anthropic/skills | 64K |
| brand-guidelines | anthropic/skills | 16K |
| canvas-design | anthropic/skills | 5.6M |
| claude-api | anthropic/skills | 644K |
| doc-coauthoring | anthropic/skills | 16K |
| frontend-design | anthropic/skills | 20K |
| internal-comms | anthropic/skills | 36K |
| mcp-builder | anthropic/skills | 153K |
| skill-creator | anthropic/skills | 268K |
| slack-gif-creator | anthropic/skills | 57K |
| theme-factory | anthropic/skills | 154K |
| web-artifacts-builder | anthropic/skills | 56K |
| webapp-testing | anthropic/skills | 36K |

### ❌ 能力技能（未安裝 3 個）

- `naming` — Anthropic 官方未公開
- `bazi` — 第三方／自製，需另尋來源
- `nexus-integration` — Rhincodon Studio 內部

### 工作流技能本機狀態

| 命令 | 狀態 | 位置 |
|------|------|------|
| `/journal` `/agents` `/intake` `/maintain` `/digest` `/writing` `/reflect` `/to-md` | ✅ 已安裝 | `.claude/commands/<name>.md` |
| `/cso` `/investigate` `/netbox` `/garage` `/scrape` `/k8s` `/mem0` `/slides` `/wagodanz` `/pm` | ❌ 規劃中 | — |
