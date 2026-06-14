import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleEditorForm from './ArticleEditorForm';
import setArticle from '../../services/setArticle';

jest.mock('../../services/setArticle');

describe('ArticleEditorForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "保存草稿" button and calls setArticle with status=draft when no initialValues', async () => {
    setArticle.mockResolvedValue({ article: { slug: 'test-article', status: 'draft' } });
    render(<ArticleEditorForm onSubmit={mockOnSubmit} />);

    const saveDraftBtn = screen.getByRole('button', { name: /保存草稿/i });
    expect(saveDraftBtn).toBeInTheDocument();

    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(setArticle).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft' }),
        undefined
      );
    });

    // Check success message
    expect(await screen.findByTestId('success-message')).toBeInTheDocument();
  });

  it('renders "发布" button and calls setArticle with status=published when no initialValues', async () => {
    setArticle.mockResolvedValue({ article: { slug: 'test-article', status: 'published' } });
    render(<ArticleEditorForm onSubmit={mockOnSubmit} />);

    const publishBtn = screen.getByRole('button', { name: /发布/i });
    expect(publishBtn).toBeInTheDocument();

    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(setArticle).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published' }),
        undefined
      );
    });

    expect(await screen.findByTestId('success-message')).toBeInTheDocument();
  });

  it('does not show "保存草稿" button when article status is published', () => {
    render(
      <ArticleEditorForm
        initialValues={{ title: 'Published Article', status: 'published' }}
        onSubmit={mockOnSubmit}
      />
    );

    const saveDraftBtn = screen.queryByRole('button', { name: /保存草稿/i });
    expect(saveDraftBtn).not.toBeInTheDocument();
  });

  it('shows both "保存草稿" and "发布" buttons when editing a draft article', () => {
    render(
      <ArticleEditorForm
        initialValues={{ title: 'Draft Article', status: 'draft' }}
        onSubmit={mockOnSubmit}
      />
    );

    const saveDraftBtn = screen.getByRole('button', { name: /保存草稿/i });
    const publishBtn = screen.getByRole('button', { name: /发布/i });
    expect(saveDraftBtn).toBeInTheDocument();
    expect(publishBtn).toBeInTheDocument();
  });

  it('calls setArticle with status=published when clicking "发布" on a draft', async () => {
    setArticle.mockResolvedValue({ article: { slug: 'test-article', status: 'published' } });
    render(
      <ArticleEditorForm
        initialValues={{
          title: 'test',
          description: 'desc',
          body: 'body',
          status: 'draft',
          slug: 'test-article',
        }}
        onSubmit={mockOnSubmit}
      />
    );

    const publishBtn = screen.getByRole('button', { name: /发布/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(setArticle).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published' }),
        'test-article'
      );
    });

    expect(await screen.findByTestId('success-message')).toBeInTheDocument();
  });

  it('calls setArticle with status=draft when clicking "保存草稿" on a draft', async () => {
    setArticle.mockResolvedValue({ article: { slug: 'test-article', status: 'draft' } });
    render(
      <ArticleEditorForm
        initialValues={{
          title: 'test',
          description: 'desc',
          body: 'body',
          status: 'draft',
          slug: 'test-article',
        }}
        onSubmit={mockOnSubmit}
      />
    );

    const saveDraftBtn = screen.getByRole('button', { name: /保存草稿/i });
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(setArticle).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft' }),
        'test-article'
      );
    });

    expect(await screen.findByTestId('success-message')).toBeInTheDocument();
  });

  it('displays error message when saving draft fails', async () => {
    setArticle.mockRejectedValue(new Error('Network error'));
    render(<ArticleEditorForm onSubmit={mockOnSubmit} />);

    const saveDraftBtn = screen.getByRole('button', { name: /保存草稿/i });
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      const errorMsg = screen.getByTestId('error-message');
      expect(errorMsg).toBeInTheDocument();
    });
  });

  it('displays error message when publishing fails', async () => {
    setArticle.mockRejectedValue(new Error('Server error'));
    render(
      <ArticleEditorForm
        initialValues={{
          title: 'test',
          description: 'desc',
          body: 'body',
          status: 'draft',
          slug: 'test-article',
        }}
        onSubmit={mockOnSubmit}
      />
    );

    const publishBtn = screen.getByRole('button', { name: /发布/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      const errorMsg = screen.getByTestId('error-message');
      expect(errorMsg).toBeInTheDocument();
    });
  });

  it('does not display success message when operation fails', async () => {
    setArticle.mockRejectedValue(new Error('Network error'));
    render(<ArticleEditorForm onSubmit={mockOnSubmit} />);

    const saveDraftBtn = screen.getByRole('button', { name: /保存草稿/i });
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
    });
  });
});