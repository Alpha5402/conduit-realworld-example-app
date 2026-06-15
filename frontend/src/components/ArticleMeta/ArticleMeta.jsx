import { Link } from "react-router-dom";
import dateFormatter, { formatFullTime, formatRelativeTime } from "../../helpers/dateFormatter";
import Avatar from "../Avatar";

function ArticleMeta({ author, children, createdAt, updatedAt }) {
  const { bio, followersCount, following, image, username } = author || {};

  return (
    <div className="article-meta">
      <Link
        state={{ bio, followersCount, following, image }}
        to={`/profile/${username}`}
      >
        <Avatar alt={username} src={image} />
      </Link>
      <div className="info">
        <Link
          className="author"
          state={{ bio, followersCount, following, image }}
          to={`/profile/${username}`}
        >
          {username}
        </Link>
        <span className="date">{dateFormatter(createdAt)}</span>
        {updatedAt && (
          <span className="edit-date" title={formatFullTime(updatedAt)}>
            &nbsp;最后编辑于 {formatRelativeTime(updatedAt)}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default ArticleMeta;
