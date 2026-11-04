import { segment, toComposed, toJamo } from 'old-hangul-convert';

/** 두벌식 keys, with the old letters on Shift as on Microsoft Old Hangul. */
const KEYS: Record<string, string> = {
  q: 'ᄇ', Q: 'ᄇᄇ', w: 'ᄌ', W: 'ᄌᄌ', e: 'ᄃ', E: 'ᄃᄃ', r: 'ᄀ', R: 'ᄀᄀ', t: 'ᄉ', T: 'ᄉᄉ',
  y: 'ᅭ', Y: 'ᅭ', u: 'ᅧ', U: 'ᅧ', i: 'ᅣ', I: 'ᅣ', o: 'ᅢ', O: 'ᅤ', p: 'ᅦ', P: 'ᅨ',
  a: 'ᄆ', A: 'ᅀ', s: 'ᄂ', S: 'ᄂ', d: 'ᄋ', D: 'ᅌ', f: 'ᄅ', F: 'ᄅ', g: 'ᄒ', G: 'ᅙ',
  h: 'ᅩ', H: 'ᅩ', j: 'ᅥ', J: 'ᅥ', k: 'ᅡ', K: 'ᆞ', l: 'ᅵ', L: 'ᅵ',
  z: 'ᄏ', Z: 'ᄼ', x: 'ᄐ', X: 'ᄾ', c: 'ᄎ', C: 'ᅎ', v: 'ᄑ', V: 'ᅐ', b: 'ᅲ', B: 'ᅔ',
  n: 'ᅮ', N: 'ᅕ', m: 'ᅳ', M: 'ᅳ',
};

export const letterForKey = (key: string): string | undefined => KEYS[key];

const LEAD_FILLER = 'ᅟ';
const VOWEL_FILLER = 'ᅠ';
const TAIL_PAIRS = 'ᄀᆨᄂᆫᄃᆮᄅᆯᄆᆷᄇᆸᄉᆺᄋᆼᄌᆽᄎᆾᄏᆿᄐᇀᄑᇁᄒᇂᅀᇫᅌᇰᅙᇹ';
const TAIL_OF = new Map<string, string>();
const LEAD_OF = new Map<string, string>();
for (let i = 0; i < TAIL_PAIRS.length; i += 2) {
  TAIL_OF.set(TAIL_PAIRS[i]!, TAIL_PAIRS[i + 1]!);
  LEAD_OF.set(TAIL_PAIRS[i + 1]!, TAIL_PAIRS[i]!);
}

const OPEN_SYLLABLE =
  /(?:[가-힣]|[ᄀ-ᅟꥠ-ꥼ]+[ᅠ-ᆧힰ-ퟆ]*)[ᆨ-ᇿퟋ-ퟻ]*$/;

type Letters = { lead: string; vowel: string; tail: string };

const isVowel = (letter: string) => /[ᅠ-ᆧힰ-ퟆ]/.test(letter);

function parts(text: string): Letters {
  const syllable = segment(text)[0];
  if (syllable?.kind !== 'syllable') return { lead: '', vowel: '', tail: '' };
  const single = (run: string) => toJamo(run, { clusters: 'single' });
  return {
    lead: single(syllable.lead).replace(LEAD_FILLER, ''),
    vowel: single(syllable.vowel).replace(VOWEL_FILLER, ''),
    tail: single(syllable.tail),
  };
}

function render({ lead, vowel, tail }: Letters): string {
  if (!lead && !vowel) return '';
  return toComposed((lead || LEAD_FILLER) + (vowel || VOWEL_FILLER) + tail);
}

/** True when the letters join into one lead, vowel or tail. */
function isCluster(letters: string): boolean {
  const syllable = segment(letters)[0];
  if (syllable?.kind !== 'syllable') return false;
  return syllable.lead.length + syllable.vowel.length + syllable.tail.length === 1;
}

/** The text before the caret after typing one key's letters. */
export function press(before: string, typed: string): string {
  // A doubled key (Shift+T) closes a syllable that already has a final, so 말 + ㅆ stays apart.
  if (typed.length > 1) {
    const match = OPEN_SYLLABLE.exec(before);
    if (match && parts(match[0]).tail) return before + render({ lead: typed, vowel: '', tail: '' });
  }
  let text = before;
  for (const letter of typed) text = pressLetter(text, letter);
  return text;
}

function pressLetter(before: string, letter: string): string {
  const match = OPEN_SYLLABLE.exec(before);
  const open = match ? parts(match[0]) : { lead: '', vowel: '', tail: '' };
  const head = match ? before.slice(0, match.index) : before;
  const closed = match ? head + render(open) : before;

  if (isVowel(letter)) {
    if (open.tail) {
      // The next syllable takes the last consonant, or both letters of a doubled one.
      const size = open.tail.at(-1) === open.tail.at(-2) ? 2 : 1;
      const moved = [...open.tail.slice(-size)].map((tail) => LEAD_OF.get(tail) ?? '').join('');
      const shorter = { ...open, tail: open.tail.slice(0, -size) };
      return head + render(shorter) + render({ lead: moved, vowel: letter, tail: '' });
    }
    if (open.lead && !open.vowel) return head + render({ ...open, vowel: letter });
    if (open.vowel && isCluster(open.vowel + letter)) {
      return head + render({ ...open, vowel: open.vowel + letter });
    }
    return closed + render({ lead: '', vowel: letter, tail: '' });
  }

  if (!open.vowel && open.lead && isCluster(open.lead + letter)) {
    return head + render({ ...open, lead: open.lead + letter });
  }
  const tail = TAIL_OF.get(letter);
  if (open.lead && open.vowel && tail && isCluster(open.tail + tail)) {
    return head + render({ ...open, tail: open.tail + tail });
  }
  return closed + render({ lead: letter, vowel: '', tail: '' });
}

/** The text before the caret after Backspace: one letter of the open syllable goes. */
export function backspace(before: string): string | undefined {
  const match = OPEN_SYLLABLE.exec(before);
  if (!match) return undefined;
  const open = parts(match[0]);
  if (open.tail) open.tail = open.tail.slice(0, -1);
  else if (open.vowel) open.vowel = open.vowel.slice(0, -1);
  else open.lead = open.lead.slice(0, -1);
  return before.slice(0, match.index) + render(open);
}
