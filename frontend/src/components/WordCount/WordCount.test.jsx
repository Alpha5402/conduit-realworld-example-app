import { render, screen } from '@testing-library/react';
import WordCount from './WordCount';

describe('WordCount component', () => {
  it('renders the correct word count and aria-label for a non-empty body', () => {
    const body = 'Hello this is test';
    // The word count of this body (pure text): 18 characters
    render(<WordCount body={body} />);
    const span = screen.getByText('18字');
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute('aria-label');
    expect(span.getAttribute('aria-label')).toContain('18字');
  });

  it('renders "0字" and an aria-label when body is an empty string', () => {
    render(<WordCount body="" />);
    const span = screen.getByText('0字');
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute('aria-label');
    expect(span.getAttribute('aria-label')).toContain('0字');
  });

  it('renders "0字" and an aria-label when body is undefined', () => {
    render(<WordCount body={undefined} />);
    const span = screen.getByText('0字');
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute('aria-label');
    expect(span.getAttribute('aria-label')).toContain('0字');
  });

  it('renders "0字" and an aria-label when body is null', () => {
    render(<WordCount body={null} />);
    const span = screen.getByText('0字');
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute('aria-label');
    expect(span.getAttribute('aria-label')).toContain('0字');
  });

  it('does not throw for any edge case', () => {
    expect(() => render(<WordCount body="Some text" />)).not.toThrow();
    expect(() => render(<WordCount body="" />)).not.toThrow();
    expect(() => render(<WordCount body={null} />)).not.toThrow();
    expect(() => render(<WordCount body={undefined} />)).not.toThrow();
    expect(() => render(<WordCount />)).not.toThrow();
  });

  it('renders the span with class "word-count"', () => {
    render(<WordCount body="Test" />);
    const span = screen.getByText('4字');
    expect(span).toHaveClass('word-count');
  });

  it('matches snapshot for a typical body', () => {
    const { asFragment } = render(<WordCount body="Some article body with 35 characters ______" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot for empty body', () => {
    const { asFragment } = render(<WordCount body="" />);
    expect(asFragment()).toMatchSnapshot();
  });
});