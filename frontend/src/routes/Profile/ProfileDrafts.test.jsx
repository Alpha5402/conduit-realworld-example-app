import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProfileDrafts from './ProfileDrafts';
import useArticles from '../../hooks/useArticles';

jest.mock('../../hooks/useArticles');

const mockArticles = [
  {
    slug: 'test-draft-1',
    title: 'Test Draft 1',
    description: 'Description 1',
    body: 'Body 1',
    status: 'draft',
    createdAt: '2025-01-01T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: { username: 'testuser', image: '' },
  },
  {
    slug: 'test-draft-2',
    title: 'Test Draft 2',
    description: 'Description 2',
    body: 'Body 2',
    status: 'draft',
    createdAt: '2025-01-02T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: { username: 'testuser', image: '' },
  },
];

const defaultHookValue = {
  articles: [],
  loading: false,
  error: null,
  setParams: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  useArticles.mockReturnValue(defaultHookValue);
});

const renderComponent = () => {
  return render(
    <MemoryRouter initialEntries={['/profile/testuser/drafts']}>
      <Routes>
        <Route path="/profile/:username/drafts" element={<ProfileDrafts />} />
      </Routes>
    </MemoryRouter>
  );
};

test('renders the Drafts heading', () => {
  renderComponent();
  expect(screen.getByText('Drafts')).toBeInTheDocument();
});

test('calls useArticles with correct default parameters', () => {
  renderComponent();
  expect(useArticles).toHaveBeenCalledWith({
    location: 'profile',
    username: 'testuser',
    status: 'draft',
  });
});

test('displays draft articles when list is not empty', () => {
  useArticles.mockReturnValue({
    ...defaultHookValue,
    articles: mockArticles,
  });
  renderComponent();
  expect(screen.getByText('Test Draft 1')).toBeInTheDocument();
  expect(screen.getByText('Test Draft 2')).toBeInTheDocument();
});

test('shows empty state text when no drafts are returned', () => {
  useArticles.mockReturnValue({
    ...defaultHookValue,
    articles: [],
  });
  renderComponent();
  expect(screen.getByText('暂无草稿')).toBeInTheDocument();
});

test('displays error message when useArticles returns error', () => {
  const errorMessage = 'Failed to load articles';
  useArticles.mockReturnValue({
    ...defaultHookValue,
    error: new Error(errorMessage),
  });
  renderComponent();
  const errorElement = screen.getByTestId('error-message');
  expect(errorElement).toBeInTheDocument();
  expect(errorElement).toHaveTextContent(errorMessage);
});

test('does not show filter buttons for all/draft/published', () => {
  useArticles.mockReturnValue({
    ...defaultHookValue,
    articles: [],
  });
  renderComponent();
  expect(screen.queryByText('全部')).not.toBeInTheDocument();
  expect(screen.queryByText('草稿')).not.toBeInTheDocument();
  expect(screen.queryByText('已发布')).not.toBeInTheDocument();
});

test('does not show publish button on draft articles (handled by parent component)', () => {
  useArticles.mockReturnValue({
    ...defaultHookValue,
    articles: mockArticles,
  });
  renderComponent();
  expect(screen.queryByRole('button', { name: /发布/i })).not.toBeInTheDocument();
});