export default function formatReadCount(count) {
  const num = Number(count);
  if (isNaN(num) || num < 0) {
    return '0';
  }
  if (num >= 10000) {
    const wanValue = (num / 10000).toFixed(1);
    return `${wanValue}万`;
  }
  if (num >= 1000) {
    return num.toLocaleString('en-US');
  }
  return String(num);
}