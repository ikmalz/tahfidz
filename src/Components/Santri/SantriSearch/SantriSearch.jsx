import React from 'react';
import './SantriSearch.css';

const SantriSearch = ({ search, setSearch, theme }) => {
  return (
    <div className="santri-search" data-theme={theme}>
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Cari nama santri..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {search && (
          <button 
            className="search-clear"
            onClick={() => setSearch('')}
            title="Hapus pencarian"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SantriSearch;