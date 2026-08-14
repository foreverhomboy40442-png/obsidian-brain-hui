const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "exams");

const files = [
  ["115-1-S1", "科目一　人工智慧基礎概論", "115年第一次（2026-03-21）", "115年第一次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260410164304.txt"],
  ["115-1-S2", "科目二　生成式 AI 應用與規劃", "115年第一次（2026-03-21）", "115年第一次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260410164328.txt"],
  ["115-2-S1", "科目一　人工智慧基礎概論", "115年第二次（2026-05-16）", "115年第二次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260604212644.txt"],
  ["115-2-S2", "科目二　生成式 AI 應用與規劃", "115年第二次（2026-05-16）", "115年第二次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260604212719.txt"],
];

function parse(text) {
  const blocks = text.split(/\n(?=[A-D] \d+\.\n)/);
  const qs = [];
  for (const b of blocks) {
    const m = b.match(/^([A-D]) (\d+)\.\n([\s\S]+)/);
    if (!m) continue;
    let body = m[3]
      .replace(/\n----- PAGE[\s\S]*?-----\n/g, "\n")
      .replace(/115 年[^\n]*\n/g, "")
      .replace(/第 \d+ 頁[^\n]*\n/g, "")
      .replace(/第一科[^\n]*\n/g, "")
      .replace(/第二科[^\n]*\n/g, "")
      .trim();
    qs.push({ ans: m[1], n: Number(m[2]), body });
  }
  return qs;
}

let md = `---
para: resource
domain: 學習
type: 學習筆記
status: active
summary: G0 題本 — 115-1／115-2 公告試題全文整理（含答案，練習請先遮答案）
---

# 題本（公告試題整理）

來源：iPAS 115 年第一次、第二次初級公告試題。每科 50 題選擇，答案在題末。**練習時請先遮住「答案」再作答。**

使用：對應 [[01-讀書進度計畫表]] 的 W9–W12；錯題抄 [[錯題本]]。

`;

for (const [id, subj, when, f] of files) {
  const qs = parse(fs.readFileSync(path.join(dir, f), "utf8"));
  md += `\n# ${id}　${subj}\n\n場次：${when}　題數：${qs.length}\n\n`;
  for (const q of qs) {
    md += `## ${id} 第 ${q.n} 題\n\n${q.body}\n\n**答案：${q.ans}**\n\n---\n\n`;
  }
}

const out = path.join(
  "C:",
  "programing",
  "obsidian-brain-hui",
  "Resources",
  "G0-iPAS-AI應用規劃師-初級",
  "04-題本.md"
);
fs.writeFileSync(out, md, "utf8");
console.log("chars", md.length, "out", out);
