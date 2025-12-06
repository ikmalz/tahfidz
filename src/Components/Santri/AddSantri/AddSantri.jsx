import { useState } from "react";
import "./AddSantri.css";
import { supabase } from "../../../supabaseClient";

export default function AddSantri({ nama, setNama, loadSantri }) {
  const [kelas, setKelas] = useState("pagi"); 

  const handleAdd = async () => {
    if (!nama.trim()) return;

    const { error } = await supabase.from("santri").insert([{ nama, kelas }]); 

    if (!error) {
      setNama("");
      loadSantri();
    }
  };

  return (
    <div className="santri-add-box">
      <input
        className="santri-input"
        value={nama}
        placeholder="Nama santri..."
        onChange={(e) => setNama(e.target.value)}
      />

      <select
        className="santri-select"
        value={kelas}
        onChange={(e) => setKelas(e.target.value)}
      >
        <option value="pagi">Pagi</option>
        <option value="siang">Siang</option>
        <option value="sore">Sore</option>
        <option value="malam">Malam</option>
      </select>

      <button className="santri-add-btn" onClick={handleAdd}>
        Tambah
      </button>
    </div>
  );
}
