/**
 * 去除 Markdown 标记，返回纯文本。
 * @param {string} body - 原始 Markdown 内容。
 * @returns {string} 纯文本内容。
 */
function stripMarkdown(body) {
  let text = body;

  // 去除代码块（``` ... ``` 或 ~~~ ... ~~~）
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/~~~[\s\S]*?~~~/g, '');

  // 去除行内代码（`code`）
  text = text.replace(/`[^`]*`/g, '');

  // 去除图片（![alt](url)）
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // 处理链接：[text](url) -> 保留 text
  text = text.replace(/\[([^\]]*)\]\(.*?\)/g, '$1');

  // 去除标题标记（行首的 # 及可选空格）
  text = text.replace(/^#+\s*/gm, '');

  // 去除引用标记（行首的 > 及可选空格）
  text = text.replace(/^>\s*/gm, '');

  // 去除列表标记（行首的 - * + 数字. 及空格）
  text = text.replace(/^[\-\*\+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // 去除分割线（独立行的 ---, ***, ___）
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // 去除加粗和斜体标记（保留内部文本）
  // 注意顺序：先处理加粗（** 或 __），再处理斜体（* 或 _）
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/__(.*?)__/g, '$1');
  text = text.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '$1');
  text = text.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '$1');

  return text;
}

/**
 * 计算给定字符串去除 Markdown 标记后的纯文本字数。
 * @param {string|null|undefined} body - 要计算字数的文章体。
 * @returns {number} 纯文本字符数。若 body 为 null/undefined 或非字符串则返回 0。
 */
export function getWordCount(body) {
  if (body === null || body === undefined) {
    return 0;
  }
  if (typeof body !== 'string') {
    return 0;
  }
  if (body.length === 0) {
    return 0;
  }

  const plainText = stripMarkdown(body);
  return plainText.length;
}