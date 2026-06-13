import { describe, it, expect } from 'vitest';
import { getWordCount } from './wordCount';

describe('getWordCount', () => {
  // AC3: 空字符串显示“0字”
  it('当 body 为空字符串时返回 0', () => {
    expect(getWordCount('')).toBe(0);
  });

  // AC4: body 为 null 时返回 0
  it('当 body 为 null 时返回 0', () => {
    expect(getWordCount(null)).toBe(0);
  });

  // AC4: body 为 undefined 时返回 0
  it('当 body 为 undefined 时返回 0', () => {
    expect(getWordCount(undefined)).toBe(0);
  });

  // AC8: 纯文本（无 Markdown）返回字符数
  it('纯文本字符串返回字符数', () => {
    const body = 'Hello World';
    expect(getWordCount(body)).toBe(11);
  });

  // AC8: 包含 Markdown 标题 (#)
  it('去除 Markdown 标题标记后统计纯文本字符数', () => {
    const body = '# Title\nContent';
    expect(getWordCount(body)).toBe(12);
  });

  // AC8: 包含加粗 (**text**)
  it('去除加粗标记后统计纯文本字符数', () => {
    const body = 'This is **bold** text';
    expect(getWordCount(body)).toBe(17);
  });

  // AC8: 包含斜体 (*text*)
  it('去除斜体标记后统计纯文本字符数', () => {
    const body = 'Here *italic* word';
    expect(getWordCount(body)).toBe(16);
  });

  // AC8: 包含行内代码 (`code`)
  it('去除行内代码反引号后统计纯文本字符数', () => {
    const body = 'Use `code` here';
    expect(getWordCount(body)).toBe(13);
  });

  // AC8: 包含多行代码块 (```)
  it('去除多行代码块后统计纯文本字符数', () => {
    const body = '```\na\n```\nb';
    expect(getWordCount(body)).toBe(3);
  });

  // AC8: 包含链接 [text](url)
  it('去除链接标记后统计纯文本字符数', () => {
    const body = 'Click [here](http://example.com) to continue';
    expect(getWordCount(body)).toBe(22);
  });

  // AC8: 包含图片 ![alt](url)
  it('去除图片标记后统计纯文本字符数', () => {
    const body = 'A ![image](http://example.com/pic.png) B';
    expect(getWordCount(body)).toBe(3);
  });

  // AC8: 包含无序列表 (* or -)
  it('去除列表标记后统计纯文本字符数', () => {
    const body = '- item1\n- item2\n- item3';
    expect(getWordCount(body)).toBe(17);
  });

  // AC8: 包含有序列表 (1.)
  it('去除有序列表标记后统计纯文本字符数', () => {
    const body = '1. first\n2. second\n3. third';
    expect(getWordCount(body)).toBe(18);
  });

  // AC8: 包含引用 (>)
  it('去除引用标记后统计纯文本字符数', () => {
    const body = '> quoted text\n> more quoted';
    expect(getWordCount(body)).toBe(25);
  });

  // AC8: 包含分割线 (---)
  it('去除水平线标记后统计纯文本字符数', () => {
    const body = 'Top\n---\nBottom';
    expect(getWordCount(body)).toBe(11);
  });

  // AC8: 混合多种标记
  it('去除所有 Markdown 标记后统计纯文本字符数', () => {
    const body = '# Title\n\n**bold** and *italic* with `code` and [link](url)';
    expect(getWordCount(body)).toBe(42);
  });

  // AC2, AC5: 非字符串类型（数字）返回 0
  it('当 body 是数字时返回 0', () => {
    expect(getWordCount(123)).toBe(0);
  });

  // 非字符串类型（对象）返回 0
  it('当 body 是对象时返回 0', () => {
    expect(getWordCount({})).toBe(0);
  });

  // 非字符串类型（布尔值）返回 0
  it('当 body 是布尔值时返回 0', () => {
    expect(getWordCount(true)).toBe(0);
  });
});