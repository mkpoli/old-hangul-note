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
