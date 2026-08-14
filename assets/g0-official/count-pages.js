const fs = require("fs");
const path = require("path");
const pdfjsLib = require("./pdfjs/pdf.js");
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(__dirname, "pdfjs", "pdf.worker.js");

(async () => {
  const files = [
    "../G0-01-讀書進度計畫表.pdf",
    "../G0-02-讀書重點筆記-科目一與科目二.pdf",
    "../G0-02a-科目一讀書重點.pdf",
    "../G0-02b-科目二讀書重點.pdf",
    "../G0-03-題本.pdf",
  ];
  for (const f of files) {
    const data = new Uint8Array(fs.readFileSync(path.join(__dirname, f)));
    const doc = await pdfjsLib.getDocument({ data, disableWorker: true }).promise;
    console.log(path.basename(f), doc.numPages, "pages");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
