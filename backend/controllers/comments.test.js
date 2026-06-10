const { describe, it, expect, vi, beforeEach } = require('vitest');
const { likeComment, unlikeComment } = require('./comments');
const models = require('../models');
const { checkIdempotency } = require('../helper/helpers');
const { NotFoundError } = require('../helper/customErrors');

vi.mock('../models', () => ({
  Comment: {
    findByPk: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn()
  },
  User: {
    findByPk: vi.fn()
  },
  UserLikeComment: {
    findOne: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn()
  }
}));

vi.mock('../helper/helpers', () => ({
  checkIdempotency: vi.fn()
}));

describe('Comment Like Idempotency Logic Tests', () => {
  let mockReq, mockRes, mockNext;
  const testUserId = 1;
  const testCommentId = 10;
  const testRequestId = 'test-unique-request-id-12345';

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      loggedUser: { id: testUserId },
      params: { commentId: testCommentId },
      body: { requestId: testRequestId }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
  });

  it('should successfully like comment for first time, like count increase by 1', async () => {
    models.UserLikeComment.findOne.mockResolvedValue(null);
    checkIdempotency.mockResolvedValue({ isDuplicate: false });
    models.Comment.findByPk.mockResolvedValue({ id: testCommentId, likeCount: 0 });
    models.UserLikeComment.create.mockResolvedValue({});

    await likeComment(mockReq, mockRes, mockNext);

    expect(models.UserLikeComment.create).toHaveBeenCalledOnce();
    expect(models.Comment.increment).toHaveBeenCalledWith('likeCount', { where: { id: testCommentId } });
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        liked: true,
        likeCount: 1
      },
      msg: 'Like operation success'
    });
  });

  it('should keep count unchanged when same user+commentId request repeated (user id + comment id idempotency)', async () => {
    models.UserLikeComment.findOne.mockResolvedValue({ id: 99 });
    checkIdempotency.mockResolvedValue({ isDuplicate: false });
    models.Comment.findByPk.mockResolvedValue({ id: testCommentId, likeCount: 1 });

    await likeComment(mockReq, mockRes, mockNext);

    expect(models.UserLikeComment.create).not.toHaveBeenCalled();
    expect(models.Comment.increment).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        liked: true,
        likeCount: 1
      },
      msg: 'Like operation success'
    });
  });

  it('should keep count unchanged when same requestId request repeated (request id idempotency)', async () => {
    models.UserLikeComment.findOne.mockResolvedValue(null);
    checkIdempotency.mockResolvedValue({ isDuplicate: true });
    models.Comment.findByPk.mockResolvedValue({ id: testCommentId, likeCount: 1 });

    await likeComment(mockReq, mockRes, mockNext);

    expect(models.UserLikeComment.create).not.toHaveBeenCalled();
    expect(models.Comment.increment).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        liked: true,
        likeCount: 1
      },
      msg: 'Duplicate request detected, operation skipped'
    });
  });

  it('should successfully unlike comment, like count decrease by 1', async () => {
    models.UserLikeComment.findOne.mockResolvedValue({ id: 99 });
    checkIdempotency.mockResolvedValue({ isDuplicate: false });
    models.Comment.findByPk.mockResolvedValue({ id: testCommentId, likeCount: 1 });
    models.UserLikeComment.destroy.mockResolvedValue(1);

    await unlikeComment(mockReq, mockRes, mockNext);

    expect(models.UserLikeComment.destroy).toHaveBeenCalledOnce();
    expect(models.Comment.decrement).toHaveBeenCalledWith('likeCount', { where: { id: testCommentId } });
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        liked: false,
        likeCount: 0
      },
      msg: 'Unlike operation success'
    });
  });

  it('should keep count unchanged when repeat unlike request, no negative count', async () => {
    models.UserLikeComment.findOne.mockResolvedValue(null);
    checkIdempotency.mockResolvedValue({ isDuplicate: false });
    models.Comment.findByPk.mockResolvedValue({ id: testCommentId, likeCount: 0 });

    await unlikeComment(mockReq, mockRes, mockNext);

    expect(models.UserLikeComment.destroy).not.toHaveBeenCalled();
    expect(models.Comment.decrement).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        liked: false,
        likeCount: 0
      },
      msg: 'Unlike operation success'
    });
  });

  it('should throw NotFoundError when target comment not exists for like action', async () => {
    models.Comment.findByPk.mockResolvedValue(null);

    await likeComment(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    expect(models.UserLikeComment.create).not.toHaveBeenCalled();
    expect(models.Comment.increment).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when target comment not exists for unlike action', async () => {
    models.Comment.findByPk.mockResolvedValue(null);

    await unlikeComment(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    expect(models.UserLikeComment.destroy).not.toHaveBeenCalled();
    expect(models.Comment.decrement).not.toHaveBeenCalled();
  });

  it('should return correct state when like count is 100 after multiple valid likes', async () => {
    models.UserLikeComment.findOne.mockResolvedValue(null);
    checkIdempotency.mockResolvedValue({ isDuplicate: false });
    models.Comment.findByPk.mockResolvedValue({ id: testCommentId, likeCount: 99 });
    models.UserLikeComment.create.mockResolvedValue({});

    await likeComment(mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        liked: true,
        likeCount: 100
      },
      msg: 'Like operation success'
    });
  });

  it('should not allow like count go below 0 even with abnormal decrement operation', async () => {
    models.UserLikeComment.findOne.mockResolvedValue(null);
    checkIdempotency.mockResolvedValue({ isDuplicate: false });
    models.Comment.findByPk.mockResolvedValue({ id: testCommentId, likeCount: 0 });

    await unlikeComment(mockReq, mockRes, mockNext);

    expect(models.Comment.decrement).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      data: {
        liked: false,
        likeCount: 0
      },
      msg: 'Unlike operation success'
    });
  });
});