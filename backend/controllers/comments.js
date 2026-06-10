const {
  NotFoundError,
  UnauthorizedError,
  FieldRequiredError,
  ForbiddenError,
} = require("../helper/customErrors");
const { appendFollowers, checkIdempotency } = require("../helper/helpers");
const { Article, Comment, User } = require("../models");

//? All Comments for Article
const allComments = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    const { slug } = req.params;

    const article = await Article.findOne({ where: { slug: slug } });
    if (!article) throw new NotFoundError("Article");

    const comments = await article.getComments({
      include: [
        { model: User, as: "author", attributes: { exclude: ["email"] } },
      ],
      order: [["createdAt", "DESC"]],
    });

    for (const comment of comments) {
      await appendFollowers(loggedUser, comment);
      // 补充点赞状态和数量字段
      if (loggedUser) {
        comment.dataValues.isFavorited = await loggedUser.hasFavoriteComment(comment.id);
      } else {
        comment.dataValues.isFavorited = false;
      }
      comment.dataValues.favoriteCount = Math.max(0, await comment.countFavoritedBy());
    }

    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

//* Create Comment for Article
const createComment = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { body } = req.body.comment;
    if (!body) throw new FieldRequiredError("Comment body");

    const { slug } = req.params;
    const article = await Article.findOne({ where: { slug: slug } });
    if (!article) throw new NotFoundError("Article");

    const comment = await Comment.create({
      body: body,
      articleId: article.id,
      userId: loggedUser.id,
    });

    delete loggedUser.dataValues.token;
    comment.dataValues.author = loggedUser;
    await appendFollowers(loggedUser, loggedUser);
    // 初始化点赞状态
    comment.dataValues.isFavorited = false;
    comment.dataValues.favoriteCount = 0;

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

//* Delete Comment for Article
const deleteComment = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { slug, commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) throw new NotFoundError("Comment");

    if (loggedUser.id !== comment.userId) {
      throw new ForbiddenError("comment");
    }

    await comment.destroy();

    res.json({ message: { body: ["Comment deleted successfully"] } });
  } catch (error) {
    next(error);
  }
};

//* Toggle Comment Like 双维度幂等实现
const likeComment = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { commentId } = req.params;
    const { requestId } = req.body;
    if (!requestId) throw new FieldRequiredError("requestId");

    const comment = await Comment.findByPk(commentId);
    if (!comment) throw new NotFoundError("Comment");

    // 双维度幂等校验：1. 用户+评论关联维度 2. 请求唯一ID维度
    const currentLikedStatus = await loggedUser.hasFavoriteComment(comment.id);
    const idempotencyPassed = await checkIdempotency(
      loggedUser.id,
      commentId,
      requestId,
      "comment_like"
    );

    // 重复请求直接返回当前最新状态，不执行任何修改操作
    if (!idempotencyPassed) {
      const currentLikeCount = Math.max(0, await comment.countFavoritedBy());
      return res.json({
        code: 200,
        data: {
          liked: currentLikedStatus,
          likeCount: currentLikeCount,
        },
        msg: "操作成功"
      });
    }

    // 执行点赞状态切换
    let newLikedStatus;
    if (currentLikedStatus) {
      await loggedUser.removeFavoriteComment(comment);
      newLikedStatus = false;
    } else {
      await loggedUser.addFavoriteComment(comment);
      newLikedStatus = true;
    }

    // 保证计数边界合法，不会小于0
    const newLikeCount = Math.max(0, await comment.countFavoritedBy());

    return res.json({
      code: 200,
      data: {
        liked: newLikedStatus,
        likeCount: newLikeCount,
      },
      msg: "操作成功"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { allComments, createComment, deleteComment, likeComment };