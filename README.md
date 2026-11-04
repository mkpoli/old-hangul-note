# 옛한글 노트 (Old Hangul Note)

A note for old Hangul, at [hangul.mkpo.li](https://hangul.mkpo.li).

Type or paste into the box and it displays in an LVT font. The second menu decides how the text is stored: standard Unicode, conjoining jamo, Hanyang PUA or compatibility letters. Copy gives you that form. Conversion comes from the [old-hangul-convert](https://github.com/mkpoli/old-hangul-convert) library, whose README lists the sources of its tables.
Pasted text, including Naver Dictionary's image glyphs, is converted to the chosen form.

```sh
bun install
bun run dev
bun test src
```

The keyboard follows Microsoft Old Hangul: two-set layout, with ㆍ ㅿ ㆁ ㆆ ᄼ ᄾ ᅎ ᅐ ᅔ ᅕ on the Shift layer.

## Fonts

Served as webfonts:

* [함초롬바탕 LVT](http://wiki.ktug.org/wiki/wiki.php/%ED%95%A8%EC%B4%88%EB%A1%AC%EC%B2%B4LVT)
* [함초롬돋움 LVT](http://wiki.ktug.org/wiki/wiki.php/%ED%95%A8%EC%B4%88%EB%A1%AC%EC%B2%B4LVT)
* [나눔명조 옛한글](https://hangeul.naver.com/font) (OFL-1.1, NHN Corporation), Version 1.0.0.9, woff2 from [@kfonts/nanum-myeongjo-yet-hangul 0.2.0](https://www.npmjs.com/package/@kfonts/nanum-myeongjo-yet-hangul)
* [나눔바른고딕 옛한글](https://hangeul.naver.com/font) (OFL-1.1, NHN Corporation), Version 1.0.0.4, woff2 from [@kfonts/nanum-barun-gothic-yet-hangul 0.2.0](https://www.npmjs.com/package/@kfonts/nanum-barun-gothic-yet-hangul)
* [Noto Serif KR](https://github.com/notofonts/noto-cjk/blob/9b0f1436e455/Serif/SubsetOTF/KR/NotoSerifKR-Regular.otf) (OFL-1.1, Adobe), Version 2.003, compressed to woff2 without other changes
* [Noto Sans KR](https://github.com/notofonts/noto-cjk/blob/165c01b46ea5/Sans/SubsetOTF/KR/NotoSansKR-Regular.otf) (OFL-1.1, Adobe), Version 2.004, compressed to woff2 without other changes

The Noto faces have no Hanyang PUA glyphs, so PUA text set in them is drawn with the Nanum face of the same style. The licence is in [`public/fonts/OFL.txt`](public/fonts/OFL.txt).
