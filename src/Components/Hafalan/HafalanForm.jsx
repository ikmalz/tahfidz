import React from "react";
import "./HafalanList.css";

const HafalanForm = ({
  santri,
  kelas,
  setKelas,
  selectedSantri,
  setSelectedSantri,
  surah,
  setSurah,
  ayatAwal,
  setAyatAwal,
  ayatAkhir,
  setAyatAkhir,
  handleAdd,
  loading,
}) => {
  const filteredSantri = kelas ? santri.filter((s) => s.kelas === kelas) : [];

  return (
    <div className="hafalan-form">
      <select
        className="hafalan-select"
        value={kelas}
        onChange={(e) => {
          setKelas(e.target.value);
          setSelectedSantri("");
        }}
      >
        <option value="">Pilih Kelas</option>
        <option value="pagi">Kelas Pagi</option>
        <option value="siang">Kelas Siang</option>
        <option value="sore">Kelas Sore</option>
        <option value="malam">Kelas Malam</option>
      </select>

      <select
        className="hafalan-select"
        value={selectedSantri}
        onChange={(e) => setSelectedSantri(e.target.value)}
        disabled={!kelas}
      >
        <option value="">Pilih Santri</option>
        {filteredSantri.length === 0 ? (
          <option disabled>Tidak ada santri</option>
        ) : (
          filteredSantri.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama}
            </option>
          ))
        )}
      </select>

      <input
        type="text"
        className="hafalan-input"
        placeholder="Nama Surah"
        value={surah}
        onChange={(e) => setSurah(e.target.value)}
      />

      <input
        type="number"
        className="hafalan-input"
        placeholder="Ayat Awal"
        value={ayatAwal}
        onChange={(e) => setAyatAwal(e.target.value)}
      />

      <input
        type="number"
        className="hafalan-input"
        placeholder="Ayat Akhir"
        value={ayatAkhir}
        onChange={(e) => setAyatAkhir(e.target.value)}
      />

      <button className="hafalan-btn" onClick={handleAdd} disabled={loading}>
        {loading && <div className="spinner"></div>}
        {loading ? "Menambahkan..." : "Tambah Hafalan"}
      </button>
    </div>
  );
};

export default HafalanForm;
