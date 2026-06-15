import axios from 'axios';

export default async function updateArticle(slug, data) {
  const response = await axios.put(`/api/articles/${slug}`, data);
  return response.data;
}