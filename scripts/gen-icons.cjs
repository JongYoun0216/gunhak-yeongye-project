// PWA 아이콘(192/512) 생성 스크립트. 군용 네이비 배경 + 금색 별/방패 실루엣.
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

function hex(h) {
  const v = parseInt(h.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

const NAVY = hex('#0e1830');
const GOLD = hex('#e8b923');

function drawIcon(size) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      // 배경: 방사형 그라디언트 느낌의 단순 네이비
      const distBg = Math.hypot(x - cx, y - cy) / (size * 0.75);
      const shade = Math.max(0, 1 - distBg * 0.4);
      png.data[idx] = Math.round(NAVY[0] * shade + 10);
      png.data[idx + 1] = Math.round(NAVY[1] * shade + 14);
      png.data[idx + 2] = Math.round(NAVY[2] * shade + 24);
      png.data[idx + 3] = 255;
    }
  }

  // 방패 모양 실루엣 (금색)
  const w = size * 0.42;
  const h = size * 0.5;
  const left = cx - w / 2;
  const top = cy - h / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - left) / w; // 0~1
      const ny = (y - top) / h; // 0~1
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) continue;
      let inside = false;
      if (ny < 0.62) {
        // 위쪽 직사각형부
        inside = true;
      } else {
        // 아래쪽 뾰족한 부분 (삼각형)
        const t = (ny - 0.62) / 0.38;
        const edge = t * 0.5;
        inside = nx > edge && nx < 1 - edge;
      }
      if (inside) {
        const idx = (size * y + x) << 2;
        png.data[idx] = GOLD[0];
        png.data[idx + 1] = GOLD[1];
        png.data[idx + 2] = GOLD[2];
        png.data[idx + 3] = 255;
      }
    }
  }

  // 중앙 별 (네이비, 방패 위)
  const starR = size * 0.11;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - (cy - size * 0.02);
      const r = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      const spikes = 5;
      const starRadius = starR * (0.5 + 0.5 * Math.cos(spikes * angle));
      if (r < starRadius * 0.9) {
        const idx = (size * y + x) << 2;
        png.data[idx] = NAVY[0];
        png.data[idx + 1] = NAVY[1];
        png.data[idx + 2] = NAVY[2];
        png.data[idx + 3] = 255;
      }
    }
  }

  return png;
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const png = drawIcon(size);
  const buf = PNG.sync.write(png);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  console.log('wrote', size);
}
