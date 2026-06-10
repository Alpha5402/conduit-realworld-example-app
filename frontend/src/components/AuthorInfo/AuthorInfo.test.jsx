import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuthorInfo from './AuthorInfo';

describe('AuthorInfo Component', () => {
  const mockAuthor = {
    username: 'test-user',
    image: 'https://example.com/avatar.jpg',
  };
  const mockCreatedAt = '2024-05-20T12:00:00Z';

  it('should render basic author information correctly', () => {
    render(<AuthorInfo author={mockAuthor} createdAt={mockCreatedAt} readCount={500} />);
    
    expect(screen.getByAltText('test-user')).toBeInTheDocument();
    expect(screen.getByText('test-user')).toBeInTheDocument();
    expect(screen.getByText(/May 20, 2024/)).toBeInTheDocument();
  });

  it('should render read count module with existing eye icon correctly', () => {
    render(<AuthorInfo author={mockAuthor} createdAt={mockCreatedAt} readCount={1234} />);
    
    const eyeIcon = document.querySelector('i.ion-eye');
    expect(eyeIcon).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should display raw number for read count less than 1000 without extra formatting', () => {
    render(<AuthorInfo author={mockAuthor} createdAt={mockCreatedAt} readCount={899} />);
    
    expect(screen.getByText('899')).toBeInTheDocument();
  });

  it('should add thousand separator automatically for read count between 1000 and 9999', () => {
    render(<AuthorInfo author={mockAuthor} createdAt={mockCreatedAt} readCount={5678} />);
    
    expect(screen.getByText('5,678')).toBeInTheDocument();
  });

  it('should format read count >= 10000 to X.X wan format correctly', () => {
    render(<AuthorInfo author={mockAuthor} createdAt={mockCreatedAt} readCount={12500} />);
    
    expect(screen.getByText('1.3万')).toBeInTheDocument();
  });

  it('should render 10000 correctly as 1.0 wan format', () => {
    render(<AuthorInfo author={mockAuthor} createdAt={mockCreatedAt} readCount={10000} />);
    
    expect(screen.getByText('1.0万')).toBeInTheDocument();
  });

  it('should not have layout overflow or misalignment issues with surrounding elements', () => {
    const { container } = render(<AuthorInfo author={mockAuthor} createdAt={mockCreatedAt} readCount={99999} />);
    const metaContainer = container.querySelector('.article-meta');
    expect(metaContainer).toBeInTheDocument();
    expect(metaContainer?.scrollWidth).toBeLessThanOrEqual(metaContainer?.clientWidth + 1);
  });
});