// server/runOCR.js
import Tesseract from "tesseract.js";
import fs from "fs";

const imagePath = process.argv[2]; // route.tsから渡された画像パス

if (!imagePath || !fs.existsSync(imagePath)) {
  console.error("❌ 画像ファイルが見つかりません:", imagePath);
  process.exit(1);
}

console.log("🧠 OCR開始:", imagePath);

Tesseract.recognize(imagePath, "jpn+eng", {
  logger: (m) => console.log(m.status, Math.round(m.progress * 100) + "%"),
})
  .then(({ data: { text } }) => {
    console.log(text); // ← route.tsがこれを受け取って出力
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ OCR失敗:", err);
    process.exit(1);
  });
