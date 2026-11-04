<script lang="ts">
  import {
    analyze,
    fromCompatibility,
    fromNaverImages,
    toCompatibility,
    toComposed,
    toHanyang,
    toJamo,
  } from 'old-hangul-convert';
  import { backspace, letterForKey, press } from './lib/composer';
  import { plainText } from './lib/paste';
  import { PLACEHOLDER } from './lib/placeholder';

  type Format = 'composed' | 'jamo' | 'hanyang' | 'compat';

  const FONTS = [
    { id: 'HANBatang-LVT', label: '함초롬바탕 LVT' },
    { id: 'HANDotum-LVT', label: '함초롬돋움 LVT' },
  ];
  const FORMATS: { id: Format; label: string; write: (text: string) => string }[] = [
    { id: 'composed', label: '표준 유니코드', write: (text) => toComposed(text) },
    { id: 'jamo', label: '첫가끝 (현대 글자까지 풀어쓰기)', write: (text) => toJamo(text) },
    { id: 'hanyang', label: '한양 PUA (옛 글꼴·사전용)', write: (text) => toHanyang(text) },
    { id: 'compat', label: '호환 자모 (ㅅㆍㄹ, 음절 경계 없음)', write: (text) => toCompatibility(text) },
  ];
  const PALETTE: [key: string, letter: string, shown: string][] = [
    ['K', 'ᆞ', 'ㆍ'],
    ['A', 'ᅀ', 'ㅿ'],
    ['D', 'ᅌ', 'ㆁ'],
    ['G', 'ᅙ', 'ㆆ'],
    ['Z', 'ᄼ', 'ᄼ'],
    ['X', 'ᄾ', 'ᄾ'],
    ['C', 'ᅎ', 'ᅎ'],
    ['V', 'ᅐ', 'ᅐ'],
    ['B', 'ᅔ', 'ᅔ'],
    ['N', 'ᅕ', 'ᅕ'],
  ];

  function stored(key: string, fallback: string): string {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function store(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }

  let input = $state(stored('text', ''));
  let font = $state(stored('font', FONTS[0]!.id));
  let format = $state(stored('format', 'composed') as Format);
  let keyboard = $state(stored('keyboard', '') === 'on');
  let copied = $state(false);
  let status = $state('');
  let area: HTMLTextAreaElement;

  // Switching back after a lossy format restores the text as it was, unless it has been edited.
  let source = '';
  let written = '';
  let applied = format;

  $effect(() => store('text', input));
  $effect(() => store('font', font));
  $effect(() => store('format', format));
  $effect(() => store('keyboard', keyboard ? 'on' : ''));

  const write = (text: string) => FORMATS.find(({ id }) => id === format)!.write(text);

  function reportMissing(text: string) {
    const count = format === 'hanyang' ? analyze(text).missingFromHanyang.length : 0;
    status = count ? `한양 PUA에 없는 글자 ${count}종은 첫가끝으로 남았습니다.` : '';
  }

  function changeFormat() {
    let text = input;
    if (input === written) text = source;
    else if (applied === 'compat') text = fromCompatibility(input);
    applied = format;
    source = text;
    input = written = write(text);
    reportMissing(text);
  }

  function replaceBefore(next: string, end: number) {
    input = next + input.slice(end);
    queueMicrotask(() => {
      area.value = input;
      area.selectionStart = area.selectionEnd = next.length;
    });
  }

  function typeLetter(letter: string) {
    replaceBefore(press(input.slice(0, area.selectionStart), letter), area.selectionEnd);
    area.focus();
  }

  function onKeydown(event: KeyboardEvent) {
    if (!keyboard || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Backspace' && area.selectionStart === area.selectionEnd) {
      const next = backspace(input.slice(0, area.selectionStart));
      if (next === undefined) return;
      event.preventDefault();
      replaceBefore(next, area.selectionEnd);
      return;
    }
    const letter = letterForKey(event.key);
    if (!letter) return;
    event.preventDefault();
    typeLetter(letter);
  }

  function onPaste(event: ClipboardEvent) {
    const html = event.clipboardData?.getData('text/html') ?? '';
    const read = fromNaverImages(html);
    const text = read !== html ? plainText(read) : event.clipboardData?.getData('text/plain');
    if (!text) return;
    event.preventDefault();
    replaceBefore(input.slice(0, area.selectionStart) + write(text), area.selectionEnd);
    reportMissing(text);
  }

  async function copy() {
    const value = write(input);
    if (value !== input) input = value;
    reportMissing(value);
    await navigator.clipboard.writeText(value);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="container">
  <div class="selects">
    <div class="select-container input-box">
      <select bind:value={font} aria-label="글꼴" style:font-family={`'${font}'`}>
        {#each FONTS as { id, label }}
          <option value={id}>{label}</option>
        {/each}
      </select>
      <span class="select-arrow"></span>
    </div>
    <div class="select-container input-box">
      <select bind:value={format} onchange={changeFormat} aria-label="저장 형식" style:font-family={`'${font}'`}>
        {#each FORMATS as { id, label }}
          <option value={id}>{label}</option>
        {/each}
      </select>
      <span class="select-arrow"></span>
    </div>
  </div>

  <div class="textarea-container input-box" role="main">
    <textarea
      bind:this={area}
      bind:value={input}
      onkeydown={onKeydown}
      onpaste={onPaste}
      lang="ko"
      spellcheck="false"
      placeholder={PLACEHOLDER}
      style:font-family={`'${font}'`}
    ></textarea>
  </div>

  {#if keyboard}
    <div class="palette" role="group" aria-label="옛글자">
      {#each PALETTE as [key, letter, shown]}
        <button onmousedown={(event) => event.preventDefault()} onclick={() => typeLetter(letter)} style:font-family={`'${font}'`}>
          {shown}<kbd>⇧{key}</kbd>
        </button>
      {/each}
    </div>
  {/if}

  <div class="actions">
    <label><input type="checkbox" bind:checked={keyboard} /> 옛한글 자판</label>
    <span class="status">{status}</span>
    <button class="copy" onclick={copy} disabled={!input}>{copied ? '복사됨' : '복사'}</button>
  </div>

  <footer><a href="https://github.com/mkpoli/old-hangul-note">Old Hangul Note</a> by <a href="https://github.com/mkpoli">@mkpoli</a></footer>
</div>
