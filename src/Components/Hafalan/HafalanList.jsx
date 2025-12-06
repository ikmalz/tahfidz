import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useSettings } from "../../context/settingsContext";
import "./HafalanList.css";

export default function HafalanList() {
  const { settings } = useSettings();
  const [santri, setSantri] = useState([]);
  const [hafalan, setHafalan] = useState([]);
  const [kelas, setKelas] = useState("");
  const [selectedSantri, setSelectedSantri] = useState("");
  const [surah, setSurah] = useState("");
  const [ayatAwal, setAyatAwal] = useState("");
  const [ayatAkhir, setAyatAkhir] = useState("");
  const [status, setStatus] = useState("setor");
  
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterSantri, setFilterSantri] = useState("");
  const [filterSurah, setFilterSurah] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = settings?.tahfidz?.itemsPerPage || 10;
  const [totalPages, setTotalPages] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk edit modal
  const [editModal, setEditModal] = useState(null);
  const [editSurah, setEditSurah] = useState("");
  const [editAyatAwal, setEditAyatAwal] = useState("");
  const [editAyatAkhir, setEditAyatAkhir] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editTanggal, setEditTanggal] = useState("");
  
  // State untuk popup notification
  const [notification, setNotification] = useState(null);

  // Load data santri
  const loadSantri = async () => {
    try {
      const { data, error } = await supabase
        .from("santri")
        .select("id, nama, kelas")
        .order("nama", { ascending: true });

      if (error) throw error;
      setSantri(data || []);
    } catch (err) {
      console.error("Error loading santri:", err);
      showNotification("Gagal memuat data santri", "error");
    }
  };

  useEffect(() => {
    loadSantri();
  }, []);

  // Load data hafalan
  const loadHafalan = async () => {
    setLoadingData(true);
    setError(null);
    
    try {
      let query = supabase
        .from("hafalan")
        .select(`
          id,
          tanggal,
          surah,
          ayat_awal,
          ayat_akhir,
          status,
          created_at,
          santri:santri_id(id, nama, kelas)
        `, { count: "exact" })
        .order("tanggal", { ascending: false });

      if (filterTanggal) {
        query = query.eq("tanggal", filterTanggal);
      }
      
      if (filterSantri) {
        query = query.eq("santri_id", filterSantri);
      }
      
      if (filterSurah) {
        query = query.ilike("surah", `%${filterSurah}%`);
      }
      
      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }

      const from = (currentPage - 1) * perPage;
      const to = from + perPage - 1;
      
      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      
      setHafalan(data || []);
      setTotalPages(Math.ceil((count || 0) / perPage));
    } catch (err) {
      console.error("Error loading hafalan:", err);
      showNotification("Gagal memuat data hafalan", "error");
      setHafalan([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadHafalan();
  }, [currentPage, filterTanggal, filterSantri, filterSurah, filterStatus]);

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAdd = async () => {
    if (!selectedSantri) {
      showNotification("Pilih santri terlebih dahulu!", "error");
      return;
    }
    
    if (!surah || !surah.trim()) {
      showNotification("Masukkan nama surah!", "error");
      return;
    }
    
    if (!ayatAwal || isNaN(ayatAwal) || parseInt(ayatAwal) <= 0) {
      showNotification("Ayat awal harus angka positif!", "error");
      return;
    }
    
    if (!ayatAkhir || isNaN(ayatAkhir) || parseInt(ayatAkhir) <= 0) {
      showNotification("Ayat akhir harus angka positif!", "error");
      return;
    }
    
    if (parseInt(ayatAwal) > parseInt(ayatAkhir)) {
      showNotification("Ayat awal tidak boleh lebih besar dari ayat akhir!", "error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("hafalan").insert([
        {
          santri_id: selectedSantri,
          surah: surah.trim(),
          ayat_awal: parseInt(ayatAwal),
          ayat_akhir: parseInt(ayatAkhir),
          status: status,
          tanggal: new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;
      
      showNotification("Hafalan berhasil ditambahkan!", "success");
      
      // Reset form
      setSurah("");
      setAyatAwal("");
      setAyatAkhir("");
      setSelectedSantri("");
      setStatus("setor");
      
      // Reload data
      loadHafalan();
    } catch (err) {
      console.error("Error adding hafalan:", err);
      showNotification("Gagal menambahkan hafalan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHafalan = async () => {
    if (!editModal) return;
    
    if (!editSurah || !editSurah.trim()) {
      showNotification("Masukkan nama surah!", "error");
      return;
    }
    
    if (!editAyatAwal || isNaN(editAyatAwal) || parseInt(editAyatAwal) <= 0) {
      showNotification("Ayat awal harus angka positif!", "error");
      return;
    }
    
    if (!editAyatAkhir || isNaN(editAyatAkhir) || parseInt(editAyatAkhir) <= 0) {
      showNotification("Ayat akhir harus angka positif!", "error");
      return;
    }
    
    if (parseInt(editAyatAwal) > parseInt(editAyatAkhir)) {
      showNotification("Ayat awal tidak boleh lebih besar dari ayat akhir!", "error");
      return;
    }

    try {
      const { error } = await supabase
        .from("hafalan")
        .update({ 
          surah: editSurah.trim(),
          ayat_awal: parseInt(editAyatAwal),
          ayat_akhir: parseInt(editAyatAkhir),
          status: editStatus,
          tanggal: editTanggal
        })
        .eq("id", editModal.id);

      if (error) throw error;
      
      setEditModal(null);
      loadHafalan();
      showNotification("Data hafalan berhasil diperbarui!", "success");
    } catch (err) {
      console.error("Error updating hafalan:", err);
      showNotification("Gagal memperbarui data hafalan", "error");
    }
  };

  const handleDelete = async (id, santriName, surah) => {
    if (!window.confirm(`Hapus hafalan ${surah} milik ${santriName}?`)) return;

    try {
      const { error } = await supabase
        .from("hafalan")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      loadHafalan();
      showNotification("Hafalan berhasil dihapus!", "success");
    } catch (err) {
      console.error("Error deleting hafalan:", err);
      showNotification("Gagal menghapus hafalan", "error");
    }
  };

  const filteredSantri = useMemo(() => {
    if (!kelas) return santri;
    return santri.filter((s) => s.kelas === kelas);
  }, [santri, kelas]);

  const handleResetFilters = () => {
    setFilterTanggal("");
    setFilterSantri("");
    setFilterSurah("");
    setFilterStatus("");
    setCurrentPage(1);
    showNotification("Filter telah direset", "info");
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'setor': return 'var(--info-color)';
      case 'hafal': return 'var(--success-color)';
      case 'pending': return 'var(--warning-color)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <DashboardLayout>
      <div className={`hafalan-container theme-${settings.display.theme}`} data-theme={settings.display.theme}>
        
        {/* Notification Popup */}
        {notification && (
          <div className={`notification-popup ${notification.type}`}>
            <div className="notification-content">
              <span className="notification-icon">
                {notification.type === 'success' ? '✅' : 
                 notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="notification-message">{notification.message}</span>
            </div>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="edit-modal-overlay">
            <div className="edit-modal">
              <div className="edit-modal-header">
                <h3>✏️ Edit Data Hafalan</h3>
                <button 
                  className="close-btn"
                  onClick={() => setEditModal(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="edit-modal-body">
                <div className="edit-form">
                  <div className="edit-form-group">
                    <label>Tanggal</label>
                    <input
                      type="date"
                      className="edit-form-input"
                      value={editTanggal}
                      onChange={(e) => setEditTanggal(e.target.value)}
                    />
                  </div>
                  
                  <div className="edit-form-group">
                    <label>Surah</label>
                    <input
                      type="text"
                      className="edit-form-input"
                      value={editSurah}
                      onChange={(e) => setEditSurah(e.target.value)}
                      placeholder="Nama surah"
                    />
                  </div>
                  
                  <div className="edit-form-group">
                    <label>Ayat Awal - Akhir</label>
                    <div className="ayat-input-group">
                      <input
                        type="number"
                        className="edit-form-input ayat-input"
                        value={editAyatAwal}
                        onChange={(e) => setEditAyatAwal(e.target.value)}
                        placeholder="Awal"
                      />
                      <span className="ayat-separator">-</span>
                      <input
                        type="number"
                        className="edit-form-input ayat-input"
                        value={editAyatAkhir}
                        onChange={(e) => setEditAyatAkhir(e.target.value)}
                        placeholder="Akhir"
                      />
                    </div>
                  </div>
                  
                  <div className="edit-form-group">
                    <label>Status</label>
                    <select
                      className="edit-form-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="setor">Setor</option>
                      <option value="hafal">Hafal</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="edit-modal-footer">
                <button 
                  className="btn-cancel"
                  onClick={() => setEditModal(null)}
                >
                  Batal
                </button>
                <button 
                  className="btn-save"
                  onClick={handleUpdateHafalan}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header yang Lebih Baik */}
        <div className="hafalan-header-section">
          <div className="header-content">
            <div className="header-icon">📖</div>
            <div className="header-text">
              <h1 className="hafalan-title">Data Hafalan Santri</h1>
              <p className="hafalan-subtitle">Kelola dan pantau perkembangan hafalan santri</p>
            </div>
          </div>
        </div>

        {/* Form Tambah Hafalan */}
        <div className="hafalan-form-container">
          <div className="form-header">
            <h3>➕ Tambah Hafalan Baru</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Kelas</label>
              <select
                className="form-select"
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
            </div>

            <div className="form-group">
              <label>Santri</label>
              <select
                className="form-select"
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
            </div>

            <div className="form-group">
              <label>Surah</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nama surah"
                value={surah}
                onChange={(e) => setSurah(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Ayat Awal</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ayat awal"
                value={ayatAwal}
                onChange={(e) => setAyatAwal(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Ayat Akhir</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ayat akhir"
                value={ayatAkhir}
                onChange={(e) => setAyatAkhir(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="setor">Setor</option>
                <option value="hafal">Hafal</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="form-group form-submit">
              <button 
                className="btn-primary" 
                onClick={handleAdd} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Menambahkan...
                  </>
                ) : "Tambah Hafalan"}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="hafalan-filters-container">
          <div className="filters-header">
            <h3>🔍 Filter Data</h3>
            {(filterTanggal || filterSantri || filterSurah || filterStatus) && (
              <button 
                onClick={handleResetFilters}
                className="btn-secondary"
              >
                Reset Filter
              </button>
            )}
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>Tanggal</label>
              <input
                type="date"
                className="form-input"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Santri</label>
              <select
                className="form-select"
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
            </div>

            <div className="filter-group">
              <label>Surah</label>
              <input
                type="text"
                className="form-input"
                placeholder="Cari surah..."
                value={filterSurah}
                onChange={(e) => setFilterSurah(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="setor">Setor</option>
                <option value="hafal">Hafal</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hafalan List */}
        <div className="hafalan-content">
          <div className="hafalan-list-header">
            <div className="list-header-left">
              <span className="list-title">Daftar Hafalan</span>
              <span className="list-count">({hafalan.length} data ditemukan)</span>
            </div>
            <div className="list-header-right">
              <span className="pagination-info">
                Hal {currentPage} dari {totalPages}
              </span>
            </div>
          </div>

          {loadingData ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Memuat data hafalan...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{error}</p>
              <button onClick={loadHafalan} className="btn-retry">
                Coba Lagi
              </button>
            </div>
          ) : hafalan.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">Tidak ada data hafalan ditemukan</p>
              {(filterTanggal || filterSantri || filterSurah || filterStatus) && (
                <button 
                  onClick={handleResetFilters}
                  className="btn-clear-search"
                >
                  Tampilkan Semua Data
                </button>
              )}
            </div>
          ) : (
            <div className="hafalan-table-container">
              <div className="hafalan-table">
                {/* Table Header */}
                <div className="table-header">
                  <div className="header-cell">No</div>
                  <div className="header-cell">Tanggal</div>
                  <div className="header-cell">Santri</div>
                  <div className="header-cell">Surah</div>
                  <div className="header-cell">Ayat</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Aksi</div>
                </div>
                
                {/* Table Rows */}
                <div className="table-body">
                  {hafalan.map((h, index) => (
                    <div key={h.id} className="table-row">
                      <div className="table-cell cell-number">
                        {(currentPage - 1) * perPage + index + 1}
                      </div>
                      
                      <div className="table-cell cell-date">
                        {formatDate(h.tanggal)}
                      </div>
                      
                      <div className="table-cell cell-santri">
                        <div className="santri-info">
                          <div className="santri-name">{h.santri?.nama}</div>
                          <div className="santri-kelas">{h.santri?.kelas}</div>
                        </div>
                      </div>
                      
                      <div className="table-cell cell-surah">
                        {h.surah}
                      </div>
                      
                      <div className="table-cell cell-ayat">
                        {`${h.ayat_awal}-${h.ayat_akhir}`}
                      </div>
                      
                      <div className="table-cell cell-status">
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(h.status) }}
                        >
                          {h.status}
                        </span>
                      </div>
                      
                      <div className="table-cell cell-actions">
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => {
                              setEditModal(h);
                              setEditSurah(h.surah);
                              setEditAyatAwal(h.ayat_awal);
                              setEditAyatAkhir(h.ayat_akhir);
                              setEditStatus(h.status);
                              setEditTanggal(h.tanggal);
                            }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(h.id, h.santri?.nama, h.surah)}
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-section">
              <div className="pagination-controls">
                <button
                  className="btn-pagination"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`btn-page ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  className="btn-pagination"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
              
              <div className="pagination-summary">
                <p>
                  Menampilkan <strong>{(currentPage - 1) * perPage + 1}</strong> - <strong>{Math.min(currentPage * perPage, hafalan.length)}</strong> dari <strong>{hafalan.length}</strong> hafalan
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}