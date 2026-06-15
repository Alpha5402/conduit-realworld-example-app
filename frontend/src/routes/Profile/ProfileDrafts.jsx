import { Link, useParams } from 'react-router-dom';
import useArticles from '../../hooks/useArticles';

const ProfileDrafts = () => {
  const { username } = useParams();
  const { articles, loading, error } = useArticles({
    location: 'profile',
    username,
    status: 'draft',
  });

  if (loading) {
    return <div className="profile-drafts-loading">Loading drafts...</div>;
  }

  if (error) {
    return (
      <div className="profile-drafts-error" data-testid="error-message">
        Error: {error}
      </div>
    );
  }

  if (articles.length === 0) {
    return <div className="profile-drafts-empty">暂无草稿</div>;
  }

  return (
    <div className="profile-drafts">
      {articles.map((article) => (
        <div key={article.slug} className="article-preview">
          <Link to={`/article/${article.slug}`}>
            <h2>{article.title}</h2>
          </Link>
          <p>{article.description}</p>
          <span className="status-tag draft">草稿</span>
        </div>
      ))}
    </div>
  );
};

export default ProfileDrafts;