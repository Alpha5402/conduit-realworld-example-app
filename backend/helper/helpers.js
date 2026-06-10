const slugify = (string) => {
  return string.trim().toLowerCase().replace(/\W|_/g, "-");
};

const appendTagList = (articleTags, article) => {
  const tagList = articleTags.map((tag) => tag.name);

  if (!article) return tagList;
  article.dataValues.tagList = tagList;
};

const appendFavorites = async (loggedUser, article) => {
  const favorited = await article.hasUser(loggedUser ? loggedUser : null);
  article.dataValues.favorited = loggedUser ? favorited : false;

  const favoritesCount = await article.countUsers();
  article.dataValues.favoritesCount = favoritesCount;
};

const appendFollowers = async (loggedUser, toAppend) => {
  //
  if (toAppend?.author) {
    const author = await toAppend.getAuthor();

    const following = await author.hasFollower(loggedUser ? loggedUser : null);
    toAppend.author.dataValues.following = loggedUser ? following : false;

    const followersCount = await author.countFollowers();
    toAppend.author.dataValues.followersCount = followersCount;
    //
  } else {
    const following = await toAppend.hasFollower(
      loggedUser ? loggedUser : null,
    );
    toAppend.dataValues.following = loggedUser ? following : false;

    const followersCount = await toAppend.countFollowers();
    toAppend.dataValues.followersCount = followersCount;
  }
};

// 幂等令牌存储，记录已处理的请求令牌
const usedIdempotencyTokens = new Set();

// 定时清理超过1小时的幂等令牌，避免内存泄漏
setInterval(() => {
  usedIdempotencyTokens.clear();
}, 3600 * 1000);

/**
 * 双重幂等校验函数
 * @param {number} userId 当前登录用户ID
 * @param {number} targetCommentId 目标评论ID
 * @param {Function} checkExistingFavorite 校验用户是否已存在该评论点赞的异步函数
 * @param {string} idempotencyToken 请求头携带的幂等令牌
 * @returns {Promise<{isDuplicate: boolean, reason?: string}>} 校验结果
 */
const checkIdempotency = async (userId, targetCommentId, checkExistingFavorite, idempotencyToken) => {
  // 第一重校验：用户ID + 评论ID 已存在点赞记录
  const existingFavorite = await checkExistingFavorite();
  if (existingFavorite) {
    return {
      isDuplicate: true,
      reason: 'user_already_favorited_comment'
    };
  }

  // 第二重校验：幂等令牌是否已被使用
  if (idempotencyToken && usedIdempotencyTokens.has(idempotencyToken)) {
    return {
      isDuplicate: true,
      reason: 'duplicate_idempotency_token'
    };
  }

  // 校验通过，记录幂等令牌
  if (idempotencyToken) {
    usedIdempotencyTokens.add(idempotencyToken);
  }

  return {
    isDuplicate: false
  };
};

/**
 * 为评论追加点赞状态和点赞数量属性
 * @param {object} loggedUser 当前登录用户
 * @param {object} comment 评论实例
 */
const appendCommentFavorites = async (loggedUser, comment) => {
  const isFavorited = loggedUser ? await comment.hasFavoritedUser(loggedUser) : false;
  comment.dataValues.isFavorited = isFavorited;

  const favoriteCount = await comment.countFavoritedUsers();
  comment.dataValues.favoriteCount = favoriteCount;
};

module.exports = { slugify, appendTagList, appendFavorites, appendFollowers, checkIdempotency, appendCommentFavorites };