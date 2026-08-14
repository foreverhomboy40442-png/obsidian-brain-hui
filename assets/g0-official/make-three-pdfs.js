/**
 * Convert the three G0 study markdown books to print PDFs via Chrome.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const NOTES = path.join(ROOT, "Resources", "G0-iPAS-AI應用規劃師-初級");
const OUT_DIR = path.join(ROOT, "assets");
const FONT = "C:/Windows/Fonts/NotoSansTC-VF.ttf";

function stripFm(md) {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s) {
  s = s.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (_, t) => esc(t));
  s = s.replace(/`([^`]+)`/g, (_, t) => `<code>${esc(t)}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return s;
}

function mdToHtml(md) {
  const lines = stripFm(md).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let inUl = false;
  let inOl = false;
  let inPre = false;
  let pre = [];

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  while (i < lines.length) {
    const raw = lines[i];

    if (raw.startsWith("```")) {
      if (inPre) {
        out.push(`<pre><code>${esc(pre.join("\n"))}</code></pre>`);
        pre = [];
        inPre = false;
      } else {
        closeLists();
        inPre = true;
      }
      i++;
      continue;
    }
    if (inPre) {
      pre.push(raw);
      i++;
      continue;
    }

    if (raw.startsWith("|") && i + 1 < lines.length && /^\|?\s*-+/.test(lines[i + 1])) {
      closeLists();
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i]);
        i++;
      }
      const parseRow = (r) =>
        r
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      const head = parseRow(rows[0]);
      const body = rows.slice(2).map(parseRow);
      let t = "<table><thead><tr>";
      head.forEach((c) => (t += `<th>${inline(esc(c))}</th>`));
      t += "</tr></thead><tbody>";
      body.forEach((row) => {
        t += "<tr>";
        row.forEach((c) => (t += `<td>${inline(esc(c))}</td>`));
        t += "</tr>";
      });
      t += "</tbody></table>";
      out.push(t);
      continue;
    }

    if (/^---+$/.test(raw.trim())) {
      closeLists();
      out.push("<hr>");
      i++;
      continue;
    }

    const hm = raw.match(/^(#{1,6})\s+(.*)$/);
    if (hm) {
      closeLists();
      const n = hm[1].length;
      out.push(`<h${n}>${inline(esc(hm[2]))}</h${n}>`);
      i++;
      continue;
    }

    const ul = raw.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inline(esc(ul[1]))}</li>`);
      i++;
      continue;
    }

    const ol = raw.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${inline(esc(ol[1]))}</li>`);
      i++;
      continue;
    }

    if (raw.trim() === "") {
      closeLists();
      i++;
      continue;
    }

    closeLists();
    out.push(`<p>${inline(esc(raw))}</p>`);
    i++;
  }
  closeLists();
  if (inPre) out.push(`<pre><code>${esc(pre.join("\n"))}</code></pre>`);
  return out.join("\n");
}

function wrap(title, bodyHtml, subtitle) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
@font-face {
  font-family: NotoSansTC;
  src: url("file:///${FONT}");
  font-weight: 100 900;
}
@page { size: A4; margin: 16mm 14mm 18mm 14mm; }
* { box-sizing: border-box; }
body {
  font-family: NotoSansTC, "Microsoft JhengHei", sans-serif;
  font-size: 11pt;
  line-height: 1.55;
  color: #1a1a1a;
}
.cover {
  page-break-after: always;
  padding-top: 28mm;
}
.cover h1 { font-size: 26pt; margin: 0 0 8mm; }
.kicker { font-size: 12pt; color: #444; margin-bottom: 6mm; }
.meta { font-size: 10.5pt; color: #333; }
h1 { font-size: 18pt; margin: 10mm 0 4mm; page-break-after: avoid; }
h2 { font-size: 14.5pt; margin: 8mm 0 3mm; page-break-after: avoid; }
h3 { font-size: 12.5pt; margin: 6mm 0 2mm; page-break-after: avoid; }
h4 { font-size: 11.5pt; margin: 4mm 0 2mm; }
p { margin: 0 0 3mm; }
ul, ol { margin: 0 0 3.5mm 6mm; padding: 0; }
li { margin: 0 0 1.2mm; }
hr { border: 0; border-top: 1px solid #ccc; margin: 6mm 0; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 5mm;
  font-size: 9.5pt;
  page-break-inside: auto;
}
th, td {
  border: 1px solid #bbb;
  padding: 2.2mm 2mm;
  vertical-align: top;
  text-align: left;
}
th { background: #f0f0f0; }
code, pre { font-family: Consolas, monospace; font-size: 9.5pt; }
pre {
  background: #f6f6f6;
  padding: 3mm;
  white-space: pre-wrap;
  page-break-inside: avoid;
}
.q { page-break-inside: avoid; }
footer-hint { display: none; }
</style>
</head>
<body>
<section class="cover">
  <div class="kicker">iPAS AI 應用規劃師（初級）　備考三冊　2026-11-07</div>
  <h1>${esc(title)}</h1>
  <p class="meta">${esc(subtitle || "")}</p>
  <p class="meta">整理：讀書筆記（非官方教材原文）。公告試題僅供個人備考練習。</p>
</section>
${bodyHtml}
</body>
</html>`;
}

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
    "C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
    "C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe",
  ].filter(Boolean);
  for (const p of cands) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Chrome/Edge not found");
}

function printPdf(htmlPath, pdfPath) {
  const chrome = findChrome();
  const tmp = path.join(OUT_DIR, "_pdf_tmp", "chrome-profile-g0");
  fs.mkdirSync(tmp, { recursive: true });
  const htmlUrl = "file:///" + htmlPath.replace(/\\/g, "/");
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      `--user-data-dir=${tmp}`,
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      htmlUrl,
    ],
    { stdio: "inherit" }
  );
}

function book(file, title, subtitle) {
  const md = fs.readFileSync(path.join(NOTES, file), "utf8");
  return { title, subtitle, html: mdToHtml(md) };
}

const plan = book(
  "01-讀書進度計畫表.md",
  "第一冊　讀書進度計畫表",
  "12 週對齊官方指引章節與題本。每天 60–90 分鐘。"
);
const s1 = book(
  "02-科目一讀書重點.md",
  "科目一　人工智慧基礎概論　讀書重點",
  "對齊學習指引 3.1–3.4，已套勘誤；含公告試題常考的 XAI。"
);
const s2 = book(
  "03-科目二讀書重點.md",
  "科目二　生成式 AI 應用與規劃　讀書重點",
  "對齊學習指引 3.1–3.3，已套勘誤；含 RAG／Agent／導入風險。"
);
const qb = book(
  "04-題本.md",
  "第三冊　題本（115-1／115-2 公告試題）",
  "四份公告試題全文。練習請先遮住每題「答案」。"
);

const jobs = [
  {
    name: "G0-01-讀書進度計畫表.pdf",
    title: "第一冊　讀書進度計畫表",
    html: wrap(plan.title, plan.html, plan.subtitle),
  },
  {
    name: "G0-02-讀書重點筆記-科目一與科目二.pdf",
    title: "第二冊　內容讀書重點筆記（科目一＋科目二）",
    html: wrap(
      "第二冊　內容讀書重點筆記",
      `<h1>科目一　人工智慧基礎概論</h1>\n${s1.html}\n<div style="page-break-before:always"></div>\n<h1>科目二　生成式 AI 應用與規劃</h1>\n${s2.html}`,
      "科目一與科目二完整重點。請搭配第一冊進度表與第三冊題本。"
    ),
  },
  {
    name: "G0-02a-科目一讀書重點.pdf",
    title: "科目一　人工智慧基礎概論　讀書重點",
    html: wrap(s1.title, s1.html, s1.subtitle),
  },
  {
    name: "G0-02b-科目二讀書重點.pdf",
    title: "科目二　生成式 AI 應用與規劃　讀書重點",
    html: wrap(s2.title, s2.html, s2.subtitle),
  },
  {
    name: "G0-03-題本.pdf",
    title: "第三冊　題本",
    html: wrap(qb.title, qb.html, qb.subtitle),
  },
];

const tmpDir = path.join(OUT_DIR, "_pdf_tmp");
fs.mkdirSync(tmpDir, { recursive: true });

const desktop = path.join(process.env.USERPROFILE || "", "Desktop");
const made = [];

const only = process.argv.slice(2);

for (const job of jobs) {
  if (only.length && !only.includes(job.name)) continue;
  const htmlPath = path.join(tmpDir, job.name.replace(".pdf", ".html"));
  const pdfPath = path.join(OUT_DIR, job.name);
  fs.writeFileSync(htmlPath, job.html, "utf8");
  console.log("print", job.name);
  printPdf(htmlPath, pdfPath);
  const kb = Math.round(fs.statSync(pdfPath).size / 1024);
  console.log("wrote", pdfPath, kb, "KB");
  if (desktop && fs.existsSync(desktop)) {
    const dest = path.join(desktop, job.name);
    fs.copyFileSync(pdfPath, dest);
    console.log("copied", dest);
  }
  made.push({ name: job.name, kb });
}

console.log(JSON.stringify(made, null, 2));
