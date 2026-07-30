import { describe, it, expect } from 'vitest';
import { countWords } from './wordCount';

describe('countWords', () => {
  it('should return the correct word count for a simple sentence', () => {
    expect(countWords('hello world')).toBe(2);
  });

  it('should return 0 for an empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('should return 0 for null', () => {
    expect(countWords(null)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(countWords(undefined)).toBe(0);
  });

  it('should handle multiple consecutive spaces', () => {
    expect(countWords('hello   world')).toBe(2);
  });

  it('should handle leading and trailing spaces', () => {
    expect(countWords('  hello world  ')).toBe(2);
  });

  it('should handle text containing only spaces', () => {
    expect(countWords('     ')).toBe(0);
  });

  it('should return 0 for a string with just a newline', () => {
    expect(countWords('\n')).toBe(0);
  });

  it('should not crash on very long text and return correct count', () => {
    const longText = 'a '.repeat(10000).trim();
    expect(countWords(longText)).toBe(10000);
  });

  it('should count words in text containing Markdown syntax', () => {
    const md = '**bold** and *italic*';
    expect(countWords(md)).toBe(3);
  });

  it('should treat Markdown headings as separate words', () => {
    expect(countWords('# heading')).toBe(2);
  });

  it('should treat Markdown links as a single word when no spaces', () => {
    expect(countWords('[link](url)')).toBe(1);
  });

  it('should treat HTML tags as words separated by spaces', () => {
    expect(countWords('<p>text</p>')).toBe(1);
  });

  it('should count HTML tags and content separately when separated by spaces', () => {
    expect(countWords('<p> hello </p>')).toBe(3);
  });

  it('should return 0 for a number input', () => {
    expect(countWords(123)).toBe(0);
  });

  it('should return 0 for a boolean input', () => {
    expect(countWords(true)).toBe(0);
  });

  it('should return 0 for an object input', () => {
    expect(countWords({ body: 'text' })).toBe(0);
  });
});