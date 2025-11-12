import Tesseract from "tesseract.js";
import fs from "fs";

(async () => {
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.error("❌ 画像パスが指定されていません");
    process.exit(1);
  }

  console.log("🧠 OCR処理中...");

  const imageBuffer = fs.readFileSync(imagePath);
  const result = await Tesseract.recognize(imageBuffer, "jpn+eng", {
    logger: (m) => console.log(m.status, Math.round(m.progress * 100) + "%"),
  });

  console.log("✅ OCR完了");
  console.log(result.data.text); // ここで全文出力
})();
