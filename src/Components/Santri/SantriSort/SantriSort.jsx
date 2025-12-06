import React from 'react';
import './SantriSort.css';

const SantriSort = ({ sort, setSort, theme }) => {
  return (
    <div className="santri-sort" data-theme={theme}>
      <div className="sort-container">
        <span className="sort-icon">↕️</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="sort-select"
        >
          <option value="asc">A → Z (Ascending)</option>
          <option value="desc">Z → A (Descending)</option>
        </select>
        <span className="sort-arrow">▼</span>
      </div>
    </div>
  );
};

export default SantriSort;