import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WordCount from './WordCount';

describe('WordCount 组件', () => {
  it('当 count 为 0 时显示 "字数: 0"', () => {
    render(<WordCount count={0} />);
    expect(screen.getByText('字数: 0')).toBeInTheDocument();
  });

  it('当 count 为正整数时显示正确的字数', () => {
    render(<WordCount count={12345} />);
    expect(screen.getByText('字数: 12345')).toBeInTheDocument();
  });

  it('当 count 为 undefined 时显示 "字数: 0"', () => {
    render(<WordCount count={undefined} />);
    expect(screen.getByText('字数: 0')).toBeInTheDocument();
  });

  it('当 count 为 null 时显示 "字数: 0"', () => {
    render(<WordCount count={null} />);
    expect(screen.getByText('字数: 0')).toBeInTheDocument();
  });

  it('具有 min-width: 80px 样式以避免 CLS', () => {
    const { container } = render(<WordCount count={10} />);
    const div = container.firstChild;
    expect(div).toHaveStyle('min-width: 80px');
  });
});