const BLOCKS = 'address,article,aside,blockquote,dd,div,dl,dt,figure,footer,h1,h2,h3,h4,h5,h6,header,li,main,nav,ol,p,pre,section,table,tr,ul';

/** The text of copied HTML, keeping the line breaks a reader saw. */
export function plainText(html: string): string {
  const { body } = new DOMParser().parseFromString(html, 'text/html');
  body.querySelectorAll('script,style,title,meta,link').forEach((node) => node.remove());
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement?.closest('pre')) node.nodeValue = node.nodeValue!.replace(/\s+/g, ' ');
  }
  body.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
  body.querySelectorAll(BLOCKS).forEach((node) => node.append('\n'));
  return body.textContent!.replace(/ *\n */g, '\n').replace(/\n{2,}/g, '\n').trim();
}
