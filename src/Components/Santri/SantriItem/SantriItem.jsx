import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import "./SantriItem.css";

export default function SantriItem({
  s,
  loadSantri,
  setSelectedSantri,
  editId,
  setEditId,
  editNama,
  setEditNama,
  theme = "light"
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = editId === s.id;

  const saveEdit = async () => {
    if (!editNama.trim()) return;

    const { error } = await supabase
      .from("santri")
      .update({ nama: editNama })
      .eq("id", s.id);

    if (!error) {
      setEditId(null);
      setEditNama("");
      loadSantri();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus santri "${s.nama}"?`)) {
      return;
    }

    setIsDeleting(true);
    const { error } = await supabase.from("santri").delete().eq("id", s.id);

    if (!error) {
      loadSantri();
      alert(`Santri "${s.nama}" berhasil dihapus.`);
    } else {
      alert("Gagal menghapus santri. Silakan coba lagi.");
    }
    setIsDeleting(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={`santri-item ${isEditing ? 'editing' : ''}`} data-theme={theme}>
      {isEditing ? (
        <div className="santri-edit-mode">
          <div className="edit-header">
            <span className="edit-label">✏️ Edit Nama Santri</span>
          </div>
          <div className="edit-content">
            <input
              className="santri-edit-input"
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              placeholder="Masukkan nama baru"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
            />
            <div className="edit-actions">
              <button className="btn-save" onClick={saveEdit}>
                <span className="btn-icon">💾</span>
                <span className="btn-text">Simpan</span>
              </button>
              <button className="btn-cancel" onClick={() => setEditId(null)}>
                <span className="btn-icon">❌</span>
                <span className="btn-text">Batal</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="santri-card">
          <div 
            className="santri-avatar"
            onClick={() => setSelectedSantri(s)}
            title="Klik untuk detail"
          >
            <span className="avatar-text">
              {s.nama.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="santri-main-info" onClick={() => setSelectedSantri(s)}>
            <div className="santri-header-row">
              <div className="santri-name-wrapper">
                <h3 className="santri-name">{s.nama}</h3>
                <span className={`status-badge ${s.status === 'aktif' ? 'active' : 'inactive'}`}>
                  {s.status === 'aktif' ? '🟢 Aktif' : '⚪ Nonaktif'}
                </span>
              </div>
            </div>
            
            <div className="santri-details-grid">
              {s.kelas && (
                <div className="detail-item">
                  <span className="detail-icon">🏫</span>
                  <span className="detail-label">Kelas:</span>
                  <span className="detail-text">{s.kelas}</span>
                </div>
              )}
              
              {s.jenis_kelamin && (
                <div className="detail-item">
                  <span className="detail-icon">
                    {s.jenis_kelamin === 'L' ? '👦' : '👧'}
                  </span>
                  <span className="detail-label">Jenis Kelamin:</span>
                  <span className="detail-text">
                    {s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
              )}
              
              {s.tanggal_lahir && (
                <div className="detail-item">
                  <span className="detail-icon">🎂</span>
                  <span className="detail-label">Tanggal Lahir:</span>
                  <span className="detail-text">
                    {formatDate(s.tanggal_lahir)}
                  </span>
                </div>
              )}
              
              {s.alamat && (
                <div className="detail-item detail-address">
                  <span className="detail-icon">📍</span>
                  <span className="detail-label">Alamat:</span>
                  <span className="detail-text" title={s.alamat}>
                    {s.alamat.length > 40 ? s.alamat.substring(0, 40) + '...' : s.alamat}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="santri-action-buttons">
            <button
              className="btn-action btn-detail"
              onClick={() => setSelectedSantri(s)}
              title="Lihat detail lengkap"
            >
              <span className="btn-icon">👁️</span>
              <span className="btn-text">Detail</span>
            </button>

            <button
              className="btn-action btn-edit"
              onClick={() => {
                setEditId(s.id);
                setEditNama(s.nama);
              }}
              title="Edit data santri"
              disabled={isDeleting}
            >
              <span className="btn-icon">✏️</span>
              <span className="btn-text">Edit</span>
            </button>

            <button 
              className="btn-action btn-delete"
              onClick={handleDelete}
              title="Hapus santri"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-small"></span>
                  <span className="btn-text">Hapus</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🗑️</span>
                  <span className="btn-text">Hapus</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}