import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getArticle from "../../services/getArticle";
import setArticle from "../../services/setArticle";
import FormFieldset from "../FormFieldset";

const emptyForm = { title: "", description: "", body: "", tagList: "", status: "draft" };

function ArticleEditorForm() {
  const { state } = useLocation();
  const [form, setForm] = useState(
    state
      ? { title: state.title, description: state.description, body: state.body, tagList: state.tagList, status: state.status || "draft" }
      : emptyForm,
  );
  const [currentStatus, setCurrentStatus] = useState(state?.status || "draft");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [navigateSlug, setNavigateSlug] = useState(null);
  const { isAuth, headers, loggedUser } = useAuth();

  const navigate = useNavigate();
  const { slug } = useParams();

  useEffect(() => {
    const redirect = () => navigate("/", { replace: true, state: null });
    if (!isAuth) return redirect();

    if (state || !slug) return;

    getArticle({ headers, slug })
      .then(({ author: { username }, body, description, tagList, title, status }) => {
        if (username !== loggedUser.username) redirect();

        setForm({ body, description, tagList, title, status: status || "draft" });
        setCurrentStatus(status || "draft");
      })
      .catch(console.error);

    return () => setForm(emptyForm);
  }, [headers, isAuth, loggedUser.username, navigate, slug, state]);

  useEffect(() => {
    if (navigateSlug) {
      navigate(`/article/${navigateSlug}`);
    }
  }, [navigateSlug, navigate]);

  const inputHandler = (e) => {
    const type = e.target.name;
    const value = e.target.value;

    setForm((form) => ({ ...form, [type]: value }));
  };

  const tagsInputHandler = (e) => {
    const value = e.target.value;

    setForm((form) => ({ ...form, tagList: value.split(/,| /) }));
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setArticle({ headers, slug, body: form.body, description: form.description, tagList: form.tagList, title: form.title, status: "draft" })
      .then((newSlug) => {
        setSuccessMessage("Article saved as draft!");
        setNavigateSlug(newSlug);
      })
      .catch(setErrorMessage);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setArticle({ headers, slug, body: form.body, description: form.description, tagList: form.tagList, title: form.title, status: "published" })
      .then((newSlug) => {
        setSuccessMessage("Article published!");
        setNavigateSlug(newSlug);
      })
      .catch(setErrorMessage);
  };

  const showDraftButton = currentStatus !== "published";

  return (
    <form>
      <fieldset>
        {errorMessage && <span data-testid="error-message" className="error-messages">{errorMessage}</span>}
        {successMessage && <span data-testid="success-message" className="success-messages">{successMessage}</span>}
        <FormFieldset
          placeholder="Article Title"
          name="title"
          required
          value={form.title}
          handler={inputHandler}
        ></FormFieldset>

        <FormFieldset
          normal
          placeholder="What's this article about?"
          name="description"
          required
          value={form.description}
          handler={inputHandler}
        ></FormFieldset>

        <fieldset className="form-group">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article (in markdown)"
            name="body"
            required
            value={form.body}
            onChange={inputHandler}
          ></textarea>
        </fieldset>

        <FormFieldset
          normal
          placeholder="Enter tags"
          name="tags"
          value={form.tagList}
          handler={tagsInputHandler}
        >
          <div className="tag-list"></div>
        </FormFieldset>

        <div className="btn-group pull-xs-right">
          {showDraftButton && (
            <button
              className="btn btn-lg btn-secondary"
              type="button"
              onClick={handleSaveDraft}
            >
              Save as Draft
            </button>
          )}
          <button
            className="btn btn-lg btn-primary"
            type="button"
            onClick={handlePublish}
          >
            {slug ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export default ArticleEditorForm;
