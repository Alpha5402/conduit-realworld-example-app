import { useState } from "react";
import { Link } from "react-router-dom";
import ArticleMeta from "../ArticleMeta";
import ArticleTags from "../ArticleTags";
import FavButton from "../FavButton";
import updateArticle from "../../services/updateArticle";

function ArticlesPreview({ articles, loading, updateArticles }) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFav = (article) => {
    const items = [...articles];

    const updatedArticles = items.map((item) =>
      item.slug === article.slug ? { ...item, ...article } : item,
    );

    updateArticles((prev) => ({ ...prev, articles: updatedArticles }));
  };

  const handlePublish = async (slug) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await updateArticle(slug, { status: "published" });
      const remainingArticles = articles.filter(
        (article) => article.slug !== slug,
      );
      updateArticles((prev) => ({ ...prev, articles: remainingArticles }));
      setSuccessMessage("发布成功");
    } catch (error) {
      setErrorMessage(error.message || "Failed to publish article.");
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="error-messages" data-testid="error-message">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="success-messages" data-testid="success-message">
          {successMessage}
        </div>
      )}
      {articles?.length > 0 ? (
        articles.map((article) => {
          const isDraft = article.status === "draft";
          return (
            <div className="article-preview" key={article.slug} data-testid="article-preview">
              <ArticleMeta author={article.author} createdAt={article.createdAt}>
                <FavButton
                  favorited={article.favorited}
                  favoritesCount={article.favoritesCount}
                  handler={handleFav}
                  right
                  slug={article.slug}
                />
              </ArticleMeta>
              <Link
                to={`/article/${article.slug}`}
                state={article}
                className="preview-link"
              >
                <h1>{article.title}</h1>
                <p>{article.description}</p>
                <span>Read more...</span>
                <ArticleTags tagList={article.tagList} />
              </Link>
              <div className="article-status-actions">
                <span className={`tag-pill tag-${article.status}`}>
                  {isDraft ? "Draft" : "Published"}
                </span>
                {isDraft && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePublish(article.slug);
                    }}
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : loading ? (
        <div className="article-preview">Loading article...</div>
      ) : (
        <div className="article-preview">No articles available.</div>
      )}
    </>
  );
}

export default ArticlesPreview;
