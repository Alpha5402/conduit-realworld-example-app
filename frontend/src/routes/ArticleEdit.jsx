import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ArticleEditorForm from '../components/ArticleEditorForm';
import { getArticle, createArticle, updateArticle } from '../services/articles';

function ArticleEdit() {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const isNewArticle = !slug;

  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    body: '',
    tagList: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 未登录用户直接跳转登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 加载已有文章数据
  useEffect(() => {
    if (!isNewArticle && isAuthenticated) {
      setLoading(true);
      getArticle(slug).then(res => {
        const article = res.article;
        // 校验文章作者是否为当前登录用户
        if (article.author.username !== currentUser.username) {
          navigate('/');
          return;
        }
        setInitialValues({
          title: article.title,
          description: article.description,
          body: article.body,
          tagList: article.tagList
        });
      }).catch(err => {
        setErrors(err.errors || { body: ['Failed to load article'] });
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [slug, isNewArticle, isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (articleData) => {
    setLoading(true);
    setErrors({});
    try {
      let res;
      if (isNewArticle) {
        res = await createArticle(articleData);
      } else {
        res = await updateArticle(slug, articleData);
      }
      navigate(`/article/${res.article.slug}`);
    } catch (err) {
      setErrors(err.errors || { body: ['Failed to save article'] });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ArticleEditorForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              errors={errors}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleEdit;