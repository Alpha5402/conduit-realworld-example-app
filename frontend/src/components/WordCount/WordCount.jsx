import countWords from "../../utils/countWords";

function WordCount({ body }) {
  if (!body) {
    return null;
  }

  const wordCount = countWords(body);

  return <p>{wordCount} words</p>;
}

export default WordCount;