const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = 240;

// Portrait mahjong tile dimensions within the 240×240 square
const TILE_W = 160;
const TILE_H = 228;
const TILE_X = (SIZE - TILE_W) / 2; // 40
const TILE_Y = (SIZE - TILE_H) / 2; // 6

// Content area inside the tile (after inner padding)
const PAD = 12;
const CX0 = TILE_X + PAD;           // 52
const CY0 = TILE_Y + PAD;           // 18
const CW = TILE_W - PAD * 2;        // 136
const CH = TILE_H - PAD * 2;        // 204

// Helper: convert normalized (0-1) coords to absolute within tile content area
function pos(nx, ny) { return [CX0 + nx * CW, CY0 + ny * CH]; }

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// Authentic mahjong 条子 (bamboo tile) layouts
// Patterns match real Chinese mahjong tile stick arrangements
const MAHJONG_LAYOUTS = {
  // 三条: diagonal staircase (^/inverted-V pattern)
  3: { scale: 0.78, positions: [
    pos(0.50, 0.18),   // top center
    pos(0.22, 0.65),   // bottom left
    pos(0.78, 0.65),   // bottom right
  ]},
  // 四条: 2×2 grid
  4: { scale: 0.70, positions: [
    pos(0.30, 0.25), pos(0.70, 0.25),
    pos(0.30, 0.72), pos(0.70, 0.72),
  ]},
  // 五条: 2×2 + 1 center (cross/diamond)
  5: { scale: 0.60, positions: [
    pos(0.28, 0.16), pos(0.72, 0.16),
    pos(0.50, 0.50),
    pos(0.28, 0.84), pos(0.72, 0.84),
  ]},
  // 六条: 2 columns × 3 rows
  6: { scale: 0.55, positions: [
    pos(0.30, 0.14), pos(0.70, 0.14),
    pos(0.30, 0.50), pos(0.70, 0.50),
    pos(0.30, 0.86), pos(0.70, 0.86),
  ]},
  // 七条: 1 top center + 3-3 below (1-3-3 pattern)
  7: { scale: 0.44, positions: [
    pos(0.50, 0.08),
    pos(0.18, 0.40), pos(0.50, 0.40), pos(0.82, 0.40),
    pos(0.18, 0.78), pos(0.50, 0.78), pos(0.82, 0.78),
  ]},
  // 八条: M-shape zigzag (wide-narrow-wide-narrow)
  8: { scale: 0.44, positions: [
    pos(0.22, 0.08), pos(0.78, 0.08),
    pos(0.38, 0.35), pos(0.62, 0.35),
    pos(0.22, 0.62), pos(0.78, 0.62),
    pos(0.38, 0.89), pos(0.62, 0.89),
  ]},
  // 九条 (crowd): 3 columns × 3 rows
  9: { scale: 0.42, positions: [
    pos(0.18, 0.14), pos(0.50, 0.14), pos(0.82, 0.14),
    pos(0.18, 0.50), pos(0.50, 0.50), pos(0.82, 0.50),
    pos(0.18, 0.86), pos(0.50, 0.86), pos(0.82, 0.86),
  ]},
};

function getLayout(count) {
  const key = count > 8 ? 9 : count;
  const layout = MAHJONG_LAYOUTS[key];
  return layout.positions.map(([x, y]) => ({
    x, y, scale: layout.scale,
  }));
}

function drawFigure(emotion) {
  const g = svgEl('g', { class: `figure figure-${emotion}` });

  g.appendChild(svgEl('circle', {
    cx: 0, cy: -25, r: 8, fill: '#FAF6EC', stroke: '#333', 'stroke-width': 2.5,
  }));

  g.appendChild(svgEl('circle', { cx: -3, cy: -27, r: 1.3, fill: '#333' }));
  g.appendChild(svgEl('circle', { cx: 3, cy: -27, r: 1.3, fill: '#333' }));

  const mouthAttrs = { fill: 'none', 'stroke-width': 1.5, 'stroke-linecap': 'round' };
  if (emotion === 'happy') {
    g.appendChild(svgEl('path', { ...mouthAttrs, d: 'M -4,-21.5 Q 0,-17 4,-21.5', stroke: '#333' }));
  } else if (emotion === 'thumbsup') {
    g.appendChild(svgEl('path', { ...mouthAttrs, d: 'M -3.5,-21.5 Q 0,-18.5 3.5,-21.5', stroke: '#333' }));
  } else {
    g.appendChild(svgEl('path', { ...mouthAttrs, d: 'M -3.5,-21.5 Q 0,-17 3.5,-21.5', stroke: '#e55' }));
  }

  g.appendChild(svgEl('line', {
    x1: 0, y1: -17, x2: 0, y2: 5,
    stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round',
  }));

  const arms = svgEl('g', { class: 'arms' });
  if (emotion === 'happy') {
    arms.appendChild(svgEl('line', { x1: 0, y1: -10, x2: -15, y2: -4, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    arms.appendChild(svgEl('line', { x1: 0, y1: -10, x2: 15, y2: -4, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  } else if (emotion === 'thumbsup') {
    arms.appendChild(svgEl('line', { x1: 0, y1: -10, x2: -11, y2: 0, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    arms.appendChild(svgEl('line', { x1: 0, y1: -12, x2: 13, y2: -24, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    arms.appendChild(svgEl('line', { x1: 13, y1: -24, x2: 13, y2: -31, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    arms.appendChild(svgEl('circle', { cx: 13, cy: -24, r: 2.5, fill: '#333' }));
  } else {
    arms.appendChild(svgEl('path', {
      d: 'M 0,-12 C -8,-20 -14,-30 -7,-36 C -2,-40 0,-36 0,-34',
      fill: 'none', stroke: '#e55', 'stroke-width': 2.5, 'stroke-linecap': 'round',
    }));
    arms.appendChild(svgEl('path', {
      d: 'M 0,-12 C 8,-20 14,-30 7,-36 C 2,-40 0,-36 0,-34',
      fill: 'none', stroke: '#e55', 'stroke-width': 2.5, 'stroke-linecap': 'round',
    }));
  }
  g.appendChild(arms);

  g.appendChild(svgEl('line', { x1: 0, y1: 5, x2: -8, y2: 20, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  g.appendChild(svgEl('line', { x1: 0, y1: 5, x2: 8, y2: 20, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));

  return g;
}

function createParticles(emotion, figIndex) {
  const g = svgEl('g', { class: `particles particles-${emotion}` });
  const d = figIndex * 0.12;

  if (emotion === 'happy') {
    // No particles
  } else if (emotion === 'thumbsup') {
    for (let i = 0; i < 3; i++) {
      const angle = -70 + i * 35;
      const rad = (angle * Math.PI) / 180;
      const sx = 15 + Math.cos(rad) * 7;
      const sy = -28 + Math.sin(rad) * 7;
      g.appendChild(svgEl('line', {
        x1: sx, y1: sy,
        x2: sx + Math.cos(rad) * 6, y2: sy + Math.sin(rad) * 6,
        stroke: '#FFD93D', 'stroke-width': 2, 'stroke-linecap': 'round',
        class: 'sparkle',
        style: `animation-delay: ${(d + i * 0.2).toFixed(2)}s`,
      }));
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const hx = -8 + i * 8;
      const hy = -40 - i * 4;
      const s = 3;
      g.appendChild(svgEl('path', {
        d: `M ${hx},${hy} c -${s},-${s} -${s * 2},0 0,${s} c ${s * 2},0 ${s},-${s * 2} 0,-${s} Z`,
        fill: '#e55', class: 'float-heart',
        style: `animation-delay: ${(d + i * 0.25).toFixed(2)}s`,
      }));
    }
  }
  return g;
}

function drawTileBackground() {
  const g = svgEl('g', { class: 'tile-bg' });

  // Tile shadow (portrait rectangle)
  g.appendChild(svgEl('rect', {
    x: TILE_X + 3, y: TILE_Y + 4,
    width: TILE_W, height: TILE_H,
    fill: '#C8BFA0', rx: 14,
  }));

  // Tile body — ivory mahjong tile (portrait)
  g.appendChild(svgEl('rect', {
    x: TILE_X, y: TILE_Y,
    width: TILE_W, height: TILE_H,
    fill: '#F5EDD6', rx: 14, stroke: '#D4C9A8', 'stroke-width': 2,
  }));

  // Inner bevel highlight
  g.appendChild(svgEl('rect', {
    x: TILE_X + 5, y: TILE_Y + 5,
    width: TILE_W - 10, height: TILE_H - 10,
    fill: 'none', rx: 10, stroke: '#FAF6EC', 'stroke-width': 1.5,
  }));

  return g;
}

/**
 * Create a sticker SVG arranged like a mahjong bamboo tile (条子).
 * @param {'happy'|'thumbsup'|'love'} emotion
 * @param {number} count - 3 through 8, or 9+ for crowd (九条)
 * @returns {SVGSVGElement}
 */
export function createSticker(emotion, count) {
  const svg = svgEl('svg', {
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    xmlns: SVG_NS,
    class: `sticker sticker-${emotion}`,
  });

  svg.appendChild(drawTileBackground());

  const layout = getLayout(count > 8 ? 9 : count);

  layout.forEach((pos, i) => {
    const posGroup = svgEl('g', {
      transform: `translate(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}) scale(${pos.scale.toFixed(3)})`,
    });

    const animGroup = svgEl('g', {
      class: 'figure-anim',
      style: `animation-delay: ${(i * 0.1).toFixed(2)}s`,
    });

    animGroup.appendChild(drawFigure(emotion));
    animGroup.appendChild(createParticles(emotion, i));
    posGroup.appendChild(animGroup);
    svg.appendChild(posGroup);
  });

  return svg;
}

const TIAO_NAMES = {
  3: '三条', 4: '四条', 5: '五条',
  6: '六条', 7: '七条', 8: '八条',
};

export function getCountLabel(count) {
  if (count > 8) return '九条 · 很多人';
  return `${TIAO_NAMES[count]} · ${count}人`;
}
