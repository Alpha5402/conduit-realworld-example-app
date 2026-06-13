import React from 'react';

const WordCount = ({ count }) => {
  const displayCount = count ?? 0;
  return (
    <div style={{ minWidth: '80px', background: '#f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
      字数: {displayCount}
    </div>
  );
};

export default WordCount;