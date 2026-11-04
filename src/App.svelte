<script lang="ts">
  import { backspace, letterForKey, press } from './lib/composer';
  import { PLACEHOLDER } from './lib/placeholder';

  const FONTS = [
    { id: 'HANBatang-LVT', label: '함초롬바탕 LVT' },
    { id: 'HANDotum-LVT', label: '함초롬돋움 LVT' },
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
  let keyboard = $state(stored('keyboard', '') === 'on');
  let copied = $state(false);
  let area: HTMLTextAreaElement;

  $effect(() => store('text', input));
  $effect(() => store('font', font));
  $effect(() => store('keyboard', keyboard ? 'on' : ''));

  function replaceBefore(next: string, end: number) {
    if (next === input.slice(0, end)) return;
    area.focus();
    // The whole prefix is selected because browsers snap a selection out of a syllable's jamo.
    area.setSelectionRange(0, end);
    // execCommand keeps the edit on the browser's undo stack; assigning the value would clear it.
    if (!document.execCommand(next ? 'insertText' : 'delete', false, next)) {
      area.setRangeText(next, 0, end, 'end');
      input = area.value;
    }
  }

  function typeLetter(letter: string) {
    replaceBefore(press(input.slice(0, area.selectionStart), letter), area.selectionEnd);
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

  async function copy() {
    await navigator.clipboard.writeText(input);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="container">
  <div class="select-container input-box">
    <select bind:value={font} aria-label="글꼴" style:font-family={`'${font}'`}>
      {#each FONTS as { id, label }}
        <option value={id}>{label}</option>
      {/each}
    </select>
    <span class="select-arrow"></span>
  </div>

  <div class="textarea-container input-box" role="main">
    <textarea
      bind:this={area}
      bind:value={input}
      onkeydown={onKeydown}
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
    <button class="copy" onclick={copy} disabled={!input}>{copied ? '복사됨' : '복사'}</button>
  </div>

  <footer><a href="https://github.com/mkpoli/old-hangul-note">Old Hangul Note</a> by <a href="https://github.com/mkpoli">@mkpoli</a></footer>
</div>
