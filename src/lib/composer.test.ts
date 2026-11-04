import { expect, test } from 'bun:test';
import { backspace, letterForKey, press } from './composer';

const type = (keys: string) => [...keys].reduce((text, key) => press(text, letterForKey(key)!), '');

test.each([
  ['GK', 'ᅙᆞ'],
  ['gK', 'ᄒᆞ'],
  ['gKs', 'ᄒᆞᆫ'],
  ['gKdu', 'ᄒᆞ여'],
  ['rKl', 'ᄀᆡ'],
  ['rKK', 'ᄀᆢ'],
  ['Ak', 'ᅀᅡ'],
  ['trna', 'ᄭᅮᆷ'],
  ['qdk', 'ᄫᅡ'],
  ['qtrk', 'ᄢᅡ'],
  ['gksrmf', '한글'],
  ['skfkt', '나랏'],
  ['akfTKal', '말ᄊᆞ미'],
  ['tKfk', 'ᄉᆞ라'],
  ['rkTk', '가싸'],
])('%s', (keys, text) => {
  expect(type(keys)).toBe(text);
});

test('a space closes the syllable', () => {
  expect(press('가 ', letterForKey('r')!).startsWith('가 ᄀ')).toBe(true);
});

test('backspace removes one letter', () => {
  expect(backspace('ᄒᆞᆫ')).toBe('ᄒᆞ');
  expect(backspace('한')).toBe('하');
  expect(backspace('abc')).toBeUndefined();
  expect(backspace(backspace('ᄒᆞ')!)).toBe('');
});
