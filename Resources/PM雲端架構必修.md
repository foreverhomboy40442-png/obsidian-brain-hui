---
para: resource
domain: 雲端架構
type: 學習筆記
tags:
  - GCP
  - AWS
  - 成本
  - 資安
  - PM
status: active
summary: 非技術 PM 的雲端共通語言：IAM／WAF／加密／跳板機，以及承諾用量、持續使用、Spot 三大省錢法（2026-08-20 已對官方文件勘誤）
source: C:\Users\Carmen\Downloads\Cloud_Architecture_Notes_for_PM.md
verified: 2026-08-20
---

# 非技術背景 PM 的雲端架構必修筆記

這份筆記幫 PM 掌握與工程師溝通的共通語言，並控管時程與雲端帳單。原文有幾處把 AWS 規則套到所有雲、或把不同產品混在一起；以下已對 2026-08-20 官方文件修正。

對齊你現況：樂雲管的是 **GCP**。AWS 名稱用來對照市場語言；出門講方案時，優先用右側 GCP 名稱。

相關專案：[[Projects/gcp-single-point]]

---

## 勘誤摘要（原文哪裡不準）

| 原文說法 | 問題 | 正確說法 |
| :--- | :--- | :--- |
| DDoS 時立刻調 WAF 規則 | 把兩種防護混在一起 | WAF 擋網頁攻擊（SQL 注入、XSS、惡意刷單／Bot）；DDoS 主要靠 AWS Shield／GCP Cloud Armor |
| 搶占式主機「雲端廠商一律 2 分鐘前通知」 | 只適用 AWS | AWS 約 2 分鐘；Azure 約 30 秒；GCP 預設幾乎沒有專用緩衝，關機期最多約 30 秒（可選 120 秒，Preview） |
| GCP SUD「最高自動打 7 折」 | 數字方向對，但範圍誇大 | 最高約 20%～30% 折抵，且**只有部分舊機型**（N1／N2／N2D／C2／M1／M2 等）；E2、C3、C4、N4 沒有 SUD |
| 承諾用量一律「約 40%～72%」 | 把 AWS 行銷上限套到 GCP | AWS 行銷上限 66%／72%；GCP CUD 常見約 28%～55%，記憶體優化 3 年最高約 70% |
| GDPR、ISO 27001 都叫「國際資安認證」 | GDPR 不是證照 | GDPR 是法規（要合規）；ISO 27001 才是可取得的認證 |
| Cost Explorer 當成各家通用後台 | 這是 AWS 產品名 | AWS：Cost Explorer；GCP：Cloud Billing Reports＋CUD 建議 |

折扣百分比都是廠商「最高可達」的行銷數字，實際依機型、區域、約期而變。開會時要工程師用定價計算機跑你這次規格，不要背這個區間去承諾客戶。

---

## 雲端 PM 的核心價值

1. **打破溝通壁壘**：聽懂技術需求，判斷技術債是否合理。
2. **精準控管預算**：預估新功能上線後的雲端成本，避免產品大紅、帳單爆表。
3. **推動合規與資安**：用雲端現成控制項加快合規，而不是把「上雲」本身當成證照。

### 證照藍圖（對你：GCP 優先）

| 步驟 | 建議 | 效益 |
| :--- | :--- | :--- |
| 第一步：商務共通語言 | **Google Cloud Digital Leader**（你管 GCP，比 AWS CLF 對口）；若要跨雲對照再補 `AWS Certified Cloud Practitioner (CLF)` | 術語與帳單邏輯 |
| 第二步：架構藍圖 | **Associate Cloud Engineer (ACE)** 或繼續往 Professional Cloud Architect；跨雲再補 `AWS Certified Solutions Architect – Associate (SAA)` | 高可用性、災難備援、與技術主管對方案 |

SAA／ACE 都是情境選擇題，不考寫程式。G1 要不要從 AWS CLF 改成 Google 證照，仍須先審 [[Identity/TELOS]]，本筆記不自動改北極星。

---

## 第一單元：雲端資安的「大樓保全」圖解

| 專有名詞 | AWS | GCP（你出門用這個） | 大樓比喻 | PM 核心觀念與實戰 |
| :--- | :--- | :--- | :--- | :--- |
| **身分與存取管理** IAM | IAM | Cloud IAM | 員工識別證與門禁卡 | 決定「誰」可以進「哪裡」做「什麼」。專案初期要求**最小權限**，避免實習生或無關帳號誤刪核心資料。 |
| **網頁應用程式防火牆** WAF | AWS WAF | Cloud Armor（WAF 政策） | 大門口的防暴安檢門 | 過濾 HTTP／HTTPS 惡意請求：SQL 注入、XSS、惡意刷單／Bot。⚠️ 被刷單或異常請求時，先查 WAF／Armor **規則與速率限制**。 |
| **DDoS 防護** | AWS Shield（Standard 內建；Advanced 付費） | Cloud Armor＋Google 骨幹網路 | 整棟大樓的防暴衝系統 | 大量流量把服務灌爆，屬網路／傳輸層或應用層洪水。⚠️ 這不是「調一下 WAF 規則」就能概括；GCP 問 Cloud Armor／負載平衡是否在最外層。 |
| **資料加密與金鑰** | KMS（金鑰）；TLS／HTTPS（傳輸中） | Cloud KMS；負載平衡器託管憑證 | 保險箱（靜態）＋密封運送（傳輸中） | **靜態加密**靠 KMS 管金鑰；**傳輸中加密**靠 TLS／HTTPS（舊稱 SSL，現在講 TLS）。金流、會員個資規格必須寫：敏感資料靜態加密，對外強制 HTTPS。 |
| **跳板機／堡壘機** | Bastion Host；現在更常改用 SSM Session Manager | 優先 **IAP**（Identity-Aware Proxy）TCP 轉送，不一定再養一台跳板機 | 後門的唯一特檢通道 | 資料庫不直接對網際網路開放。工程師要進內網，必須經身分驗證通道。 |

---

## 第二單元：雲端折扣的三大省錢法

### 1. 承諾用量折扣（用「簽約承諾」打折）

- **原廠名稱**：AWS `Savings Plans`／`Reserved Instances (RI)`；GCP `Committed Use Discounts (CUD)`；Azure `Reservations`／`Savings Plan`
- **白話**：「電信綁約」。承諾未來 1 或 3 年的用量或每小時消費額。
- **折扣幅度（行銷上限，不是保證）**
  - AWS：Compute Savings Plans 最高約 **66%**；EC2 Instance Savings Plans／Standard RI 最高約 **72%**
  - GCP CUD：Compute Flex 約 **28%（1 年）／46%（3 年）**；資源型多數機型約 **37%／55%**；記憶體優化 3 年最高約 **70%**
- **PM 實戰**：產品已上線、流量穩定、未來一年不會收掉，才主動提綁約。短期實驗、PoC、季節性專案不要鎖 1～3 年。GCP 問清楚是 **資源型 CUD**（機型＋區域較死）還是 **Flex／spend-based CUD**（較彈性、折扣較淺）。

### 2. 持續使用折扣（用「這個月開夠久」自動打折）

- **原廠名稱**：GCP `Sustained Use Discounts (SUD)`（AWS 沒有對等機制）
- **白話**：不需簽約。符合資格的 VM 在一個月內用超過約 25% 時間，月底自動折抵；用滿月最高約 **20% 或 30%**（不是所有機器都打到 7 折）。
- **資格限制（開會必問）**
  - 有 SUD：N1（最高約 30%）、N2／N2D／C2（最高約 20%）、M1／M2 等
  - **沒有 SUD**：E2、C3、C4、N4 等較新系列 → 穩定負載應改談 CUD，不要幻想「開著就會自動變便宜」
  - 已被 CUD 覆蓋的用量，不會再疊 SUD
- **PM 實戰**：SUD 是安全網，不是主力省錢法。穩定 24/7 負載，CUD 通常比 SUD 省更多。

### 3. 搶占式虛擬主機（用「剩餘座位」打折）

- **原廠名稱**：AWS `Spot Instances`；GCP `Spot VMs`；Azure `Spot VMs`
- **白話**：「廉價航空清艙票」。用機房閒置容量，正價客戶要回來就會被回收。
- **通知時間（各家不同）**
  - AWS：約 **2 分鐘**（休眠中斷沒有這 2 分鐘）
  - Azure：約 **30 秒**（Scheduled Events，盡力而為）
  - GCP：預設沒有專用 2 分鐘緩衝；關機期最多約 **30 秒**。需要較長處理時間可設 **120 秒**（Preview）
- **折扣幅度**：行銷宣稱最高可到約 **1 折（省約 90%）**；實際常在 5～9 折之間，看機型與時段。
- **PM 實戰**：**不能**用在使用者正在瀏覽、刷卡、登入的正式路徑。適合可中斷任務：AI 訓練（有 checkpoint）、批次渲染、離峰大數據。正式環境用 Spot，等於把可用性賭在別人要不要回收機器。

---

## PM 預算與資安三問

跟技術團隊開會時可以直接問：

1. **這個資安機制會不會改到使用者流程（UX）？**
2. **這符合本次要遵守的法規（如 GDPR）或要拿的認證（如 ISO 27001）嗎？**
3. **調整架構或防護後，雲端成本預估增減多少？請用定價計算機跑一版。**

### 免費官方成本工具

| 用途 | AWS | GCP |
| :--- | :--- | :--- |
| 上線前估價 | [AWS Pricing Calculator](https://calculator.aws/) | [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator) |
| 事後看帳單、找浪費 | **Cost Explorer**；可看 RI／Savings Plans 建議 | **Cloud Billing Reports**（帳單報表、成本細分）；另有 **CUD 建議** |

「Cost Explorer」不要在 GCP 客戶場合當成產品名使用。

---

## 核對來源（2026-08-20）

- [GCP Sustained use discounts](https://docs.cloud.google.com/compute/docs/sustained-use-discounts)
- [GCP Committed use discounts](https://docs.cloud.google.com/docs/cuds)
- [GCP Spot VMs](https://docs.cloud.google.com/compute/docs/instances/spot)
- [AWS Savings Plans vs Reserved Instances](https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-ris.html)
- [AWS Spot interruption notices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html)
- [AWS WAF or Shield](https://docs.aws.amazon.com/decision-guides/latest/waf-or-shield/waf-or-shield.html)
- [Azure Spot VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms)
