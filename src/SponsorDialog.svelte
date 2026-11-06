<script lang="ts">
  // The author's portrait, what a tip pays for, then three steps that end at the tip buttons.
  // Each button carries its service's own mark and colour, unaltered. The contents and the
  // supporters roll's script load when the dialog first opens, so a page view asks the
  // supporters service for nothing.
  let { open = $bindable(false) }: { open: boolean } = $props();
  let dialog = $state<HTMLDialogElement | null>(null);
  let rollLoaded = false;
  let pressedOutside = false;

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open && !rollLoaded) {
      rollLoaded = true;
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://supporters.mkpo.li/roll.js';
      document.head.append(script);
    }
  });

  // A drag that leaves the box, or the box's own scrollbar, also targets the dialog, so the test is by position.
  function outside(event: MouseEvent) {
    const box = dialog!.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  }
</script>

<dialog
  bind:this={dialog}
  class="sponsor-dialog"
  aria-labelledby="sponsor-title"
  onclose={() => (open = false)}
  onpointerdown={(event) => (pressedOutside = outside(event))}
  onclick={(event) => {
    if (pressedOutside && outside(event)) open = false;
  }}
>
  {#if open}
    <header>
      <h2 id="sponsor-title">후원</h2>
      <button type="button" class="close" aria-label="닫기" onclick={() => (open = false)}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
      </button>
    </header>
    <div class="sheet">
      <div class="hero" aria-hidden="true">
        <span class="portrait">
          <img src="/sponsor-portrait.webp" alt="" width="112" height="112" decoding="async" />
          <svg class="heart" viewBox="0 0 24 24">
            <path d="M12 21s-8.5-5.1-8.5-11.3A4.7 4.7 0 0 1 12 6.9a4.7 4.7 0 0 1 8.5 2.8C20.5 15.9 12 21 12 21Z" />
            <ellipse class="shine" cx="7.6" cy="9.6" rx="1.5" ry="2.1" transform="rotate(-30 7.6 9.6)" />
          </svg>
        </span>
        <span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✦</span>
      </div>
      <p class="lead">옛한글 노트는 별도의 자금 지원 없이 혼자 만들고 있어요. 누구나 무료로 쓸 수 있고, 앞으로도 계속 무료로 제공하고 싶어요.</p>
      <p class="ask">옛한글 노트가 유용하다면 가볍게 후원해 주세요. 꾸준히 개선하는 데 시간을 더 쓸 수 있어요.</p>
      <section class="how">
        <h3>후원 방법</h3>
        <ol class="steps">
          <li>아래 버튼 중 하나를 눌러 주세요.</li>
          <li>금액을 선택해 주세요.</li>
          <li>카드로 결제하면 돼요. 회원가입은 필요 없어요.</li>
        </ol>
      </section>
      <div class="tips">
        <a class="tip kofi" href="https://ko-fi.com/mkpoli" target="_blank" rel="noreferrer">
          <img class="mark" src="/brand/kofi-symbol.svg" alt="" width="34" height="27" />
          <span class="text"><strong>Ko-fi</strong><small>일회성 또는 매월 정기 후원</small></span>
          <svg class="arrow" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </a>
        <a class="tip ofuse" href="https://ofuse.me/mkpoli" target="_blank" rel="noreferrer">
          <img class="mark" src="/brand/ofuse-icon.svg" alt="" width="26" height="28" />
          <span class="text"><strong>OFUSE</strong><small>메시지와 함께 후원</small></span>
          <svg class="arrow" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </a>
      </div>
      <a class="company" href="mailto:mkpoli@mkpo.li?subject=Sponsorship%20on%20hangul.mkpo.li">
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M3 5h14v10H3zM3 6l7 5 7-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
        <span class="text"><strong>기업도 후원할 수 있어요.</strong><small>mkpoli@mkpo.li로 연락해 주세요.</small></span>
      </a>
      <supporters-roll label="최근 후원자" anonymous="누군가"></supporters-roll>
      <p class="thanks">옛한글 노트를 사용해 주셔서 고마워요 💗</p>
    </div>
  {/if}
</dialog>

<style>
  .sponsor-dialog {
    --sp-ink: light-dark(#c2185b, #ffb3cd);
    --sp-heart: light-dark(#ff4f88, #ff7aa6);
    --sp-soft: light-dark(#fff1f5, #2f1822);
    --sp-line: light-dark(#ffd0de, #5a2a3f);
    inline-size: min(480px, calc(100vw - 32px));
    max-block-size: min(86dvh, 760px);
    padding: 0;
    overflow: auto;
    overscroll-behavior: contain;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--paper);
    color: var(--ink);
    font: 16px/1.5 system-ui, -apple-system, 'Malgun Gothic', sans-serif;
    word-break: keep-all;
  }
  .sponsor-dialog::backdrop {
    background: rgb(0 0 0 / 0.5);
  }
  header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px 10px 20px;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
  }
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
  .close {
    display: grid;
    place-items: center;
    inline-size: 32px;
    block-size: 32px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
  }
  .close:hover {
    color: var(--ink);
    background: var(--shadow);
  }
  .sheet {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px 20px;
  }
  .hero {
    position: relative;
    display: grid;
    place-items: center;
    block-size: 136px;
    border-radius: 16px;
    background: radial-gradient(closest-side, light-dark(#ffd9e5, #4a1e31), transparent);
  }
  .portrait {
    position: relative;
    inline-size: 112px;
    block-size: 112px;
  }
  .portrait img {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 0 0 4px var(--paper), 0 0 0 6px var(--sp-line), 0 10px 24px rgb(255 79 136 / 0.3);
  }
  .heart {
    position: absolute;
    right: -2px;
    bottom: 2px;
    inline-size: 34px;
    block-size: 34px;
    fill: var(--sp-heart);
    stroke: var(--paper);
    stroke-width: 2;
    paint-order: stroke;
    overflow: visible;
    transform-origin: 50% 60%;
    animation: beat 2.8s ease-in-out infinite;
    filter: drop-shadow(0 3px 6px rgb(255 79 136 / 0.35));
  }
  .heart .shine {
    fill: #fff;
    opacity: 0.6;
  }
  .spark {
    position: absolute;
    color: var(--sp-heart);
    opacity: 0.75;
    animation: twinkle 2.4s ease-in-out infinite;
  }
  .s1 {
    top: 22px;
    left: calc(50% - 84px);
    font-size: 14px;
  }
  .s2 {
    top: 12px;
    left: calc(50% + 66px);
    font-size: 10px;
    animation-delay: 0.8s;
  }
  .s3 {
    bottom: 20px;
    left: calc(50% - 76px);
    font-size: 11px;
    animation-delay: 1.6s;
  }
  @keyframes beat {
    0%, 70%, 100% { transform: scale(1); }
    78% { transform: scale(1.18); }
    86% { transform: scale(0.96); }
    93% { transform: scale(1.1); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.7); }
    50% { opacity: 0.9; transform: scale(1); }
  }
  .lead {
    margin: 0;
    line-height: 1.65;
  }
  .ask {
    margin: 0;
    font-weight: 700;
    color: var(--sp-ink);
  }
  .how {
    padding: 12px 16px;
    border: 1px dashed var(--sp-line);
    border-radius: 16px;
    background: var(--sp-soft);
  }
  h3 {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--sp-ink);
  }
  .steps {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: step;
  }
  .steps li {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 14px;
    line-height: 1.45;
    counter-increment: step;
  }
  .steps li::before {
    content: counter(step);
    display: grid;
    place-items: center;
    flex: none;
    inline-size: 20px;
    block-size: 20px;
    border-radius: 50%;
    background: var(--sp-ink);
    color: var(--sp-soft);
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    transform: translateY(-1px);
  }
  .tips {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tip {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px 12px 12px;
    border-radius: 999px;
    color: #fff;
    text-decoration: none;
    box-shadow: 0 6px 16px var(--tip-glow);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .kofi {
    --tip-glow: rgb(32 32 32 / 0.28);
    --tip-glow-hover: rgb(32 32 32 / 0.38);
    background: #202020;
    border: 1px solid light-dark(#202020, rgb(255 255 255 / 0.2));
  }
  /* OFUSE Blue (#2882a7) taken 4% darker, so the white labels reach 4.5:1. */
  .ofuse {
    --tip-glow: rgb(38 125 160 / 0.3);
    --tip-glow-hover: rgb(38 125 160 / 0.42);
    background: #267da0;
    border: 1px solid #267da0;
  }
  .tip:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px var(--tip-glow-hover);
  }
  .tip:active {
    transform: scale(0.98);
  }
  .tip:focus-visible,
  .company:focus-visible,
  .close:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  .tip .mark {
    display: block;
    flex: none;
    inline-size: 38px;
    block-size: 30px;
    object-fit: contain;
  }
  .tip .arrow {
    flex: none;
  }
  .tip .text strong {
    font-size: 18px;
  }
  .tip .text small {
    color: #fff;
  }
  .text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1px;
    min-inline-size: 0;
  }
  .text strong {
    font-size: 16px;
    font-weight: 700;
  }
  .text small {
    font-size: 13px;
    line-height: 1.4;
  }
  .company {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 12px;
    color: var(--muted);
    text-decoration: none;
  }
  .company:hover {
    background: var(--shadow);
    color: var(--ink);
  }
  .company svg {
    flex: none;
    margin-top: 3px;
  }
  .company .text strong {
    font-size: 14px;
    color: var(--ink);
  }
  supporters-roll {
    --sp-text: var(--ink);
    --sp-muted: var(--muted);
  }
  .thanks {
    margin: 0;
    font-size: 14px;
    color: var(--muted);
    text-align: center;
  }
  @media (max-width: 640px) {
    .sponsor-dialog {
      inset: auto 0 0;
      margin: 0;
      inline-size: 100%;
      max-inline-size: none;
      max-block-size: 85dvh;
      border-radius: 16px 16px 0 0;
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .heart,
    .spark,
    .tip {
      animation: none;
      transition: none;
    }
  }
</style>
