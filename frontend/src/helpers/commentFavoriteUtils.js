/**
 * 评论点赞状态同步纯逻辑工具函数
 * 所有函数均为纯函数，无副作用，仅依赖输入参数生成输出，便于单元测试
 */

/**
 * 生成客户端唯一幂等令牌
 * @returns {string} 唯一幂等字符串
 */
export const generateIdempotencyToken = () => {
  return `fav-comment-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

/**
 * 纯函数校验点赞计数合法性，兜底处理异常值
 * @param {number} count 待校验的点赞数量
 * @returns {number} 合法的点赞数量，最小为0
 */
export const validateFavoriteCount = (count) => {
  const parsedCount = Number(count);
  if (isNaN(parsedCount) || parsedCount < 0) {
    return 0;
  }
  return Math.floor(parsedCount);
};

/**
 * 校验点赞状态转换合法性
 * 避免前端非法状态跳转，作为二次校验兜底
 * @param {boolean} currentIsFavorited 当前本地点赞状态
 * @param {boolean} targetIsFavorited 目标操作后的点赞状态
 * @returns {boolean} 转换是否合法
 */
export const validateFavoriteTransition = (currentIsFavorited, targetIsFavorited) => {
  // 合法转换：未点赞 -> 点赞 / 已点赞 -> 取消点赞
  return currentIsFavorited !== targetIsFavorited;
};

/**
 * 纯函数执行点赞操作的乐观更新
 * 点击后立即返回更新后的本地状态，无需等待接口返回
 * @param {Object} originalComment 原始评论对象
 * @returns {{updatedComment: Object, snapshot: Object}} 乐观更新后的评论 + 原始状态快照用于失败回滚
 */
export const optimisticToggleCommentFavorite = (originalComment) => {
  const snapshot = { ...originalComment };
  const currentIsFavorited = !!originalComment.isFavorited;
  const currentCount = validateFavoriteCount(originalComment.favoriteCount);

  const newIsFavorited = !currentIsFavorited;
  const newCount = newIsFavorited ? currentCount + 1 : Math.max(0, currentCount - 1);

  const updatedComment = {
    ...originalComment,
    isFavorited: newIsFavorited,
    favoriteCount: newCount
  };

  return {
    updatedComment,
    snapshot
  };
};

/**
 * 纯函数执行点赞操作失败后的状态回滚
 * 接口返回异常时直接恢复到操作前的原始状态
 * @param {Object} snapshot 操作前保存的原始评论快照
 * @returns {Object} 回滚后的评论对象
 */
export const rollbackCommentFavorite = (snapshot) => {
  return {
    ...snapshot
  };
};

/**
 * 纯函数更新评论列表的点赞状态与计数
 * 仅在接口返回成功后调用，不会修改原输入数组，返回全新的评论列表
 * @param {Array} originalComments 原始评论列表
 * @param {number|string} targetCommentId 被操作的评论ID
 * @param {boolean} newIsFavorited 后端返回的最新点赞状态
 * @param {number} newFavoriteCount 后端返回的最新点赞总数
 * @returns {Array} 更新后的全新评论列表
 */
export const updateCommentFavoriteState = (originalComments, targetCommentId, newIsFavorited, newFavoriteCount) => {
  if (!Array.isArray(originalComments)) return [];
  
  return originalComments.map(comment => {
    if (comment.id !== targetCommentId) {
      return comment;
    }
    return {
      ...comment,
      isFavorited: newIsFavorited,
      favoriteCount: validateFavoriteCount(newFavoriteCount)
    };
  });
};