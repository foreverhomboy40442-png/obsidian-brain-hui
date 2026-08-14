const fs = require("fs");
const path = require("path");
const pdfjsLib = require("./pdfjs/pdf.js");

pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(__dirname, "pdfjs", "pdf.worker.js");

async function extractPdf(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
  const parts = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let line = "";
    let lastY = null;
    for (const item of content.items) {
      const y = item.transform ? item.transform[5] : 0;
      if (lastY !== null && Math.abs(y - lastY) > 4) {
        parts.push(line.trimEnd());
        line = "";
      }
      line += item.str + (item.hasEOL ? "\n" : "");
      lastY = y;
    }
    if (line.trim()) parts.push(line.trimEnd());
    parts.push("\n----- PAGE " + i + " / " + doc.numPages + " -----\n");
  }
  return parts.join("\n");
}

async function main() {
  const file = process.argv[2];
  const out = process.argv[3];
  const text = await extractPdf(file);
  fs.writeFileSync(out, text, "utf8");
  console.log("OK", path.basename(file), "chars", text.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
