<script lang="ts">
  import { PLACEHOLDER } from './lib/placeholder';

  const FONTS = [
    { id: 'HANBatang-LVT', label: '함초롬바탕 LVT' },
    { id: 'HANDotum-LVT', label: '함초롬돋움 LVT' },
  ];

  let input = $state('');
  let font = $state(FONTS[0]!.id);
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
      bind:value={input}
      lang="ko"
      spellcheck="false"
      placeholder={PLACEHOLDER}
      style:font-family={`'${font}'`}
    ></textarea>
  </div>

  <footer><a href="https://github.com/mkpoli/old-hangul-note">Old Hangul Note</a> by <a href="https://github.com/mkpoli">@mkpoli</a></footer>
</div>
