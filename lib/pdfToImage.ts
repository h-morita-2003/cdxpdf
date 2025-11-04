// lib/pdfToImage.ts
import { createCanvas } from "canvas";

export async function pdfToPng(fileBuffer: Buffer): Promise<Buffer> {
 

  try {
    // ✅ pdfjs-distをNodeのrequireで直接呼び出す（webpackに巻き込ませない）
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
    pdfjsLib.GlobalWorkerOptions.workerSrc = undefined;

    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context, viewport }).promise;

    
    return canvas.toBuffer("image/png");
  } catch (err) {
    console.error("❌ PDF→PNG変換中にエラー発生:", err);
    throw err;
  }
}
