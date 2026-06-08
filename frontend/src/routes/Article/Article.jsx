import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ArticleMeta from "../../components/ArticleMeta";
import ArticlesButtons from "../../components/ArticlesButtons";
import ArticleTags from "../../components/ArticleTags";
import BannerContainer from "../../components/BannerContainer";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";

/** 统计纯文本字数（排除空白和 Markdown 标记） */
function countWords(text) {
  if (!text) return 0;
  const cleaned = text
    .replace(/[#*_~>\-`\[\]()!|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length === 0) return 0;
  return cleaned.split(/\s+/).length;
}

/** 按平均阅读速度估算阅读时长（分钟） */
function estimateReadingTime(wordCount, wordsPerMinute = 250) {
  if (wordCount === 0) return "< 1";
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return String(minutes);
}

function Article() {
  const { state } = useLocation();
  const [article, setArticle] = useState(state || {});
  const { title, body, tagList, createdAt, author } = article || {};
  const { headers, isAuth } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    if (state) return;
    getArticle({ slug, headers })
      .then(setArticle)
      .catch((error) => {
        console.error(error);
        navigate("/not-found", { replace: true });
      });
  }, [isAuth, slug, headers, state, navigate]);

  const wordCount = countWords(body);
  const readingTime = estimateReadingTime(wordCount);

  return (
    <div className="article-page">
      <BannerContainer>
        <h1>{title}</h1>
        <ArticleMeta author={author} createdAt={createdAt}>
          <ArticlesButtons article={article} setArticle={setArticle} />
        </ArticleMeta>
      </BannerContainer>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            {body && <Markdown options={{ forceBlock: true }}>{body}</Markdown>}
            <div className="article-stats" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #e5e5e5", color: "#999", fontSize: 13 }}>
              <span>共 {wordCount} 字</span>
              <span style={{ marginLeft: 16 }}>预计阅读 {readingTime} 分钟</span>
            </div>
            <ArticleTags tagList={tagList} />
          </div>
        </div>

        <hr />

        <div className="article-actions">
          <ArticleMeta author={author} createdAt={createdAt}>
            <ArticlesButtons article={article} setArticle={setArticle} />
          </ArticleMeta>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export default Article;
