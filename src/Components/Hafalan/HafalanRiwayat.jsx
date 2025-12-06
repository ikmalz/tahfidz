import React from "react";
import "./HafalanList.css";

const HafalanRiwayat = ({ hafalan, page, setPage, totalPages }) => {
  return (
    <div className="hafalan-riwayat-box">
      {hafalan.length === 0 ? (
        <p className="hafalan-empty">Tidak ada data hafalan.</p>
      ) : (
        <table className="hafalan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Santri</th>
              <th>Surah</th>
              <th>Ayat</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {hafalan.map((h, idx) => (
              <tr key={h.id}>
                <td>{(page - 1) * 20 + idx + 1}</td>
                <td>{h.santri?.nama}</td>
                <td>{h.surah}</td>
                <td>{h.ayat_awal}-{h.ayat_akhir}</td>
                <td>{h.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="hafalan-pagination">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            Prev
          </button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HafalanRiwayat;
