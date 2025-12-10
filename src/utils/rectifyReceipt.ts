// utils/rectifyReceipt.ts

// 型定義（OpenCV.js を TS で扱うため）
declare const cv: any;

export const rectifyReceipt = (canvas: HTMLCanvasElement): string | null => {
  if (!cv) {
    console.error("OpenCV.js not loaded");
    return null;
  }

  // canvas → RGBA Mat
  const src = cv.imread(canvas);

  try {
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    let blur = new cv.Mat();
    cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);

    let edged = new cv.Mat();
    cv.Canny(blur, edged, 50, 150);

    // 膨張
    let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.dilate(edged, edged, kernel);

    // 輪郭
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    if (contours.size() === 0) {
      console.error("No contour detected");
      cleanup([gray, blur, edged, kernel, contours, hierarchy]);
      return null;
    }

    // 最大輪郭
    let maxContour = contours.get(0);
    let maxArea = cv.contourArea(maxContour);
    for (let i = 1; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const area = cv.contourArea(cnt);
      if (area > maxArea) {
        maxArea = area;
        maxContour = cnt;
      }
    }

    // 多角形近似
    let approx = new cv.Mat();
    const peri = cv.arcLength(maxContour, true);
    cv.approxPolyDP(maxContour, approx, 0.02 * peri, true);

    if (approx.rows !== 4) {
      console.error("Not 4 points");
      cleanup([gray, blur, edged, kernel, contours, hierarchy, approx]);
      return null;
    }

    // 頂点抽出（OpenCV.js 安定版）
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const x = approx.intAt(i, 0);
      const y = approx.intAt(i, 1);
      pts.push({ x, y });
    }

    const ordered = orderPoints(pts);

    const width = Math.round(
      Math.max(
        distance(ordered.tl, ordered.tr),
        distance(ordered.bl, ordered.br)
      )
    );

    const height = Math.round(
      Math.max(
        distance(ordered.tl, ordered.bl),
        distance(ordered.tr, ordered.br)
      )
    );

    const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      ordered.tl.x, ordered.tl.y,
      ordered.tr.x, ordered.tr.y,
      ordered.br.x, ordered.br.y,
      ordered.bl.x, ordered.bl.y
    ]);

    const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0,
      width, 0,
      width, height,
      0, height
    ]);

    const M = cv.getPerspectiveTransform(srcTri, dstTri);
    let dst = new cv.Mat();

    cv.warpPerspective(src, dst, M, new cv.Size(width, height));

    // ❗ Tesseract 対策 → RGB で出力
    let rgb = new cv.Mat();
    cv.cvtColor(dst, rgb, cv.COLOR_RGBA2RGB);

    cv.imshow("outputCanvas", rgb);

// ⭐ 補正後の Mat → Base64 PNG に変換
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = rgb.cols;
    tmpCanvas.height = rgb.rows;
    cv.imshow(tmpCanvas, rgb);

    const base64 = tmpCanvas.toDataURL("image/png");

    // メモリ解放（rgb も追加）
    cleanup([gray, blur, edged, kernel, contours, hierarchy, approx, srcTri, dstTri, M, dst, rgb]);

    return base64;
  } catch (e) {
    console.error("rectifyReceipt error:", e);
    return null;
  }
};

function cleanup(mats: any[]) {
  mats.forEach(m => m?.delete());
}

function orderPoints(points: any[]) {
  const sorted = [...points].sort((a, b) => a.x + a.y - (b.x + b.y));
  const tl = sorted[0];
  const br = sorted[3];
  const tmp = sorted.slice(1, 3);
  const tr = tmp[0].x > tmp[1].x ? tmp[0] : tmp[1];
  const bl = tmp[0].x > tmp[1].x ? tmp[1] : tmp[0];
  return { tl, tr, br, bl };
}

function distance(a: any, b: any) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
