const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = 240;

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// Mahjong 条子 (bamboo tile) layouts
// Each pattern mirrors the classic bamboo stick arrangements on mahjong tiles
const MAHJONG_LAYOUTS = {
  // 三条: vertical column of 3
  3: { scale: 0.85, positions: [
    [120, 58], [120, 118], [120, 178],
  ]},
  // 四条: 2×2 grid
  4: { scale: 0.78, positions: [
    [82, 78], [158, 78],
    [82, 162], [158, 162],
  ]},
  // 五条: 2-1-2 cross pattern
  5: { scale: 0.68, positions: [
    [82, 52], [158, 52],
    [120, 118],
    [82, 184], [158, 184],
  ]},
  // 六条: 2×3 grid (2 columns, 3 rows)
  6: { scale: 0.62, positions: [
    [84, 48], [156, 48],
    [84, 118], [156, 118],
    [84, 188], [156, 188],
  ]},
  // 七条: 2-3-2 pattern
  7: { scale: 0.56, positions: [
    [84, 44], [156, 44],
    [56, 118], [120, 118], [184, 118],
    [84, 192], [156, 192],
  ]},
  // 八条: 2×4 grid (2 columns, 4 rows)
  8: { scale: 0.50, positions: [
    [84, 38], [156, 38],
    [84, 92], [156, 92],
    [84, 148], [156, 148],
    [84, 202], [156, 202],
  ]},
  // 九条 (crowd/很多人): 3×3 grid
  9: { scale: 0.50, positions: [
    [56, 44], [120, 44], [184, 44],
    [56, 118], [120, 118], [184, 118],
    [56, 192], [120, 192], [184, 192],
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
  if (emotion === 'celebrate') {
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
  if (emotion === 'celebrate') {
    arms.appendChild(svgEl('line', { x1: 0, y1: -12, x2: -14, y2: -28, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    arms.appendChild(svgEl('line', { x1: 0, y1: -12, x2: 14, y2: -28, stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
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

  if (emotion === 'celebrate') {
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF922B'];
    for (let i = 0; i < 5; i++) {
      const cx = (i - 2) * 7;
      g.appendChild(svgEl('rect', {
        x: cx - 2, y: -42 - i * 3, width: 4, height: 4,
        fill: colors[i], rx: 1, class: 'confetti',
        style: `animation-delay: ${(d + i * 0.15).toFixed(2)}s`,
      }));
    }
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

  // Tile shadow
  g.appendChild(svgEl('rect', {
    x: 6, y: 6, width: SIZE - 8, height: SIZE - 8,
    fill: '#C8BFA0', rx: 18,
  }));

  // Tile body — ivory mahjong tile
  g.appendChild(svgEl('rect', {
    x: 4, y: 2, width: SIZE - 8, height: SIZE - 8,
    fill: '#F5EDD6', rx: 18, stroke: '#D4C9A8', 'stroke-width': 2,
  }));

  // Inner bevel highlight
  g.appendChild(svgEl('rect', {
    x: 10, y: 8, width: SIZE - 20, height: SIZE - 20,
    fill: 'none', rx: 14, stroke: '#FAF6EC', 'stroke-width': 1.5,
  }));

  return g;
}

/**
 * Create a sticker SVG arranged like a mahjong bamboo tile (条子).
 * @param {'celebrate'|'thumbsup'|'love'} emotion
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
