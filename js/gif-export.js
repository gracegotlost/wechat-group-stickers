const GIF_SIZE = 240;
const FPS = 15;

const EMOTION_DURATION = {
  happy: 800,
  thumbsup: 800,
  love: 1400,
};

/**
 * Get all the CSS animation rules needed inside a standalone SVG.
 * We extract them from our injected stylesheet.
 */
function getAnimationCSS() {
  const sheet = document.getElementById('sticker-animations');
  return sheet ? sheet.textContent : '';
}

/**
 * Render a single frozen frame of an animated SVG sticker.
 *
 * Strategy: clone the SVG, embed all animation CSS inside it,
 * then freeze every animated element at the target time using
 * animation-play-state:paused + negative animation-delay.
 */
function buildFrozenSvg(svgOriginal, frameTimeMs) {
  const clone = svgOriginal.cloneNode(true);
  clone.setAttribute('width', GIF_SIZE);
  clone.setAttribute('height', GIF_SIZE);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // Embed animation CSS inside the SVG so it works in <img> context
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = getAnimationCSS();
  defs.appendChild(style);
  clone.insertBefore(defs, clone.firstChild);

  // Freeze all animated elements at the target frame time
  const animatedSelectors = ['.figure-anim', '.arms', '.confetti', '.sparkle', '.float-heart'];
  for (const sel of animatedSelectors) {
    clone.querySelectorAll(sel).forEach(el => {
      const existingStyle = el.getAttribute('style') || '';
      // Parse any existing animation-delay from inline style
      const delayMatch = existingStyle.match(/animation-delay:\s*([-\d.]+)s/);
      const baseDelay = delayMatch ? parseFloat(delayMatch[1]) : 0;
      const frozenDelay = baseDelay - (frameTimeMs / 1000);

      el.setAttribute('style',
        existingStyle.replace(/animation-delay:[^;]+;?/, '') +
        `; animation-play-state: paused; animation-delay: ${frozenDelay.toFixed(4)}s;`
      );
    });
  }

  return clone;
}

/**
 * Render an SVG element (as string) onto a 240×240 canvas.
 * Returns ImageData.
 */
async function renderSvgToImageData(svgElement) {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgElement);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image(GIF_SIZE, GIF_SIZE);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = GIF_SIZE;
    canvas.height = GIF_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, GIF_SIZE, GIF_SIZE);
    ctx.drawImage(img, 0, 0, GIF_SIZE, GIF_SIZE);
    return ctx.getImageData(0, 0, GIF_SIZE, GIF_SIZE);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Export a single sticker SVG element to an animated GIF blob.
 * @param {SVGSVGElement} svgElement
 * @param {string} emotion - 'happy' | 'thumbsup' | 'love'
 * @param {function} [onProgress] - callback(framesDone, totalFrames)
 * @returns {Promise<Blob>}
 */
export async function exportStickerToGif(svgElement, emotion, onProgress) {
  const duration = EMOTION_DURATION[emotion] || 1200;
  const frameCount = Math.ceil((duration / 1000) * FPS);
  const frameDelay = Math.round(1000 / FPS);

  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const timeMs = (i / frameCount) * duration;
    const frozenSvg = buildFrozenSvg(svgElement, timeMs);
    const imageData = await renderSvgToImageData(frozenSvg);

    frames.push({
      data: imageData.data.buffer,
      delay: frameDelay,
    });

    if (onProgress) onProgress(i + 1, frameCount);
  }

  const { encode } = await import('https://esm.sh/modern-gif@2.0.4');
  const output = await encode({
    width: GIF_SIZE,
    height: GIF_SIZE,
    frames,
  });

  return new Blob([output], { type: 'image/gif' });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export all stickers and package into a ZIP file.
 * @param {Array<{emotion: string, count: number, svg: SVGSVGElement}>} stickers
 * @param {function} [onProgress] - callback(done, total, currentFilename)
 * @returns {Promise<Blob>}
 */
export async function exportAllAsZip(stickers, onProgress) {
  const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
  const zip = new JSZip();

  for (let i = 0; i < stickers.length; i++) {
    const { emotion, count, svg } = stickers[i];
    const label = count > 8 ? 'crowd' : `${count}p`;
    const filename = `${emotion}_${label}.gif`;

    if (onProgress) onProgress(i, stickers.length, filename);
    const blob = await exportStickerToGif(svg, emotion);
    zip.file(filename, blob);
  }

  if (onProgress) onProgress(stickers.length, stickers.length, 'Creating ZIP...');
  return await zip.generateAsync({ type: 'blob' });
}
