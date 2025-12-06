import React from "react";
import "./HafalanList.css";

const HafalanFilters = ({
  filterTanggal,
  setFilterTanggal,
  filterSantri,
  setFilterSantri,
  filterSurah,
  setFilterSurah,
  santri,
}) => {
  return (
    <div className="hafalan-filters">
      <input
        type="date"
        className="hafalan-input"
        value={filterTanggal}
        onChange={(e) => setFilterTanggal(e.target.value)}
      />

      <select
        className="hafalan-select"
        value={filterSantri}
        onChange={(e) => setFilterSantri(e.target.value)}
      >
        <option value="">Semua Santri</option>
        {santri.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nama}
          </option>
        ))}
      </select>

      <input
        type="text"
        className="hafalan-input"
        placeholder="Filter Surah..."
        value={filterSurah}
        onChange={(e) => setFilterSurah(e.target.value)}
      />
    </div>
  );
};

export default HafalanFilters;
