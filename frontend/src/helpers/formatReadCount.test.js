import { describe, expect, it } from 'vitest';
import formatReadCount from './formatReadCount';

describe('formatReadCount 阅读量数字格式化工具函数', () => {
  it('小于1000的数值直接原样返回字符串', () => {
    expect(formatReadCount(100)).toBe('100');
    expect(formatReadCount(520)).toBe('520');
    expect(formatReadCount(999)).toBe('999');
  });

  it('大于等于1000且小于10000的数值自动添加千位分隔符', () => {
    expect(formatReadCount(1000)).toBe('1,000');
    expect(formatReadCount(1234)).toBe('1,234');
    expect(formatReadCount(5678)).toBe('5,678');
    expect(formatReadCount(9999)).toBe('9,999');
  });

  it('大于等于10000的数值自动转换为保留1位小数的X.X万格式', () => {
    expect(formatReadCount(10000)).toBe('1.0万');
    expect(formatReadCount(12345)).toBe('1.2万');
    expect(formatReadCount(34567)).toBe('3.5万');
    expect(formatReadCount(99999)).toBe('10.0万');
    expect(formatReadCount(100000)).toBe('10.0万');
    expect(formatReadCount(123456)).toBe('12.3万');
  });

  it('覆盖需求约定的前端随机生成阅读量的全取值范围100~100000所有边界场景', () => {
    expect(formatReadCount(100)).toBe('100');
    expect(formatReadCount(999)).toBe('999');
    expect(formatReadCount(1000)).toBe('1,000');
    expect(formatReadCount(9999)).toBe('9,999');
    expect(formatReadCount(10000)).toBe('1.0万');
    expect(formatReadCount(100000)).toBe('10.0万');
  });
});