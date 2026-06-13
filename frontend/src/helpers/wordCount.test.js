import { describe, it, expect } from 'vitest';
import { wordCount } from './wordCount';

describe('wordCount', () => {
  it('should return 0 for empty string', () => {
    expect(wordCount('')).toBe(0);
  });

  it('should return 0 for null', () => {
    expect(wordCount(null)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(wordCount(undefined)).toBe(0);
  });

  it('should count all characters including Markdown syntax', () => {
    const body = '# Title\n\n**Bold**';
    // 字符: #,空格,T,i,t,l,e,\n,\n,*,*,B,o,l,d,*,* -> 共 17 个
    expect(wordCount(body)).toBe(body.length);
  });

  it('should count newlines correctly', () => {
    const body = 'line1\nline2\nline3';
    // 字符: l,i,n,e,1,\n,l,i,n,e,2,\n,l,i,n,e,3 -> 共 17 个
    expect(wordCount(body)).toBe(17);
  });

  it('should count HTML tags correctly', () => {
    const body = '<p>Hello</p>';
    // 字符: <,p,>,H,e,l,l,o,<,/,p,> -> 共 12 个
    expect(wordCount(body)).toBe(12);
  });

  it('should count Chinese characters correctly', () => {
    const body = '你好世界';
    // 字符: 你,好,世,界 -> 共 4 个
    expect(wordCount(body)).toBe(4);
  });

  it('should count mixed whitespace characters', () => {
    const body = 'a \t\n b';
    // 字符: a,空格,\t,\n,空格,b -> 共 6 个
    expect(wordCount(body)).toBe(6);
  });

  it('should count all characters in a typical article', () => {
    const body = 'Hello World!';
    expect(wordCount(body)).toBe(12);
  });
});