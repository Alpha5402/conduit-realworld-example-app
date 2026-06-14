import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import getArticles from "../services/getArticles";

function useArticles({ location, tabName, tagName, username, status }) {
  const [{ articles, articlesCount }, setArticlesData] = useState({
    articles: [],
    articlesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { headers } = useAuth();

  useEffect(() => {
    if (!headers && tabName === "feed") return;

    setLoading(true);
    setError(null);

    getArticles({ headers, location, tabName, tagName, username, status })
      .then(setArticlesData)
      .catch((err) => {
        setError(err.message || "Failed to load articles");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [headers, location, tabName, tagName, username, status]);

  return { articles, articlesCount, loading, error, setArticlesData };
}

export default useArticles;
