import { useParams } from "react-router-dom";
import { useState } from "react";
import ArticlesPagination from "../../components/ArticlesPagination";
import ArticlesPreview from "../../components/ArticlesPreview";
import useArticleList from "../../hooks/useArticles";

function ProfileArticles() {
  const { username } = useParams();
  const [statusFilter, setStatusFilter] = useState("draft");

  const { articles, articlesCount, loading, error, setArticlesData } =
    useArticleList({
      location: "profile",
      username,
      status: statusFilter,
    });

  return (
    <>
      <div className="articles-toggle">
        <button
          className={
            statusFilter === "all"
              ? "btn btn-sm btn-primary active"
              : "btn btn-sm btn-outline-primary"
          }
          onClick={() => setStatusFilter("all")}
        >
          全部
        </button>
        <button
          className={
            statusFilter === "draft"
              ? "btn btn-sm btn-primary active"
              : "btn btn-sm btn-outline-primary"
          }
          onClick={() => setStatusFilter("draft")}
        >
          草稿
        </button>
        <button
          className={
            statusFilter === "published"
              ? "btn btn-sm btn-primary active"
              : "btn btn-sm btn-outline-primary"
          }
          onClick={() => setStatusFilter("published")}
        >
          已发布
        </button>
      </div>

      {loading ? (
        <div className="article-preview">
          <em>Loading {username} articles...</em>
        </div>
      ) : error ? (
        <div className="article-preview">
          <span className="text-danger">{error}</span>
        </div>
      ) : articles.length > 0 ? (
        <>
          <ArticlesPreview
            articles={articles}
            loading={loading}
            updateArticles={setArticlesData}
          />

          <ArticlesPagination
            articlesCount={articlesCount}
            location="profile"
            updateArticles={setArticlesData}
            username={username}
          />
        </>
      ) : (
        <div className="article-preview">
          {statusFilter === "draft" ? "暂无草稿" : "暂无文章"}
        </div>
      )}
    </>
  );
}

export default ProfileArticles;
