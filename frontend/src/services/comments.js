import axios from 'axios';

/**
 * 生成客户端唯一请求ID，用于后端幂等校验
 * @returns {string} 唯一请求ID字符串
 */
const generateUniqueRequestId = () => {
  return `comment-like-${Date.now()}-${Math.random().toString(36).slice(2, 18)}`;
};

/**
 * 评论点赞/取消点赞统一接口封装，完全匹配后端接口契约
 * @param {number|string} commentId 目标评论ID
 * @returns {Promise<Object>} 接口返回数据，包含liked布尔值和likeCount数字
 */
export const toggleCommentLike = async (commentId) => {
  const token = localStorage.getItem('token');
  const requestId = generateUniqueRequestId();

  const response = await axios.post(
    `/api/comments/${commentId}/like`,
    {
      requestId
    },
    {
      headers: {
        Authorization: token ? `Token ${token}` : ''
      }
    }
  );

  return response.data;
};