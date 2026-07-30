/**
 * Counts words in the given article body string.
 * Splits by whitespace, preserving all Markdown/HTML, and returns the number of words.
 * Returns 0 for falsy or non-string input.
 * @param {string} body - The raw article body.
 * @returns {number}
 */
export function countWords(body) {
  if (typeof body !== 'string' || !body.trim()) {
    return 0;
  }
  const words = body.trim().split(/\s+/);
  return words.length;
}