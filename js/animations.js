export function injectAnimations() {
  if (document.getElementById('sticker-animations')) return;

  const style = document.createElement('style');
  style.id = 'sticker-animations';
  style.textContent = `

    /* ===================== CELEBRATE / 庆祝撒花 ===================== */

    .sticker-celebrate .figure-anim {
      animation: celebrateBounce 1.2s ease-in-out infinite both;
    }
    @keyframes celebrateBounce {
      0%, 100% { transform: translateY(0); }
      20%      { transform: translateY(-14px); }
      40%      { transform: translateY(-2px); }
      55%      { transform: translateY(-8px); }
      70%      { transform: translateY(0); }
    }

    .sticker-celebrate .arms {
      animation: celebrateWave 1.2s ease-in-out infinite both;
      transform-origin: 0px -12px;
    }
    @keyframes celebrateWave {
      0%, 100% { transform: rotate(0deg); }
      20%      { transform: rotate(-12deg); }
      40%      { transform: rotate(8deg); }
      60%      { transform: rotate(-6deg); }
      80%      { transform: rotate(4deg); }
    }

    .confetti {
      animation: confettiFall 1.2s linear infinite both;
    }
    @keyframes confettiFall {
      0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
      80%  { opacity: 0.6; }
      100% { transform: translateY(40px) rotate(400deg); opacity: 0; }
    }

    /* ===================== THUMBS UP / 点赞加油 ===================== */

    .sticker-thumbsup .figure-anim {
      animation: thumbsBounce 0.8s ease-in-out infinite both;
    }
    @keyframes thumbsBounce {
      0%, 100% { transform: translateY(0); }
      45%      { transform: translateY(-10px); }
      55%      { transform: translateY(-10px); }
    }

    .sticker-thumbsup .arms {
      animation: thumbsPump 0.8s ease-in-out infinite both;
      transform-origin: 0px -12px;
    }
    @keyframes thumbsPump {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      45%      { transform: translateY(-6px) rotate(-4deg); }
      55%      { transform: translateY(-6px) rotate(-4deg); }
    }

    .sparkle {
      animation: sparklePulse 0.8s ease-in-out infinite both;
    }
    @keyframes sparklePulse {
      0%, 100% { opacity: 0; transform: scale(0.3); }
      40%      { opacity: 1; transform: scale(1.3); }
      60%      { opacity: 1; transform: scale(1.1); }
    }

    /* ===================== LOVE / 比心 ===================== */

    .sticker-love .figure-anim {
      animation: loveSway 1.4s ease-in-out infinite both;
    }
    @keyframes loveSway {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25%      { transform: translateY(-4px) rotate(-3deg); }
      50%      { transform: translateY(0) rotate(0deg); }
      75%      { transform: translateY(-4px) rotate(3deg); }
    }

    .sticker-love .arms {
      animation: lovePulse 1.4s ease-in-out infinite both;
      transform-origin: 0px -24px;
    }
    @keyframes lovePulse {
      0%, 100% { transform: scale(1); }
      35%      { transform: scale(1.12); }
      65%      { transform: scale(1.12); }
    }

    .float-heart {
      animation: heartFloat 1.4s ease-out infinite both;
    }
    @keyframes heartFloat {
      0%   { transform: translateY(0) scale(0.4); opacity: 0; }
      20%  { opacity: 0.9; }
      100% { transform: translateY(-28px) scale(1.1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
