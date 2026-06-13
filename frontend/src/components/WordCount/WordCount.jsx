import { useMemo } from 'react';
import { getWordCount } from '../../helpers/wordCount';

const WordCount = ({ body }) => {
  const count = useMemo(() => getWordCount(body), [body]);
  return <span className="word-count" aria-label={`${count}字`}>{count}字</span>;
};

export default WordCount;