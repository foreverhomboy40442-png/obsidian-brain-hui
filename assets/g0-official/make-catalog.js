const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "exams");
const files = [
  ["115-1-S1", "115年第一次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260410164304.txt"],
  ["115-1-S2", "115年第一次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260410164328.txt"],
  ["115-2-S1", "115年第二次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260604212644.txt"],
  ["115-2-S2", "115年第二次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260604212719.txt"],
];

function parseExam(text) {
  const blocks = text.split(/\n(?=[A-D] \d+\.\n)/);
  const qs = [];
  for (const b of blocks) {
    const m = b.match(/^([A-D]) (\d+)\.\n([\s\S]+)/);
    if (!m) continue;
    const body = m[3].replace(/\s+/g, " ").trim();
    qs.push({ ans: m[1], n: Number(m[2]), stem: body.slice(0, 90) });
  }
  return qs;
}

function tag(stem) {
  const rules = [
    [/治理|倫理|個資|隱私|個資法|資安|偏見|公平|問責|透明|基本法|歐盟|金管會|金融機構運用/, "治理倫理"],
    [/SMOTE|不平衡|少數類/, "類別不平衡"],
    [/離群|IQR|Z-score|截尾|極端值/, "離群值"],
    [/常態|標準差|平均數|中位數|眾數|抽樣|p 值|p值|顯著|虛無|型一|型二|假說|檢定|四分/, "統計"],
    [/監督式|非監督|半監督|強化式|強化學習|RLHF|人類反饋/, "學習類型"],
    [/過擬合|欠擬合|泛化|正則|交叉驗證|梯度/, "泛化訓練"],
    [/K-means|集群|分群|PCA/, "分群降維"],
    [/CNN|RNN|LSTM|Transformer|YOLO|卷積|Flash Attention|注意力/, "深度模型"],
    [/鑑別|生成式|GAN|VAE|擴散|LLM/, "鑑別生成"],
    [/特徵|One-hot|編碼|標準化|正規化|資料清理|缺值|資料整合|結構化/, "資料特徵"],
    [/電腦視覺|影像|NLP|自然語言|語音|推薦系統|物件偵測|分割/, "技術選型"],
    [/No Code|Low Code|Low-Code|低程式|無程式/, "LowCode"],
    [/Prompt|提示詞|temperature|CoT|Few-shot|幻覺|溫度/, "提示工程"],
    [/RAG|檢索增強|Embedding|知識庫|向量/, "RAG"],
    [/Agent|代理|MCP|工具呼叫|多代理/, "Agent"],
    [/ROI|TCO|成本效益|導入|風險|著作權|智財|PEFT|LoRA|微調|蒸餾/, "導入風險"],
    [/ChatGPT|Copilot|Gemini|Midjourney|Cursor/, "工具"],
    [/XAI|LIME|SHAP|Saliency|反事實|可解釋/, "XAI"],
    [/批次推論|即時推論|Batching|延遲/, "推論架構"],
  ];
  const tags = [];
  for (const [re, t] of rules) if (re.test(stem)) tags.push(t);
  return tags.length ? tags : ["綜合情境"];
}

let md = "";
const all = [];
for (const [id, f] of files) {
  const qs = parseExam(fs.readFileSync(path.join(dir, f), "utf8"));
  md += `\n## ${id}（${qs.length} 題）\n\n`;
  md += "| 題 | 答 | 考點 | 題幹摘要 |\n|----|----|------|----------|\n";
  for (const q of qs) {
    const t = tag(q.stem).join("、");
    const stem = q.stem.replace(/\|/g, "／").slice(0, 70);
    md += `| ${q.n} | ${q.ans} | ${t} | ${stem} |\n`;
    for (const x of tag(q.stem)) all.push(x);
  }
}

const freq = {};
for (const t of all) freq[t] = (freq[t] || 0) + 1;
const ranked = Object.entries(freq).sort((a, b) => b[1] - a[1]);
fs.writeFileSync(path.join(__dirname, "catalog.md"), md, "utf8");
fs.writeFileSync(
  path.join(__dirname, "freq.json"),
  JSON.stringify({ ranked, total: all.length }, null, 2)
);
console.log(JSON.stringify(ranked, null, 2));
console.log("wrote catalog.md");
