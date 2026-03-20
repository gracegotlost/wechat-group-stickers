const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE = 240;

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/**
 * Compute layout positions for N figures within 240x240.
 * Returns array of { x, y, scale }.
 */
function getLayout(count) {
  if (count <= 4) {
    const spacing = SIZE / (count + 1);
    const sc = count === 3 ? 1.0 : 0.88;
    return Array.from({ length: count }, (_, i) => ({
      x: spacing * (i + 1),
      y: SIZE * 0.52,
      scale: sc,
    }));
  }
  if (count === 5) {
    const spacing = SIZE / 6;
    return Array.from({ length: 5 }, (_, i) => ({
      x: spacing * (i + 1),
      y: SIZE * 0.52,
      scale: 0.78,
    }));
  }
  if (count <= 8) {
    const topCount = Math.floor(count / 2);
    const botCount = count - topCount;
    const positions = [];
    const sc = count <= 6 ? 0.72 : 0.62;
    const topSpacing = SIZE / (topCount + 1);
    const botSpacing = SIZE / (botCount + 1);
    for (let i = 0; i < topCount; i++) {
      positions.push({ x: topSpacing * (i + 1), y: SIZE * 0.35, scale: sc });
    }
    for (let i = 0; i < botCount; i++) {
      positions.push({ x: botSpacing * (i + 1), y: SIZE * 0.68, scale: sc });
    }
    return positions;
  }

  // Crowd mode (8+): pack ~15 figures in 3 rows
  const rows = [4, 5, 6];
  const yOffsets = [SIZE * 0.20, SIZE * 0.48, SIZE * 0.76];
  const positions = [];
  const sc = 0.46;
  const seed = 42;
  let s = seed;
  function seededRandom() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  }
  for (let r = 0; r < rows.length; r++) {
    const n = rows[r];
    const spacing = SIZE / (n + 1);
    for (let i = 0; i < n; i++) {
      positions.push({
        x: spacing * (i + 1) + (seededRandom() - 0.5) * 6,
        y: yOffsets[r] + (seededRandom() - 0.5) * 6,
        scale: sc + (seededRandom() - 0.5) * 0.03,
      });
    }
  }
  return positions;
}

function drawFigure(emotion) {
  const g = svgEl('g', { class: `figure figure-${emotion}` });

  // Head
  g.appendChild(svgEl('circle', {
    cx: 0, cy: -25, r: 8, fill: '#fff', stroke: '#333', 'stroke-width': 2.5,
  }));

  // Eyes
  g.appendChild(svgEl('circle', { cx: -3, cy: -27, r: 1.3, fill: '#333' }));
  g.appendChild(svgEl('circle', { cx: 3, cy: -27, r: 1.3, fill: '#333' }));

  // Mouth (emotion-specific)
  const mouthAttrs = { fill: 'none', 'stroke-width': 1.5, 'stroke-linecap': 'round' };
  if (emotion === 'celebrate') {
    g.appendChild(svgEl('path', { ...mouthAttrs, d: 'M -4,-21.5 Q 0,-17 4,-21.5', stroke: '#333' }));
  } else if (emotion === 'thumbsup') {
    g.appendChild(svgEl('path', { ...mouthAttrs, d: 'M -3.5,-21.5 Q 0,-18.5 3.5,-21.5', stroke: '#333' }));
  } else {
    g.appendChild(svgEl('path', { ...mouthAttrs, d: 'M -3.5,-21.5 Q 0,-17 3.5,-21.5', stroke: '#e55' }));
  }

  // Body
  g.appendChild(svgEl('line', {
    x1: 0, y1: -17, x2: 0, y2: 5,
    stroke: '#333', 'stroke-width': 2.5, 'stroke-linecap': 'round',
  }));

  // Arms (wrapped in a group for animation)
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

  // Legs
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

/**
 * Create a sticker SVG for the given emotion and people count.
 * @param {'celebrate'|'thumbsup'|'love'} emotion
 * @param {number} count - 3 through 8, or 9+ for crowd mode
 * @returns {SVGSVGElement}
 */
export function createSticker(emotion, count) {
  const svg = svgEl('svg', {
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    xmlns: SVG_NS,
    class: `sticker sticker-${emotion}`,
  });

  svg.appendChild(svgEl('rect', { width: SIZE, height: SIZE, fill: '#fff', rx: 16 }));

  const isCrowd = count > 8;
  const layout = getLayout(isCrowd ? 9 : count);

  layout.forEach((pos, i) => {
    // Outer group: positioning only (SVG transform attribute)
    const posGroup = svgEl('g', {
      transform: `translate(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}) scale(${pos.scale.toFixed(3)})`,
    });

    // Inner group: CSS animation target
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

export function getCountLabel(count) {
  if (count > 8) return '很多人';
  return `${count}人`;
}
