import axios from "axios";
import errorHandler from "../helpers/errorHandler";

// prettier-ignore
async function getArticles({ headers, limit = 3, location, page = 0, tagName, username, status }) {
  try {
    const url = {
      favorites: `api/articles?favorited=${username}&&limit=${limit}&&offset=${page}${status ? `&&status=${status}` : ''}`,
      feed: `api/articles/feed?limit=${limit}&&offset=${page}${status ? `&&status=${status}` : ''}`,
      global: `api/articles?limit=${limit}&&offset=${page}${status ? `&&status=${status}` : ''}`,
      profile: `api/articles?author=${username}&&limit=${limit}&&offset=${page}${status ? `&&status=${status}` : ''}`,
      tag: `api/articles?tag=${tagName}&&limit=${limit}&&offset=${page}${status ? `&&status=${status}` : ''}`,
    };

    const { data } = await axios({ url: url[location], headers });

    return data;
  } catch (error) {
    errorHandler(error);
  }
}

export default getArticles;
