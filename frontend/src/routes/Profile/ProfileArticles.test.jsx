import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileArticles from './ProfileArticles';

jest.mock('../../hooks/useArticles', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useArticles from '../../hooks/useArticles';

const mockUseArticles = useArticles;

describe('ProfileArticles', () => {
  const defaultProps = { username: 'testuser' };

  beforeEach(() => {
    mockUseArticles.mockReset();
  });

  it('默认选中草稿筛选，并传入 status=draft 到 useArticles', () => {
    mockUseArticles.mockReturnValue({ articles: [], loading: false, error: null });
    render(
      <MemoryRouter>
        <ProfileArticles {...defaultProps} />
      </MemoryRouter>
    );
    const draftBtn = screen.getByRole('button', { name: /草稿/i });
    expect(draftBtn).toHaveClass('active');
    expect(mockUseArticles).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft', location: 'profile', username: 'testuser' })
    );
  });

  it('点击“全部”按钮后，调用 useArticles 传入 status=all', () => {
    mockUseArticles.mockReturnValue({ articles: [], loading: false, error: null });
    render(
      <MemoryRouter>
        <ProfileArticles {...defaultProps} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /全部/i }));
    expect(mockUseArticles).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'all', location: 'profile', username: 'testuser' })
    );
  });

  it('点击“已发布”按钮后，调用 useArticles 传入 status=published', () => {
    mockUseArticles.mockReturnValue({ articles: [], loading: false, error: null });
    render(
      <MemoryRouter>
        <ProfileArticles {...defaultProps} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /已发布/i }));
    expect(mockUseArticles).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'published', location: 'profile', username: 'testuser' })
    );
  });

  it('草稿筛选且列表为空时，显示“暂无草稿”', () => {
    mockUseArticles.mockReturnValue({ articles: [], loading: false, error: null });
    render(
      <MemoryRouter>
        <ProfileArticles {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('暂无草稿')).toBeInTheDocument();
  });

  it('全部筛选且列表为空时，显示“暂无文章”', () => {
    mockUseArticles.mockReturnValue({ articles: [], loading: false, error: null });
    render(
      <MemoryRouter>
        <ProfileArticles {...defaultProps} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /全部/i }));
    expect(screen.getByText('暂无文章')).toBeInTheDocument();
  });

  it('请求失败时显示错误提示', () => {
    mockUseArticles.mockReturnValue({ articles: [], loading: false, error: '请求失败' });
    render(
      <MemoryRouter>
        <ProfileArticles {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('请求失败')).toBeInTheDocument();
  });

  it('加载中状态下不显示空状态', () => {
    mockUseArticles.mockReturnValue({ articles: [], loading: true, error: null });
    render(
      <MemoryRouter>
        <ProfileArticles {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.queryByText('暂无草稿')).not.toBeInTheDocument();
    expect(screen.queryByText('暂无文章')).not.toBeInTheDocument();
    // 可进一步验证 loader 出现
  });

  it('文章列表正常渲染时显示文章卡片', () => {
    const articles = [
      { slug: 'test-1', title: 'Test Article', status: 'draft' },
    ];
    mockUseArticles.mockReturnValue({ articles, loading: false, error: null });
    render(
      <MemoryRouter>
        <ProfileArticles {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });
});