# /to-md — 將 binary 檔案轉為 Markdown 筆記

把 PDF／PPTX／DOCX／XLSX 轉成結構化的 Obsidian markdown 筆記，並歸檔到對應的 PARA 位置。

## 用法

```
/to-md <路徑>              # 單檔或目錄
/to-md --dry-run <路徑>    # 只預覽，不寫入
/to-md --to <PARA目標>     # 指定輸出目錄（覆蓋自動判斷）
```

範例：
- `/to-md Inbox/Documents/公司簡介.pptx`
- `/to-md Inbox/Documents/Certificate/`
- `/to-md --to Resources/Vendors/<廠商> Inbox/Documents/上游/<廠商>/`

## 執行步驟

### 1. 識別目標檔案

- 掃描指定路徑（檔案或資料夾）
- 支援副檔名：`.pdf`, `.pptx`, `.docx`, `.xlsx`
- 不支援（回報跳過）：`.zip`, `.7z`, `.mp4`, `.MOV`, `.png`, `.jpg`
- 若無支援檔案 → 回報「無可轉換檔案」並結束

### 2. 分派到對應的解析 skill

| 副檔名 | 使用 skill |
|--------|----------|
| `.pdf` | `anthropic-skills:pdf`（大於 10 頁必須分頁讀，單次最多 20 頁） |
| `.pptx` | `anthropic-skills:pptx` |
| `.docx` | `anthropic-skills:docx` |
| `.xlsx` | `anthropic-skills:xlsx` |

讀取時優先抓：**標題、章節結構、表格、條列重點、關鍵數字、日期**。不要逐字照搬整份文件（避免複製版權內容，也避免 .md 過長）。

### 3. 判斷輸出位置

優先順序：
1. 使用者用 `--to <目標>` 指定 → 直接採用
2. 來源路徑是 `Inbox/Documents/` 下已存在的分類子目錄 → 依該子目錄名稱對應到同名的 Areas / Projects / Resources 子目錄（例如 `Inbox/Documents/Certificate/AWS/` → `Areas/Certifications/AWS/`）
3. 內容本質判斷：有截止日期／明確產出 → `Projects/`；持續責任無終點 → `Areas/`；可複用參考資料 → `Resources/`；舊版或已完成 → `Archives/`
4. 無法自動判斷 → 列出候選路徑（最多 3 個），**詢問使用者**

### 4. 產生輸出檔

#### 檔名規則
- 保留原檔語意，轉成 **kebab-case** + 保留中文
- 去掉版本號、日期、冗餘前綴（除非必要）
- 範例：
  - `0_公司簡報_20260114.pptx` → `公司簡報.md`
  - `CISSP筆記-Domain-1.pdf` → `domain-1.md`
  - `SAA-C03-001-100.pdf` → `saa-c03-questions-001-100.md`

#### Frontmatter（必填）
```yaml
---
para: [project|area|resource|archive]
domain: [領域名稱]
type: [簡報|筆記|報告|提案|考古題|方法論|文件]
tags:
  - [相關 tag]
status: active
source: "[[../../Inbox/Documents/原始檔路徑]]"
source_type: [pdf|pptx|docx|xlsx]
source_date: YYYY-MM-DD   # 從檔名或文件 metadata 擷取
converted_at: YYYY-MM-DD
summary: [一句話說明]
---
```

#### 內容結構（建議）
```markdown
# [文件標題]

> [一句話本質摘要]

## 關鍵要點
- [bullet points，抓重點，不要逐字照搬]

## 章節／目錄
[若有多個章節，用 H2 分段，每段摘重點]

## 圖表／數據
[關鍵表格或數據，用 markdown 表格呈現]

## 引用與延伸
- 原始檔案：[[../../Inbox/Documents/...]]
- 相關筆記：[[其他筆記名稱]]  <!-- 若能識別關聯 -->
```

### 5. 大檔案分拆策略

- PDF > 30 頁：分章節成多個 `.md`，在目標目錄建一個 `index.md` 彙整
- PPT > 40 張：按主題分段成 `section-01.md`, `section-02.md`...
- 重複性高的考古題（SAA-C03 × 9 份）：合併成 `saa-c03-questions.md` 並分段

### 6. 處理原始檔

- **預設保留**：原 binary 檔留在 `Inbox/Documents/` 原位置（已被 `.gitignore` 擋住，不上傳 GitHub）
- 使用 `--move-source` 旗標時：把原檔搬到 `assets/docs/<原子目錄>/`，並更新 .md 的 `source` 連結
- **絕不刪除原檔**，除非使用者明確下 `--delete-source`（危險，需二次確認）

### 7. 更新 _index.md

- 把新 .md 加到目標目錄的 `_index.md` 成員清單
- 格式：`- [[檔名]] — [summary]`

### 8. 輸出報告

```
## /to-md 完成報告

轉換 X 個檔案，跳過 Y 個，失敗 Z 個：

✅ 成功：
- Inbox/.../公司簡介.pptx → Resources/公司簡介.md
- Inbox/.../CISSP筆記-Domain-1.pdf → Areas/Certifications/CISSP/domain-1.md

⚠️  跳過（不支援的檔案類型）：
- archive.zip（壓縮檔）
- Meeting Recording.mp4（影片 → 建議改用索引筆記）

❌ 失敗：
- <檔案> — <錯誤原因>
```

## 設計原則

- **逐檔分派**：不自己解析，呼叫對應的 anthropic-skills 處理
- **預設保留原檔**：不破壞來源
- **摘要而非抄錄**：抓結構與重點，避免版權與冗長
- **自動對應 PARA**：依 Inbox 子目錄 → PARA 目錄的映射表判斷

## 注意事項

- 若目標目錄不存在，**先詢問**要不要建立，不要靜默 `mkdir`
- 若同名 .md 已存在，**列出差異**並問要覆蓋、合併、或改名
- 含個資／機密的檔案（HR、財務、VPN、客戶合約）→ 轉 md 前提醒使用者確認
- 影片（`.mp4`/`.MOV`）建議改用 `/to-md --index-only` 產生指向原檔的索引筆記，不做內容轉換
- 批次作業建議**一次 ≤ 10 檔**，避免 context 爆掉；超過就分批回報進度

## 分批執行建議

大量檔案（>20）請分批：
1. 先跑 `--dry-run` 預覽映射正確性
2. 再按 PARA 分批執行：先 `Areas/` → `Projects/` → `Resources/` → `Archives/`
3. 每批結束寫 commit，避免一次動太多難以回溯

## 相關 skill

- `/intake` — 歸檔 `.md` 檔到 PARA（搭配使用：binary 先 `/to-md`，產生的 .md 若還在 Inbox 再 `/intake`）
- `anthropic-skills:pdf`、`pptx`、`docx`、`xlsx` — 實際解析器
