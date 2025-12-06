import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";

import AddSantri from "../AddSantri/AddSantri";
import SantriSearch from "../SantriSearch/SantriSearch";
import SantriSort from "../SantriSort/SantriSort";
import SantriPagination from "../SantriPagination/SantriPagination";
import SantriDetail from "../SantriDetail/SantriDetail";

import "./santri.css";
import "../../Dashboard/DashboardLayout.css";
import DashboardLayout from "../../Dashboard/DashboardLayout";
import { useSettings } from "../../../context/settingsContext";

export default function SantriList() {
  const { settings } = useSettings();
  const [santri, setSantri] = useState([]);
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  const perPage = settings?.tahfidz?.itemsPerPage || 10;

  const loadSantri = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("santri")
        .select("id, nama, kelas, created_at")
        .order("nama", { ascending: sort === "asc" });

      if (error) throw error;
      setSantri(data || []);
    } catch (err) {
      console.error("Error loading santri:", err);
      setError("Gagal memuat data santri. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSantri();
  }, [sort]);

  const filtered = useMemo(() => {
    if (!search) return santri;
    return santri.filter((s) =>
      s.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [santri, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    );
  }, [filtered, currentPage, perPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDelete = async (id, namaSantri) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus santri "${namaSantri}"?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const { error } = await supabase.from("santri").delete().eq("id", id);
      if (!error) {
        loadSantri();
        alert(`Santri "${namaSantri}" berhasil dihapus.`);
      } else {
        alert("Gagal menghapus santri. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Error deleting santri:", err);
      alert("Terjadi kesalahan saat menghapus santri.");
    } finally {
      setIsDeleting(null);
    }
  };

  const saveEdit = async () => {
    if (!editNama.trim()) return;

    try {
      const { error } = await supabase
        .from("santri")
        .update({ nama: editNama })
        .eq("id", editId);

      if (!error) {
        setEditId(null);
        setEditNama("");
        loadSantri();
      } else {
        alert("Gagal menyimpan perubahan.");
      }
    } catch (err) {
      console.error("Error updating santri:", err);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("santri")
        .select("nama, kelas, created_at")
        .order("nama", { ascending: true });

      if (error) throw error;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFontSize(16);
      doc.setTextColor(8, 51, 88);
      doc.text("DATA SANTRI TAHFIDZ", 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 105, 22, { align: 'center' });
      doc.text(`Total: ${data.length} santri`, 105, 27, { align: 'center' });

      const tableData = data.map((santri, index) => [
        index + 1,
        santri.nama,
        santri.kelas || '-',
        new Date(santri.created_at).toLocaleDateString('id-ID')
      ]);

      doc.autoTable({
        startY: 35,
        head: [['No', 'Nama', 'Kelas']],
        body: tableData,
        headStyles: {
          fillColor: [8, 51, 88],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 35 },
        styles: {
          cellPadding: 2,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 70 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 }
        }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
        doc.text(`Sistem Manajemen Tahfidz © ${new Date().getFullYear()}`, 105, 290, { align: 'center' });
      }

      const fileName = `Data-Santri-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      alert(`Data ${data.length} santri berhasil diexport ke PDF!`);
    } catch (err) {
      console.error("Error exporting to PDF:", err);
      alert("Gagal mengexport data ke PDF.");
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = async () => {
    try {
      const { data, error } = await supabase
        .from("santri")
        .select("nama, kelas, created_at")
        .order("nama", { ascending: true });

      if (error) throw error;

      const exportData = {
        santri: data,
        exportedAt: new Date().toISOString(),
        total: data.length,
        settings: {
          perPage,
          sort,
          currentPage,
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const exportFileName = `santri-data-${new Date().toISOString().split('T')[0]}.json`;

      const link = document.createElement("a");
      link.setAttribute("href", dataUri);
      link.setAttribute("download", exportFileName);
      link.click();

      alert(`Data ${data.length} santri berhasil diexport ke JSON!`);
    } catch (err) {
      console.error("Error exporting santri:", err);
      alert("Gagal mengexport data santri.");
    }
  };

  const santriStats = useMemo(() => {
    const total = santri.length;
    return { total };
  }, [santri]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className={`santri-container theme-${settings.display.theme}`} data-theme={settings.display.theme}>
        {/* Header Sederhana */}
        <div className="santri-header">
          <div className="santri-title-section">
            <h1 className="santri-title">Data Santri</h1>
            <p className="santri-subtitle">Manajemen data santri tahfidz</p>
          </div>
          
          <div className="santri-actions">
            <div className="export-buttons">
              <button 
                className="btn-export btn-export-pdf"
                onClick={exportToPDF}
                title="Export ke PDF"
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <span className="spinner-small"></span>
                    Exporting...
                  </>
                ) : (
                  '📄 PDF'
                )}
              </button>
              <button 
                className="btn-export btn-export-json"
                onClick={exportToJSON}
                title="Export ke JSON"
              >
                📁 JSON
              </button>
            </div>
          </div>
        </div>

        {/* Statistik Sederhana */}
        <div className="santri-stats-container">
          <div className="santri-stats">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">Total Santri</div>
                <div className="stat-value">{santriStats.total}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="santri-toolbar">
          <div className="toolbar-left">
            <AddSantri 
              nama={nama} 
              setNama={setNama} 
              loadSantri={loadSantri} 
              theme={settings.display.theme}
            />
          </div>
          
          <div className="toolbar-right">
            <SantriSearch 
              search={search} 
              setSearch={setSearch} 
              theme={settings.display.theme}
            />
            <SantriSort 
              sort={sort} 
              setSort={setSort} 
              theme={settings.display.theme}
            />
          </div>
        </div>

        {/* Loading & Error States */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Memuat data santri...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button onClick={loadSantri} className="btn-retry">
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="santri-content">
            {/* Table Header Info */}
            <div className="santri-list-header">
              <div className="list-header-left">
                <span className="list-title">Daftar Santri</span>
                <span className="list-count">{filtered.length} santri</span>
              </div>
              <div className="list-header-right">
                {totalPages > 0 && (
                  <span className="pagination-info">
                    Hal {currentPage} dari {totalPages}
                  </span>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="santri-table-container">
              {paginated.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p className="empty-text">Tidak ada santri ditemukan</p>
                  {search && (
                    <button 
                      onClick={() => setSearch("")}
                      className="btn-clear-search"
                    >
                      Hapus pencarian
                    </button>
                  )}
                </div>
              ) : (
                <div className="santri-table">
                  {/* Table Header */}
                  <div className="table-header">
                    <div className="header-cell">No</div>
                    <div className="header-cell">Nama Santri</div>
                    <div className="header-cell">Kelas</div>
                    <div className="header-cell">Aksi</div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="table-body">
                    {paginated.map((s, index) => (
                      <div key={s.id} className={`table-row ${editId === s.id ? 'editing' : ''}`}>
                        <div className="table-cell cell-number">
                          {(currentPage - 1) * perPage + index + 1}
                        </div>
                        
                        <div className="table-cell cell-name" onClick={() => setSelectedSantri(s)}>
                          <div className="name-wrapper">
                            <div className="avatar-small">
                              {s.nama.charAt(0).toUpperCase()}
                            </div>
                            <div className="nama-info">
                              <div className="nama-santri">{s.nama}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="table-cell cell-kelas">
                          {s.kelas || '-'}
                        </div>
                        
                        <div className="table-cell cell-actions">
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-detail"
                              onClick={() => setSelectedSantri(s)}
                              title="Detail"
                            >
                              <span className="action-icon">👁️</span>
                              <span className="action-text">Detail</span>
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => {
                                setEditId(s.id);
                                setEditNama(s.nama);
                              }}
                              title="Edit"
                              disabled={isDeleting === s.id}
                            >
                              <span className="action-icon">✏️</span>
                              <span className="action-text">Edit</span>
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(s.id, s.nama)}
                              title="Hapus"
                              disabled={isDeleting === s.id}
                            >
                              {isDeleting === s.id ? (
                                <span className="spinner-tiny"></span>
                              ) : (
                                <>
                                  <span className="action-icon">🗑️</span>
                                  <span className="action-text">Hapus</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Edit Modal - Sederhana */}
            {editId && (
              <div className="edit-overlay">
                <div className="edit-modal">
                  <div className="edit-modal-header">
                    <h4>Edit Nama Santri</h4>
                    <button 
                      className="btn-close-modal"
                      onClick={() => setEditId(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="edit-modal-body">
                    <input
                      className="edit-input-modal"
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      placeholder="Masukkan nama baru"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    />
                  </div>
                  <div className="edit-modal-footer">
                    <button className="btn-cancel-modal" onClick={() => setEditId(null)}>
                      Batal
                    </button>
                    <button className="btn-save-modal" onClick={saveEdit}>
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-section">
                <SantriPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  theme={settings.display.theme}
                />
                <div className="pagination-summary">
                  <p>
                    Menampilkan <strong>{(currentPage - 1) * perPage + 1}</strong> - <strong>{Math.min(currentPage * perPage, filtered.length)}</strong> dari <strong>{filtered.length}</strong> santri
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {selectedSantri && (
          <SantriDetail
            santri={selectedSantri}
            close={() => setSelectedSantri(null)}
            theme={settings.display.theme}
          />
        )}
      </div>
    </DashboardLayout>
  );
}