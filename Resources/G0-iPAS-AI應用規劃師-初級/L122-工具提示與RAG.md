---
para: resource
domain: 學習
type: 學習筆記
status: active
summary: L122 生成式工具、提示工程、RAG、Agent — 依問題選方法
---

# L122 工具、提示與 RAG

## 判斷句

- 先問產出：文字／圖／程式／有來源的答案／會呼叫工具的流程。
- **幻覺**：模型編造。知識會變、必須可追溯 → 優先 **RAG**，不是先微調。
- **Agent**：要多步規劃、呼叫 API、跨工具。規則清楚的單次問答不必上 Agent。
- MCP（Model Context Protocol）：模型連外部工具／資料的協定思路 — 「怎麼接工具」，不是另一個 LLM 品牌。

## 工具怎麼選（記用途，不背價目表）

| 需求 | 方向（評鑑範圍曾列舉） |
|------|------------------------|
| 對話、草稿 | ChatGPT 等對話介面 |
| 系統整合、控 token | OpenAI API 等 API |
| 多模態理解 | Gemini 等 |
| 寫程式 | GitHub Copilot、Cursor、VS Code Copilot |
| 流程／代理工作室 | Copilot Studio 等 |
| 生圖 | Midjourney 等 |

選項出現「要引用內部知識」→ RAG 或有來源的檢索，不是只調 temperature。

## 提示工程

| 技法 | 何時 |
|------|------|
| Zero-shot | 簡單、模型已會 |
| Few-shot | 要固定格式、口吻 |
| CoT（思維鏈） | 要逐步推理 |
| ToT（思維樹） | 多分枝探索；成本高，簡單題不值得 |
| 降 temperature | 要穩定、少創意 |
| 升 temperature | 要發想（仍要人工把關） |

## RAG（必考）

本質：**檢索 + 生成**。解決知識過時與胡謅。

答得不準時檢查順序：

1. 資料有沒有、權限對不對  
2. **Chunking** 切太碎／太長／切錯邊界  
3. 檢索方式（關鍵字／向量／混合）  
4. 才考慮換更大模型  

## Agent

能力鏈：感知 → 規劃 → 行動（工具／API）。  
多代理要防互等卡死（逾時、heartbeat、failover 思路）。  
**不要**為了時髦上 Agent：步驟固定用流程或單一 RAG 更穩。

## 易混

- RAG ≠ 微調。RAG 改知識快；微調改行為／格式，成本高。
- 有搜尋的聊天機器人如果沒把檢索片段餵給生成，就不算完整 RAG。
- Prompt 寫更長救不了知識不在上下文裡。

## 樂雲場景

業務 FAQ：RAG + 低 temperature。  
跨系統開單、查用量、寫回覆：才評估 Agent。  
客戶規章不能出域：檢索索引與權限要先設計。

## 自測

1. 內部 SOP 每月改，要讓 AI 答得準，RAG 還是從零訓練？  
2. CoT 與 ToT 差在哪？  
3. Agent 兩個子代理互相等待，優先加更長 prompt 還是超時／failover？

參考：1 RAG 2 單鏈逐步 vs 多分枝 3 機制，不是灌 prompt
