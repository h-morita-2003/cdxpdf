// server/runOCR.js
import Tesseract from "tesseract.js";
import fs from "fs";

const imagePath = process.argv[2];

if (!imagePath || !fs.existsSync(imagePath)) {
  console.error("❌ 画像ファイルが見つかりません:", imagePath);
  process.exit(1);
}

console.log("🧠 OCR開始:", imagePath);

// 🔥 画像ファイルを Buffer で読み込む（フォーマット判定エラー対策）
const imageBuffer = fs.readFileSync(imagePath);

Tesseract.recognize(imageBuffer, "jpn+eng", {
  logger: (m) => console.log(m.status, Math.round(m.progress * 100) + "%"),
})
  .then(({ data: { text } }) => {
    console.log(text);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ OCR失敗:", err);
    process.exit(1);
  });
