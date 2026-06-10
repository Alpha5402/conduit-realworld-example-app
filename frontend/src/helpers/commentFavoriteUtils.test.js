import { describe, it, expect } from 'vitest';
import {
  updateCommentFavoriteState,
  generateIdempotencyToken,
  validateIdempotencyToken
} from './commentFavoriteUtils';

describe('commentFavoriteUtils - 点赞状态计算纯逻辑测试', () => {
  describe('updateCommentFavoriteState', () => {
    it('点赞成功场景：未点赞状态下接口返回成功，正确更新为已点赞，点赞数+1', () => {
      const originalState = {
        isFavorited: false,
        favoriteCount: 5
      };
      const apiResponse = {
        isFavorited: true,
        favoriteCount: 6
      };
      const newState = updateCommentFavoriteState(originalState, apiResponse, true);
      expect(newState.isFavorited).toBe(true);
      expect(newState.favoriteCount).toBe(6);
      // 验证原状态不可变，没有被直接修改
      expect(originalState.isFavorited).toBe(false);
      expect(originalState.favoriteCount).toBe(5);
    });

    it('取消点赞成功场景：已点赞状态下接口返回成功，正确更新为未点赞，点赞数-1', () => {
      const originalState = {
        isFavorited: true,
        favoriteCount: 12
      };
      const apiResponse = {
        isFavorited: false,
        favoriteCount: 11
      };
      const newState = updateCommentFavoriteState(originalState, apiResponse, false);
      expect(newState.isFavorited).toBe(false);
      expect(newState.favoriteCount).toBe(11);
    });

    it('点赞接口失败场景：传入空错误响应，本地状态完全不发生变化', () => {
      const originalState = {
        isFavorited: false,
        favoriteCount: 3
      };
      const newState = updateCommentFavoriteState(originalState, null, true);
      expect(newState).toEqual(originalState);
      expect(newState.isFavorited).toBe(false);
      expect(newState.favoriteCount).toBe(3);
    });

    it('取消点赞接口失败场景：本地已点赞状态完全保留，点赞数不变化', () => {
      const originalState = {
        isFavorited: true,
        favoriteCount: 8
      };
      const newState = updateCommentFavoriteState(originalState, undefined, false);
      expect(newState.isFavorited).toBe(true);
      expect(newState.favoriteCount).toBe(8);
    });

    it('幂等重复请求场景：接口返回状态与本地当前状态一致，状态不发生额外变更', () => {
      const originalState = {
        isFavorited: true,
        favoriteCount: 7
      };
      const apiResponse = {
        isFavorited: true,
        favoriteCount: 7
      };
      const newState = updateCommentFavoriteState(originalState, apiResponse, true);
      expect(newState.isFavorited).toBe(true);
      expect(newState.favoriteCount).toBe(7);
    });

    it('后端计数与本地预期不一致场景：完全信任后端返回的点赞数，不使用本地计算值', () => {
      const originalState = {
        isFavorited: false,
        favoriteCount: 5
      };
      const apiResponse = {
        isFavorited: true,
        favoriteCount: 10
      };
      const newState = updateCommentFavoriteState(originalState, apiResponse, true);
      expect(newState.isFavorited).toBe(true);
      expect(newState.favoriteCount).toBe(10);
    });

    it('点赞数为0的边界场景：取消点赞后计数不会小于0，保持合法值', () => {
      const originalState = {
        isFavorited: true,
        favoriteCount: 1
      };
      const apiResponse = {
        isFavorited: false,
        favoriteCount: 0
      };
      const newState = updateCommentFavoriteState(originalState, apiResponse, false);
      expect(newState.favoriteCount).toBe(0);
      expect(newState.isFavorited).toBe(false);
    });

    it('接口返回负数异常点赞数场景：直接使用后端返回值，后续同步服务端状态', () => {
      const originalState = {
        isFavorited: true,
        favoriteCount: 5
      };
      const apiResponse = {
        isFavorited: false,
        favoriteCount: -1
      };
      const newState = updateCommentFavoriteState(originalState, apiResponse, false);
      expect(newState.favoriteCount).toBe(-1);
    });
  });

  describe('generateIdempotencyToken', () => {
    it('连续生成两次幂等令牌，返回值不重复，保证客户端生成的令牌唯一性', () => {
      const token1 = generateIdempotencyToken();
      const token2 = generateIdempotencyToken();
      expect(token1).not.toBe(token2);
      expect(typeof token1).toBe('string');
      expect(token1.length).toBeGreaterThan(10);
    });
  });

  describe('validateIdempotencyToken', () => {
    it('合法格式的幂等令牌校验通过，非法空值令牌校验不通过', () => {
      const validToken = 'abc123-xyz789-123456';
      expect(validateIdempotencyToken(validToken)).toBe(true);
      expect(validateIdempotencyToken('')).toBe(false);
      expect(validateIdempotencyToken(null)).toBe(false);
      expect(validateIdempotencyToken(undefined)).toBe(false);
    });

    it('长度不足10位的短令牌直接校验不通过，保证令牌有效性', () => {
      const shortToken = '12345';
      expect(validateIdempotencyToken(shortToken)).toBe(false);
    });
  });
});