<script lang="ts">
  import {
    analyze,
    fromCompatibility,
    fromDotTones,
    fromNaverImages,
    segment,
    stripTones,
    toCompatibility,
    toComposed,
    toDotTones,
    toHanyang,
    toJamo,
    type Syllable,
  } from 'old-hangul-convert';
  import { backspace, letterForKey, press } from './lib/composer';
  import { plainText } from './lib/paste';

  const SAMPLE = `솅조ᇰ엉졩 훈민져ᇰᅙᅳᆷ
나랏ᄆᆞᆯᄊᆞ미 듕귁에 달아 문ᄍᆞᆼ와로 서르 ᄉᆞᄆᆞᆺ디 아니ᄒᆞᆯᄊᆡ 이런 젼ᄎᆞ로 어린 ᄇᆡᆨ셔ᇰ이 니르고져 호ᇙ배이셔도 ᄆᆞᄎᆞᆷ내 제 ᄠᅳ들 시러 펴디 몯 ᄒᆞᇙ 노미 하니라. 내 이ᄅᆞᆯ 윙ᄒᆞ야 어엿비 너겨 새로 스믈 여듧 ᄍᆞᆼᄅᆞᆯ ᄆᆡᇰᄀᆞ노니 사ᄅᆞᆷ마다 ᄒᆡᅇᅧ 수ᄫᅵ 니겨 날로 ᄡᅮ메 뼌ᅙᅡᆫ킈 ᄒᆞ고져 ᄒᆞᇙ ᄯᆞᄅᆞ미니라.`;

  const FONTS = [
    { id: 'HCR Batang LVT', label: '함초롬바탕' },
    { id: 'HCR Dotum LVT', label: '함초롬돋움' },
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

  let input = $state(stored('note', SAMPLE));
  let font = $state(stored('font', FONTS[0]!.id));
  let keyboard = $state(stored('keyboard', '') === 'on');
  let readCompat = $state(false);
  let readDots = $state(false);
  let tones = $state<'marks' | 'dots' | 'none'>('marks');
  let singleLetters = $state(false);
  let puaJamo = $state(false);
  let notice = $state('');
  let copied = $state('');
  let picked = $state<number | null>(null);
  let area: HTMLTextAreaElement;

  $effect(() => store('note', input));
  $effect(() => store('font', font));
  $effect(() => store('keyboard', keyboard ? 'on' : ''));

  const decoded = $derived.by(() => {
    const read = fromNaverImages(input);
    return read === input ? input : read.replace(/<[^>]+>/g, '');
  });
  const text = $derived.by(() => {
    let read = decoded;
    if (readCompat) read = fromCompatibility(read);
    if (readDots) read = fromDotTones(read);
    return read;
  });
  const marked = $derived(tones === 'none' ? stripTones(text) : tones === 'dots' ? toDotTones(text) : text);
  const report = $derived(analyze(decoded));
  const missing = $derived(analyze(text).missingFromHanyang);
  const parts = $derived(segment(text));
  const selected = $derived(picked === null ? undefined : parts[picked]);

  const summary = $derived(
    (
      [
        ['한양 PUA', report.hanyangSyllables + report.hanyangJamo],
        ['첫가끝 자모', report.conjoiningJamo],
        ['완성형', report.precomposed],
        ['호환 자모', report.compatibility],
        ['방점', report.toneMarks],
        ['구결자', report.gugyeol],
      ] as [string, number][]
    ).filter(([, count]) => count > 0),
  );
  const compatUnread = $derived(!readCompat && fromCompatibility(decoded) !== decoded);
  const dotsUnread = $derived(!readDots && fromDotTones(decoded) !== toComposed(decoded));

  const outputs = $derived([
    {
      id: 'nfc',
      title: '표준 유니코드',
      detail: '현대 글자는 완성형, 옛글자는 첫가끝으로 적습니다(NFC). 새 글에는 이 형식을 쓰세요.',
      write: toComposed,
    },
    {
      id: 'jamo',
      title: '첫가끝 풀어쓰기',
      detail: '현대 글자까지 모두 첫가끝 자모로 적습니다(NFD).',
      write: (chars: string) => toJamo(chars, { clusters: singleLetters ? 'single' : 'cluster' }),
    },
    {
      id: 'hanyang',
      title: '한양 PUA',
      detail: '우리말샘, 네이버 사전, 옛 한글 문서가 쓰는 사용자 정의 영역 코드입니다. 한양 PUA 글꼴이 있어야 보입니다.',
      write: (chars: string) => toHanyang(chars, { unmapped: puaJamo ? 'jamo' : 'keep' }),
    },
    {
      id: 'compat',
      title: '호환 자모',
      detail: '글꼴과 상관없이 보이지만 음절 경계가 사라집니다.',
      write: toCompatibility,
    },
  ]);

  const firstOld = $derived.by(() => {
    for (const part of parts) {
      if (part.kind === 'syllable') {
        const chars = toComposed(part.lead + part.vowel + part.tail);
        if (analyze(chars).oldSyllables) return chars;
      }
    }
    return undefined;
  });

  const codes = (chars: string) =>
    [...chars].map((char) => `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
  const isPua = (chars: string) => /[\uE000-\uF8FF]/.test(chars);
  const inspectRows = (syllable: Syllable) => {
    const hanyang = toHanyang(toComposed(syllable.lead + syllable.vowel + syllable.tail));
    return [
      ['첫소리', syllable.lead],
      ['가운뎃소리', syllable.vowel],
      ['끝소리', syllable.tail],
      ['한양 PUA', isPua(hanyang) ? hanyang : ''],
    ].filter(([, value]) => value) as [string, string][];
  };

  function replaceBefore(next: string, end: number) {
    const after = input.slice(end);
    input = next + after;
    queueMicrotask(() => {
      area.value = input;
      area.selectionStart = area.selectionEnd = next.length;
    });
  }

  function typeLetter(letter: string) {
    const start = area.selectionStart;
    const end = area.selectionEnd;
    replaceBefore(press(input.slice(0, start), letter), end);
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
    const html = event.clipboardData?.getData('text/html');
    if (!html) return;
    const read = fromNaverImages(html);
    if (read === html) return;
    event.preventDefault();
    const count = html.length && [...html.matchAll(/<img\b/gi)].length - [...read.matchAll(/<img\b/gi)].length;
    replaceBefore(input.slice(0, area.selectionStart) + plainText(read), area.selectionEnd);
    notice = `네이버 이미지 글자 ${count}자를 읽었습니다.`;
  }

  async function copy(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    copied = id;
    setTimeout(() => {
      if (copied === id) copied = '';
    }, 1500);
  }
</script>

<div class="page" style:--display={`'${font}', serif`}>
  <header>
    <h1>옛한글 노트</h1>
    <label class="font">
      글꼴
      <select bind:value={font}>
        {#each FONTS as { id, label }}
          <option value={id}>{label}</option>
        {/each}
      </select>
    </label>
  </header>

  <main>
    <section class="pane" aria-labelledby="input-title">
      <div class="pane-head">
        <h2 id="input-title">입력</h2>
        <button class="quiet" onclick={() => { input = ''; picked = null; area.focus(); }}>지우기</button>
      </div>
      <textarea
        bind:this={area}
        bind:value={input}
        onkeydown={onKeydown}
        onpaste={onPaste}
        lang="ko"
        spellcheck="false"
        placeholder="옛한글을 붙여 넣으세요. 네이버 사전에서 복사한 이미지 글자, 한양 PUA, 첫가끝 모두 읽습니다."
      ></textarea>
      <div class="keys">
        <label class="toggle"><input type="checkbox" bind:checked={keyboard} /> 옛한글 자판</label>
        <div class="palette" role="group" aria-label="옛글자">
          {#each PALETTE as [key, letter, shown]}
            <button
              class="letter"
              title={keyboard ? `Shift+${key}` : undefined}
              onmousedown={(event) => event.preventDefault()}
              onclick={() => typeLetter(letter)}
            >{shown}</button>
          {/each}
        </div>
      </div>
      {#if keyboard}
        <p class="hint">두벌식 영문 자판 상태에서 치세요. 옛글자는 Shift 칸에 있고, ㅅ ㄱ을 이어 치면 ᄭ이 됩니다. 한글 입력기는 꺼 두세요.</p>
      {/if}
      <p class="summary">
        {#if summary.length}
          {summary.map(([label, count]) => `${label} ${count.toLocaleString()}자`).join(' · ')}
        {:else}
          비어 있습니다.
        {/if}
      </p>
      {#if notice}<p class="note">{notice}</p>{/if}
      {#if compatUnread}
        <label class="note"><input type="checkbox" bind:checked={readCompat} /> 호환 자모(ㅅㆍㄹ)를 음절로 묶어 읽기. 낱자 사이 음절 경계는 추정합니다.</label>
      {:else if readCompat}
        <label class="note"><input type="checkbox" bind:checked={readCompat} /> 호환 자모를 음절로 묶어 읽는 중</label>
      {/if}
      {#if dotsUnread}
        <label class="note"><input type="checkbox" bind:checked={readDots} /> 글자 앞의 · : 를 방점으로 읽기</label>
      {:else if readDots}
        <label class="note"><input type="checkbox" bind:checked={readDots} /> · : 를 방점으로 읽는 중</label>
      {/if}
      {#if report.gugyeol}
        <p class="warn">구결자 {report.gugyeol}자는 유니코드에 대응 글자가 없어 그대로 둡니다.</p>
      {/if}
      {#if report.otherPua.length}
        <p class="warn">한양 PUA가 아닌 사용자 정의 문자 {report.otherPua.length}종은 읽지 못해 그대로 둡니다: {codes(report.otherPua.slice(0, 6).join(''))}{report.otherPua.length > 6 ? ' …' : ''}</p>
      {/if}
    </section>

    <section class="pane" aria-labelledby="reading-title">
      <div class="pane-head">
        <h2 id="reading-title">보기</h2>
        <span class="muted">글자를 누르면 코드를 보여 줍니다</span>
      </div>
      <div class="reading" lang="ko">
        {#each parts as part, i}{#if part.kind === 'other'}{part.text}{:else}<button
            class="syllable"
            class:picked={picked === i}
            onclick={() => (picked = picked === i ? null : i)}
          >{toComposed(part.lead + part.vowel + part.tail)}</button>{/if}{/each}
      </div>
      {#if selected?.kind === 'syllable'}
        <dl class="inspect">
          <div class="big" lang="ko">{toComposed(selected.lead + selected.vowel + selected.tail)}</div>
          {#each inspectRows(selected) as [label, value]}
            <div><dt>{label}</dt><dd><span lang="ko">{isPua(value) ? '' : value}</span> <code>{codes(value)}</code></dd></div>
          {/each}
        </dl>
      {/if}
    </section>
  </main>

  <section class="outputs" aria-labelledby="outputs-title">
    <div class="outputs-head">
      <h2 id="outputs-title">변환</h2>
      <div class="segmented" role="radiogroup" aria-label="방점">
        <span class="muted">방점</span>
        {#each [['marks', '유니코드 방점'], ['dots', '점(· :)'], ['none', '지우기']] as [value, label]}
          <label class:on={tones === value}><input type="radio" bind:group={tones} {value} />{label}</label>
        {/each}
      </div>
    </div>
    <div class="cards">
      {#each outputs as output (output.id)}
        <article class="card">
          <div class="card-head">
            <h3>{output.title}</h3>
            <button class="copy" onclick={() => copy(output.id, output.write(marked))}>{copied === output.id ? '복사됨' : '복사'}</button>
          </div>
          <p class="detail">{output.detail}</p>
          <div class="value" lang="ko">{output.write(marked)}</div>
          {#if firstOld}
            <p class="sample"><span lang="ko">{firstOld}</span> <code>{codes(output.write(firstOld))}</code></p>
          {/if}
          {#if output.id === 'jamo'}
            <label class="option"><input type="checkbox" bind:checked={singleLetters} /> 겹자모를 낱자로 풀기 (ᄢ → ᄇᄉᄀ)</label>
          {:else if output.id === 'hanyang'}
            {#if missing.length}
              <p class="warn">한양 PUA에 없는 글자 {missing.length}종: <span lang="ko" class="inline">{missing.slice(0, 12).join(' ')}</span></p>
              <label class="option"><input type="checkbox" bind:checked={puaJamo} /> 이 글자들을 PUA 자모로 적기 (기본은 표준 첫가끝)</label>
            {/if}
          {/if}
        </article>
      {/each}
    </div>
  </section>

  <footer>
    <a href="https://github.com/mkpoli/old-hangul-note">옛한글 노트</a>,
    <a href="https://github.com/mkpoli/old-hangul-convert">old-hangul-convert</a> by
    <a href="https://github.com/mkpoli">@mkpoli</a>.
    글꼴: <a href="http://wiki.ktug.org/wiki/wiki.php/%ED%95%A8%EC%B4%88%EB%A1%AC%EC%B2%B4LVT">함초롬체 LVT</a>.
    변환표: <a href="https://web.archive.org/web/2016/http://faq.ktug.or.kr/faq/HanyangPuaTableProject">KTUG 한양 PUA 변환 테이블</a>.
    예문: 『훈민정음』 언해본 서문.
  </footer>
</div>

<style>
  .page {
    max-width: 1180px;
    margin: 0 auto;
    padding: 20px 24px 32px;
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }
  h1 {
    margin: 0;
    font: 700 24px/1.3 var(--display);
  }
  h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
  }
  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
  }
  .font {
    color: var(--soft);
    font-size: 13px;
  }
  select {
    margin-left: 4px;
    padding: 4px 6px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 6px;
  }
  main {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .pane {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pane-head,
  .card-head,
  .outputs-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    min-height: 28px;
  }
  .muted {
    color: var(--soft);
    font-size: 13px;
  }
  textarea,
  .reading {
    width: 100%;
    height: 340px;
    padding: 14px 16px;
    overflow: auto;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 10px;
    font: 21px/1.75 var(--display);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  textarea {
    resize: vertical;
  }
  textarea:focus {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }
  .syllable {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    cursor: pointer;
    border-radius: 3px;
  }
  .syllable:hover {
    background: var(--sunken);
  }
  .syllable.picked {
    background: var(--mark);
  }
  .keys {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .toggle {
    font-size: 14px;
    white-space: nowrap;
  }
  .palette {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .letter {
    width: 34px;
    height: 34px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 6px;
    font: 18px/1 var(--display);
    cursor: pointer;
  }
  .letter:hover,
  .copy:hover,
  .quiet:hover {
    background: var(--sunken);
  }
  .quiet,
  .copy {
    padding: 2px 10px;
    background: none;
    border: 1px solid var(--line);
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  }
  .hint,
  .summary,
  .note,
  .warn,
  .detail,
  .option {
    margin: 0;
    font-size: 13px;
    color: var(--soft);
  }
  .note,
  .option {
    display: block;
    color: var(--ink);
  }
  .warn {
    color: var(--warn);
  }
  .inline {
    font: 15px var(--display);
  }
  .inspect {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 20px;
    margin: 0;
    padding: 10px 14px;
    background: var(--sunken);
    border-radius: 10px;
  }
  .inspect .big {
    font: 34px/1.2 var(--display);
  }
  .inspect dt {
    font-size: 12px;
    color: var(--soft);
  }
  .inspect dd {
    margin: 0;
    font: 16px var(--display);
  }
  code {
    font: 12px var(--mono);
  }
  .outputs {
    margin-top: 24px;
  }
  .segmented {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .segmented label {
    padding: 2px 10px;
    border: 1px solid var(--line);
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  }
  .segmented label.on {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-ink);
  }
  .segmented input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .segmented label:focus-within {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 10px;
  }
  .card {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 10px;
  }
  .sample {
    margin: 0;
    padding-top: 8px;
    border-top: 1px solid var(--line);
    color: var(--soft);
    overflow-wrap: anywhere;
  }
  .sample span {
    margin-right: 4px;
    color: var(--ink);
    font: 16px var(--display);
  }
  .value {
    flex: 1;
    max-height: 190px;
    overflow: auto;
    font: 18px/1.7 var(--display);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  footer {
    margin-top: 24px;
    color: var(--soft);
    font-size: 12px;
  }
  @media (max-width: 760px) {
    .page {
      padding: 14px 16px 24px;
    }
    main,
    .cards {
      grid-template-columns: minmax(0, 1fr);
    }
    textarea,
    .reading {
      height: 240px;
      font-size: 19px;
    }
  }
</style>
