import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getProfile from "../../services/getProfile";
import Avatar from "../Avatar";
import FollowButton from "../FollowButton";
import formatReadCount from "../../helpers/formatReadCount";

function AuthorInfo({ isCompact = false, author, createdAt, readCount }) {
  const { state } = useLocation();
  const [{ bio, followersCount, following, image, username: stateUsername }, setAuthor] = useState(
    state || {}
  );
  const { headers, loggedUser } = useAuth();
  const paramsUsername = useParams().username;
  const navigate = useNavigate();

  useEffect(() => {
    if (isCompact) return;
    if (state && state.bio === bio) return;

    getProfile({ headers, username: paramsUsername })
      .then(setAuthor)
      .catch((error) => {
        console.error(error);
        navigate("/not-found", { replace: true });
      });
  }, [paramsUsername, headers, state, navigate, isCompact]);

  const followHandler = ({ followersCount, following }) => {
    setAuthor((prev) => ({ ...prev, followersCount, following }));
  };

  // 文章卡片紧凑模式布局
  if (isCompact && author) {
    return (
      <div className="article-meta">
        <Avatar alt={author.username} src={author.image} />
        <div className="info">
          <Link to={`/profile/${author.username}`} className="author">
            {author.username}
          </Link>
          <span className="date">{new Date(createdAt).toDateString()}</span>
        </div>
        {readCount !== undefined && (
          <span className="read-count pull-xs-right" style={{ color: "#999", lineHeight: "1.2", display: "inline-flex", alignItems: "center" }}>
            <i className="ion-eye" style={{ marginRight: "4px" }}></i>
            {formatReadCount(readCount)}
          </span>
        )}
      </div>
    );
  }

  // 原有个人主页布局完全保留
  return (
    <div className="col-xs-12 col-md-10 offset-md-1">
      <Avatar alt={paramsUsername} className="user-img" src={image} />
      <h4>{stateUsername || paramsUsername}</h4>

      {bio && <Markdown options={{ forceBlock: true }}>{bio}</Markdown>}

      {(stateUsername || paramsUsername) === loggedUser?.username ? (
        <Link
          className="btn btn-sm btn-outline-secondary action-btn"
          to="/settings"
        >
          <i className="ion-gear-a"></i> Edit Profile Settings
        </Link>
      ) : (
        <FollowButton
          followersCount={followersCount}
          following={following}
          handler={followHandler}
          username={paramsUsername}
        />
      )}
    </div>
  );
}

export default AuthorInfo;