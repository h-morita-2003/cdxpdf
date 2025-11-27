declare const cv: any;

export const rectifyReceipt = (canvas: HTMLCanvasElement): string | null => {
  if (typeof cv === "undefined") {
    console.error("❌ OpenCV.js がロードされていません");
    return null;
  }

  const src = cv.imread(canvas);
  let img = new cv.Mat();
  cv.cvtColor(src, img, cv.COLOR_RGBA2GRAY);

  // ⭐ コントラスト強調（白飛び対策）
  cv.equalizeHist(img, img);

  // ⭐ ノイズ除去
  cv.GaussianBlur(img, img, new cv.Size(5, 5), 0);

  // ⭐ Cannyで輪郭検出
  let edges = new cv.Mat();
  cv.Canny(img, edges, 50, 150);

  // ⭐ 輪郭取得
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let maxArea = 0;
  let maxContour = null;

  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);
    const area = cv.contourArea(cnt);

    if (area > maxArea) {
      // 多角形近似
      let approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

      if (approx.rows === 4) {
        maxArea = area;
        maxContour = approx;
      }
    }
  }

  if (!maxContour) {
    console.warn("⚠ レシート輪郭が検出できませんでした");
    return null;
  }

  // ⭐ 4点ソート（左上 → 右上 → 右下 → 左下）
  const sortPoints = (pts: number[][]) => {
    pts.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    const [tl, br] = [pts[0], pts[3]];

    pts.sort((a, b) => a[0] - b[0]);
    const [bl, tr] = [pts[1], pts[2]];

    return [tl, tr, br, bl];
  };

  let points = [];
  for (let i = 0; i < 4; i++) {
    const p = maxContour.intPtr(i);
    points.push([p[0], p[1]]);
  }
  points = sortPoints(points);

  let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, points.flat());

  // ⭐ レシートを縦長に補正
  const width = Math.max(
    Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]),
    Math.hypot(points[2][0] - points[3][0], points[2][1] - points[3][1])
  );

  const height = Math.max(
    Math.hypot(points[3][0] - points[0][0], points[3][1] - points[0][1]),
    Math.hypot(points[2][0] - points[1][0], points[2][1] - points[1][1])
  );

  let dstTri = cv.matFromArray(
    4,
    1,
    cv.CV_32FC2,
    [0, 0, width, 0, width, height, 0, height]
  );

  let M = cv.getPerspectiveTransform(srcTri, dstTri);
  let dst = new cv.Mat();
  cv.warpPerspective(src, dst, M, new cv.Size(width, height));

  let outCanvas = document.createElement("canvas");
  cv.imshow(outCanvas, dst);

  const base64 = outCanvas.toDataURL("image/png");

  // メモリ解放
  src.delete(); img.delete(); edges.delete();
  contours.delete(); hierarchy.delete();
  if (maxContour) maxContour.delete();
  M.delete(); dst.delete();

  return base64;
};