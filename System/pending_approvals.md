---
para: system
type: 審批隊列
status: active
summary: B/C 類變更提案，等待用戶審批
---

# 待審批提案

> Identity 變更、分類體系新增、頂層結構改動
> 必須包含：依據、風險、回滾方案

## 待審批

-

## 已批准

### 2026-08-20 — B類：TELOS 身份敘述強化（技術型 PM／雲端＋AI 雙軸）

- **依據**：使用者 2026-08-20 在 Cursor 右側編輯器直接修訂 `Identity/TELOS.md`，明確定位為「嚴謹且專業的技術型產品經理」，並在 M1、V1 補上雲端技術專業度與雲端架構／AI 知識熟悉度。
- **已執行**：開頭自述、M1、V1 三處修訂生效；輕量同步 [[Identity/CONTEXT]] 角色畫像
- **風險**：北極星對「雲端＋AI 雙專業」要求提高；G1 仍未定 Google／AWS，與 V1 表述暫不完全對齊
- **復原方案**：還原 TELOS 開頭、M1、V1 三處至修訂前文字（或 `git checkout -- Identity/TELOS.md`）
- **批准**：使用者 2026-08-20 回覆「批准 TELOS 修訂」

### 2026-08-14 — B類：TELOS G0 期限從「第三季」改為「2026-11-07」

### 2026-08-14 — B類：TELOS G0 期限從「第三季」改為「2026-11-07」

- **依據**：8/15（115 年第 3 次）無准考證；Q3 已無剩餘場次。下一場 11/07，個人報名至 9/22 中午。
- **已執行**：G0 改為 `2026-11-07 考取 iPAS AI 應用規劃師初級證照`
- **風險**：北極星時程放寬；G1（Q4 雲端證照）與 11/07 重疊需之後再排
- **復原方案**：把 G0 改回「第三季考取到AI應用規劃師初級證照」
- **批准**：使用者 2026-08-14 回覆「批准 G0 改期」

### 2026-08-14 — B類：數位員工班底改為產品經理核心班

- **依據**：大腦盤點後選定班底 A；對齊 TELOS（樂雲智能產品經理／雲端與 AI）；移除工作室 CEO 模板角色
- **變更摘要**：
  - 新建：ProductAdvisor (`team:pm`)、ArchCoach (`team:arch`)、AIGovAdvisor (`team:aigov`)、BizEnablement (`team:biz`)、CertCoach (`team:cert`)
  - 保留微調：Strategist（CEO → 產品經理）
  - 刪除：CTO、CFO、SRE、CoS、Legal、ChemTeacher
  - 同步：Agents/_index、CLAUDE.md AGENTS、team-labels、RACI、anti-phishing、scheduled-tasks
  - 輕補：Identity/CONTEXT.md（從 TELOS 抽出，不改 TELOS）
- **風險**：舊 Agent label／文件連結斷裂；Playbooks 中 CoS/SRE/CFO 排程失效
- **復原方案**：`git checkout -- Identity/Agents Areas/AI-Governance .claude/CLAUDE.md Identity/CONTEXT.md System/pending_approvals.md` 或還原本 commit
- **批准**：計畫「數位員工班底」確認即視為批准 · 2026-08-14

## 已拒絕

-
