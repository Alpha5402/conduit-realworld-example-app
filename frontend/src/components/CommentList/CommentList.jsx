import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dateFormatter from "../../helpers/dateFormatter";
import deleteComment from "../../services/deleteComment";
import getComments from "../../services/getComments";
import { favoriteComment } from "../../services/comments";
import { 
  handleCommentFavoriteSuccess,
  optimisticUpdateCommentFavorite,
  rollbackCommentFavorite
} from "../../helpers/commentFavoriteUtils";
import CommentAuthor from "./CommentAuthor";

function CommentList({ triggerUpdate, updateComments }) {
  const [comments, setComments] = useState([]);
  const { headers, isAuth, loggedUser } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getComments({ slug }).then(setComments).catch(console.error);
  }, [slug, triggerUpdate]);

  const handleDeleteComment = (commentId) => {
    if (!isAuth) {
      navigate('/login');
      return;
    }

    const confirmation = window.confirm("Want to delete the comment?");
    if (!confirmation) return;

    deleteComment({ commentId, headers, slug })
      .then(updateComments)
      .catch(console.error);
  };

  const handleFavoriteComment = async (commentId) => {
    if (!isAuth) {
      navigate('/login');
      return;
    }
    // 保存操作前的原始状态，用于接口失败时回滚
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) return;
    const oldLiked = !!targetComment.isFavorited;
    const oldLikeCount = targetComment.favoriteCount || 0;

    // 执行乐观更新：点击后立即切换本地点赞状态和计数，无需等待接口返回
    setComments(prev => optimisticUpdateCommentFavorite(prev, commentId));

    try {
      // 生成全局唯一请求ID，传递给后端用于幂等校验
      const requestId = crypto.randomUUID();
      const result = await favoriteComment({ commentId, headers, requestId });
      // 接口返回成功后，以服务端返回的最新状态为准同步本地数据
      setComments(prev => 
        handleCommentFavoriteSuccess(prev, commentId, result.liked, result.likeCount)
      );
    } catch (err) {
      console.error("Favorite comment operation failed:", err);
      // 接口异常/业务失败时自动回滚到操作前的原始状态，保证前后端状态一致
      setComments(prev => rollbackCommentFavorite(prev, commentId, oldLiked, oldLikeCount));
      alert("Failed to update comment like status, please try again later.");
    }
  };

  return comments?.length > 0 ? (
    comments.map((comment) => {
      const { id, author, body, createdAt, isFavorited = false, favoriteCount = 0 } = comment;
      const { username } = author;
      return (
        <div className="card" key={id}>
          <div className="card-block">
            <p className="card-text">{body}</p>
          </div>
          <div className="card-footer">
            <CommentAuthor {...author} />
            <span className="date-posted">{dateFormatter(createdAt)}</span>
            <button
              className={`btn btn-sm ${isFavorited ? 'btn-primary' : 'btn-outline-primary'} pull-xs-right mr-1`}
              onClick={() => handleFavoriteComment(id)}
            >
              <i className="ion-heart"></i> {favoriteCount}
            </button>
            {isAuth && loggedUser.username === username && (
              <button
                className="btn btn-sm btn-outline-danger pull-xs-right"
                onClick={() => handleDeleteComment(id)}
              >
                <i className="ion-trash-a"></i>
              </button>
            )}
          </div>
        </div>
      );
    })
  ) : (
    <div>There are no comments yet...</div>
  );
}

export default CommentList;