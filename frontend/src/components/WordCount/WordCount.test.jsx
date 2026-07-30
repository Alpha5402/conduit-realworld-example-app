import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WordCount from './WordCount';
import * as countWordsModule from '../../utils/countWords';

vi.mock('../../utils/countWords', () => ({
  countWords: vi.fn(),
}));

describe('WordCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the word count when body is a non-empty string', () => {
    countWordsModule.countWords.mockReturnValue(5);
    render(<WordCount body="Hello world" />);
    expect(screen.getByText('5 words')).toBeInTheDocument();
    expect(countWordsModule.countWords).toHaveBeenCalledWith('Hello world');
  });

  it('does not render anything when body is an empty string', () => {
    render(<WordCount body="" />);
    expect(screen.queryByText(/words/)).toBeNull();
    expect(countWordsModule.countWords).not.toHaveBeenCalled();
  });

  it('does not render anything when body is undefined', () => {
    render(<WordCount />);
    expect(screen.queryByText(/words/)).toBeNull();
    expect(countWordsModule.countWords).not.toHaveBeenCalled();
  });

  it('displays the correct count for a body with multiple spaces', () => {
    countWordsModule.countWords.mockReturnValue(3);
    render(<WordCount body="  hello   world  " />);
    expect(screen.getByText('3 words')).toBeInTheDocument();
    expect(countWordsModule.countWords).toHaveBeenCalledWith('  hello   world  ');
  });

  it('displays the count when body is a long Markdown string', () => {
    const markdown = '# Heading\n\n**bold** *italic*';
    countWordsModule.countWords.mockReturnValue(6);
    render(<WordCount body={markdown} />);
    expect(screen.getByText('6 words')).toBeInTheDocument();
    expect(countWordsModule.countWords).toHaveBeenCalledWith(markdown);
  });
});