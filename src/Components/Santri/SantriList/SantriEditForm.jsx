import "./santri.css";

export default function SantriEditForm({
  editNama,
  setEditNamaState,
  saveEdit,
  cancel,
}) {
  return (
    <div className="santri-edit-box">
      <input
        className="santri-input"
        value={editNama}
        onChange={(e) => setEditNamaState(e.target.value)}
      />

      <button className="santri-save-btn" onClick={saveEdit}>
        Simpan
      </button>
      <button className="santri-cancel-btn" onClick={cancel}>
        Batal
      </button>
    </div>
  );
}
