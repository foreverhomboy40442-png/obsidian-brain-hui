const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "exams");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".txt") && !f.includes("(1)"));

function parseExam(text) {
  const blocks = text.split(/\n(?=[A-D] \d+\.\n)/);
  const qs = [];
  for (const b of blocks) {
    const m = b.match(/^([A-D]) (\d+)\.\n([\s\S]+)/);
    if (!m) continue;
    const body = m[3].replace(/\s+/g, " ").trim();
    qs.push({ ans: m[1], n: Number(m[2]), stem: body.slice(0, 120) });
  }
  return qs;
}

function tag(stem) {
  const s = stem;
  const rules = [
    [/治理|倫理|個資|隱私|個資法|資安|偏見|公平|問責|透明|HITL|基本法|歐盟|金管會/, "治理／隱私／倫理"],
    [/SMOTE|不平衡|少數類|過取樣|欠取樣/, "類別不平衡"],
    [/離群|outlier|IQR|Z-score|截尾|極端/, "離群值／統計"],
    [/常態|標準差|平均|抽樣|p 值|p值|顯著|虛無|Type I|Type II|型一|型二|假說|檢定/, "統計推論"],
    [/監督式|非監督|半監督|強化式|強化學習|標籤/, "學習類型"],
    [/過擬合|欠擬合|泛化|正則|Bias|Variance|交叉驗證/, "過擬合／泛化"],
    [/K-means|集群|分群|PCA|降維/, "分群／降維"],
    [/CNN|RNN|LSTM|Transformer|YOLO|深度學習|卷積/, "深度學習模型"],
    [/鑑別|生成式|GAN|LLM|擴散/, "鑑別vs生成"],
    [/特徵|One-hot|編碼|標準化|正規化|資料清理|缺值|資料整合/, "特徵／資料處理"],
    [/電腦視覺|影像|NLP|自然語言|語音|推薦系統|感知器|物聯網|IoT/, "應用技術選型"],
    [/No Code|Low Code|低程式|無程式/, "No/Low Code"],
    [/Prompt|提示|temperature|CoT|Few-shot|幻覺/, "提示工程"],
    [/RAG|檢索|向量|Embedding|知識庫/, "RAG"],
    [/Agent|代理|MCP|工具呼叫|API/, "Agent"],
    [/ROI|TCO|成本|導入|評估|風險|著作權|智財/, "導入／成本／風險"],
    [/ChatGPT|Copilot|Gemini|Midjourney|Cursor/, "工具選用"],
  ];
  const tags = [];
  for (const [re, t] of rules) if (re.test(s)) tags.push(t);
  return tags.length ? tags.join("、") : "其他";
}

for (const f of files) {
  const qs = parseExam(fs.readFileSync(path.join(dir, f), "utf8"));
  console.log("\n===", f, "count", qs.length);
  const bag = {};
  for (const q of qs) {
    const t = tag(q.stem);
    bag[t] = (bag[t] || 0) + 1;
    console.log(String(q.n).padStart(2, "0"), q.ans, t, "|", q.stem.slice(0, 70));
  }
  console.log("TAGS", JSON.stringify(bag));
}
