import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticlesPreview from './ArticlesPreview';
import updateArticle from '../../services/updateArticle';

jest.mock('../../services/updateArticle');

const mockArticles = [
  {
    slug: 'test-draft-1',
    title: 'Draft Article 1',
    description: 'Description of draft 1',
    status: 'draft',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    slug: 'test-published-1',
    title: 'Published Article 1',
    description: 'Description of published 1',
    status: 'published',
    createdAt: '2025-01-02T00:00:00.000Z'
  }
];

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders article list with status labels', () => {
  render(<ArticlesPreview articles={mockArticles} />);

  expect(screen.getByText('Draft Article 1')).toBeInTheDocument();
  expect(screen.getByText('Published Article 1')).toBeInTheDocument();
  expect(screen.getByText('Description of draft 1')).toBeInTheDocument();
  expect(screen.getByText('Description of published 1')).toBeInTheDocument();
});

test('shows publish button only for draft articles', () => {
  render(<ArticlesPreview articles={mockArticles} />);

  const publishButtons = screen.getAllByRole('button', { name: /发布/i });
  expect(publishButtons).toHaveLength(1);

  const publishedCard = screen.getByText('Published Article 1').closest('[data-testid="article-preview"]');
  expect(publishedCard?.querySelector('button[aria-label="发布"]')).toBeNull();
});

test('calls updateArticle with correct parameters on publish click', async () => {
  const updatedArticle = { ...mockArticles[0], status: 'published' };
  updateArticle.mockResolvedValueOnce({ article: updatedArticle });

  render(<ArticlesPreview articles={mockArticles} />);

  const publishButton = screen.getByRole('button', { name: /发布/i });
  fireEvent.click(publishButton);

  await waitFor(() => {
    expect(updateArticle).toHaveBeenCalledWith('test-draft-1', { status: 'published' });
  });
});

test('removes the draft from the list after successful publish', async () => {
  const updatedArticle = { ...mockArticles[0], status: 'published' };
  updateArticle.mockResolvedValueOnce({ article: updatedArticle });

  render(<ArticlesPreview articles={mockArticles} />);

  // Initially two articles
  expect(screen.getAllByTestId('article-preview')).toHaveLength(2);

  const publishButton = screen.getByRole('button', { name: /发布/i });
  fireEvent.click(publishButton);

  await waitFor(() => {
    expect(screen.getAllByTestId('article-preview')).toHaveLength(1);
  });

  // Remaining article should be the published one
  expect(screen.getByText('Published Article 1')).toBeInTheDocument();
  expect(screen.queryByText('Draft Article 1')).toBeNull();
});

test('shows error message when publish fails', async () => {
  const errorMessage = 'Publish failed';
  updateArticle.mockRejectedValueOnce(new Error(errorMessage));

  render(<ArticlesPreview articles={mockArticles} />);

  const publishButton = screen.getByRole('button', { name: /发布/i });
  fireEvent.click(publishButton);

  await waitFor(() => {
    const errorElement = screen.getByTestId('error-message');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
  });
});

test('does not show publish button for published articles', () => {
  const publishedOnly = [
    {
      slug: 'pub-1',
      title: 'Published Only',
      description: 'Desc',
      status: 'published',
      createdAt: '2025-01-01T00:00:00.000Z'
    }
  ];
  render(<ArticlesPreview articles={publishedOnly} />);

  expect(screen.queryByRole('button', { name: /发布/i })).toBeNull();
});

test('shows empty state when articles array is empty', () => {
  render(<ArticlesPreview articles={[]} />);

  expect(screen.getByText(/暂无草稿/i)).toBeInTheDocument();
});

test('handles multiple drafts and published articles correctly', () => {
  const mixedArticles = [
    { slug: 'd1', title: 'D1', description: 'desc', status: 'draft', createdAt: '2025-01-01T00:00:00.000Z' },
    { slug: 'd2', title: 'D2', description: 'desc', status: 'draft', createdAt: '2025-01-01T00:00:00.000Z' },
    { slug: 'p1', title: 'P1', description: 'desc', status: 'published', createdAt: '2025-01-01T00:00:00.000Z' }
  ];
  render(<ArticlesPreview articles={mixedArticles} />);

  const publishButtons = screen.getAllByRole('button', { name: /发布/i });
  expect(publishButtons).toHaveLength(2);

  const publishedCard = screen.getByText('P1').closest('[data-testid="article-preview"]');
  expect(publishedCard?.querySelector('button[aria-label="发布"]')).toBeNull();
});

test('shows success message after successful publish', async () => {
  const updatedArticle = { ...mockArticles[0], status: 'published' };
  updateArticle.mockResolvedValueOnce({ article: updatedArticle });

  render(<ArticlesPreview articles={mockArticles} />);

  const publishButton = screen.getByRole('button', { name: /发布/i });
  fireEvent.click(publishButton);

  await waitFor(() => {
    const successElement = screen.getByTestId('success-message');
    expect(successElement).toBeInTheDocument();
    expect(successElement).toHaveTextContent(/发布成功/i);
  });
});