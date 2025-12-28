import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import "./SantriDetail.css";

export default function SantriDetail({ santri, close, theme = "light" }) {
  const [hafalan, setHafalan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const loadHafalan = async () => {
      if (!santri?.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("hafalan")
          .select("id, tanggal, surah, ayat_awal, ayat_akhir, status, created_at")
          .eq("santri_id", santri.id)
          .order("tanggal", { ascending: false });

        if (!error && data) {
          setHafalan(data);
        }
      } catch (err) {
        console.error("Error loading hafalan:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHafalan();
  }, [santri]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const hafalanStats = {
    total: hafalan.length,
    lastUpdate: hafalan.length > 0 ? hafalan[0].tanggal : null,
  };

  return (
    <div className="detail-overlay" onClick={close} data-theme={theme}>
      <div
        className="detail-container"
        onClick={(e) => e.stopPropagation()}
        data-theme={theme}
      >
        {/* Header */}
        <div className="detail-header">
          <div className="header-left">
            <div className="detail-avatar">
              {santri.nama.charAt(0).toUpperCase()}
            </div>
            <div className="header-info">
              <h3 className="detail-name">{santri.nama}</h3>
              <div className="detail-meta">
                <span className="meta-item">Kelas: {santri.kelas || "-"}</span>
                <span className="meta-divider">•</span>
                <span className="meta-item">Bergabung: {formatDate(santri.created_at)}</span>
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={close} title="Tutup">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <button
            className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Informasi
          </button>
          <button
            className={`tab-btn ${activeTab === "hafalan" ? "active" : ""}`}
            onClick={() => setActiveTab("hafalan")}
          >
            Hafalan
            {hafalan.length > 0 && (
              <span className="tab-badge">{hafalan.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="detail-content">
          {activeTab === "info" ? (
            <div className="info-section">
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Nama Santri</span>
                  <span className="info-value">{santri.nama}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Kelas</span>
                  <span className="info-value">{santri.kelas || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bergabung</span>
                  <span className="info-value">{formatDate(santri.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID Database</span>
                  <span className="info-value">{santri.id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="hafalan-section">
              {/* Hafalan Stats */}
              <div className="hafalan-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Hafalan</span>
                  <span className="stat-value">{hafalanStats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Terakhir Update</span>
                  <span className="stat-value">
                    {hafalanStats.lastUpdate
                      ? formatShortDate(hafalanStats.lastUpdate)
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Hafalan List */}
              <div className="hafalan-list-container">
                <div className="list-header">
                  <h4 className="list-title">Riwayat Hafalan</h4>
                  <span className="list-count">{hafalan.length} hafalan</span>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="spinner-small"></div>
                    <p>Memuat data hafalan...</p>
                  </div>
                ) : hafalan.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p className="empty-text">Belum ada hafalan</p>
                  </div>
                ) : (
                  <div className="hafalan-list">
                    <div className="hafalan-table">
                      <div className="hafalan-header">
                        <div className="header-cell">Tanggal</div>
                        <div className="header-cell">Surah</div>
                        <div className="header-cell">Ayat</div>
                        <div className="header-cell">Status</div>
                      </div>
                      
                      <div className="hafalan-body">
                        {hafalan.map((h) => (
                          <div key={h.id} className="hafalan-row">
                            <div className="hafalan-cell">
                              {formatShortDate(h.tanggal)}
                            </div>
                            <div className="hafalan-cell">
                              {h.surah || "-"}
                            </div>
                            <div className="hafalan-cell">
                              {h.ayat_awal}-{h.ayat_akhir}
                            </div>
                            <div className="hafalan-cell">
                              <span className={`status-badge status-${h.status || 'pending'}`}>
                                {h.status || 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="detail-footer">
          <button className="btn-close" onClick={close}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}