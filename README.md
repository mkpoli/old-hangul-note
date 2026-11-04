# 옛한글 노트 (Old Hangul Note)

Types, displays and converts old Hangul in the browser, at [hangul.mkpo.li](https://hangul.mkpo.li).

Paste text in any mix of Hanyang PUA, conjoining jamo and Naver Dictionary's image glyphs, and the page reads it, shows it in an LVT font, and writes it out as standard Unicode, conjoining jamo, Hanyang PUA or compatibility letters. Conversion comes from the [old-hangul-convert](https://github.com/mkpoli/old-hangul-convert) library.

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
