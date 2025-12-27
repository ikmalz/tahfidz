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

  const loadHafalan = async () => {
    setLoadingData(true);
    setError(null);

    try {
      let query = supabase
        .from("hafalan")
        .select(
          `
          id,
          tanggal,
          surah,
          ayat_awal,
          ayat_akhir,
          status,
          created_at,
          santri:santri_id(id, nama, kelas)
        `,
          { count: "exact" }
        )
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
      showNotification(
        "Ayat awal tidak boleh lebih besar dari ayat akhir!",
        "error"
      );
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

    if (
      !editAyatAkhir ||
      isNaN(editAyatAkhir) ||
      parseInt(editAyatAkhir) <= 0
    ) {
      showNotification("Ayat akhir harus angka positif!", "error");
      return;
    }

    if (parseInt(editAyatAwal) > parseInt(editAyatAkhir)) {
      showNotification(
        "Ayat awal tidak boleh lebih besar dari ayat akhir!",
        "error"
      );
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
          tanggal: editTanggal,
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
      const { error } = await supabase.from("hafalan").delete().eq("id", id);

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
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "setor":
        return "bg-blue-500";
      case "hafal":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "setor":
        return "Setor";
      case "hafal":
        return "Hafal";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
        {/* Notification Popup */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 animate-slide-in-right ${
              notification.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
                : notification.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                : "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
            } rounded-lg shadow-lg p-4 flex items-center justify-between gap-3 min-w-[300px] max-w-md border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center gap-3 z-50">
              <span className="text-lg">
                {notification.type === "success"
                  ? "✅"
                  : notification.type === "error"
                  ? "❌"
                  : "ℹ️"}
              </span>
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {notification.message}
              </span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 animate-slide-up">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-blue-500">✏️</span>
                  Edit Data Hafalan
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  onClick={() => setEditModal(null)}
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Surah
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={editSurah}
                    onChange={(e) => setEditSurah(e.target.value)}
                    placeholder="Nama surah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ayat Awal - Akhir
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-center"
                        value={editAyatAwal}
                        onChange={(e) => setEditAyatAwal(e.target.value)}
                        placeholder="Awal"
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-gray-500 dark:text-gray-400 font-medium px-1">
                        -
                      </span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-center"
                        value={editAyatAkhir}
                        onChange={(e) => setEditAyatAkhir(e.target.value)}
                        placeholder="Akhir"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="setor">Setor</option>
                    <option value="hafal">Hafal</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setEditModal(null)}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={handleUpdateHafalan}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-3xl">📖</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Data Hafalan Santri
              </h1>
              <p className="text-blue-100">
                Kelola dan pantau perkembangan hafalan santri
              </p>
            </div>
          </div>
        </div>

        {/* Form Tambah Hafalan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400">➕</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Tambah Hafalan Baru
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kelas
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Santri
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Surah
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="Nama surah"
                value={surah}
                onChange={(e) => setSurah(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ayat Awal
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="Awal"
                  value={ayatAwal}
                  onChange={(e) => setAyatAwal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ayat Akhir
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="Akhir"
                  value={ayatAkhir}
                  onChange={(e) => setAyatAkhir(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="setor">Setor</option>
                <option value="hafal">Hafal</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-1 flex items-end">
              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAdd}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <span>➕</span>
                    Tambah Hafalan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Filter Data
              </h3>
            </div>

            {(filterTanggal || filterSantri || filterSurah || filterStatus) && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Santri
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Surah
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="Cari surah..."
                value={filterSurah}
                onChange={(e) => setFilterSurah(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* List Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  Daftar Hafalan
                </span>
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                  {hafalan.length} data ditemukan
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hal {currentPage} dari {totalPages}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Memuat data hafalan...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <span className="text-2xl text-red-600 dark:text-red-400">
                  ⚠️
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                {error}
              </p>
              <button
                onClick={loadHafalan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Coba Lagi
              </button>
            </div>
          ) : hafalan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <span className="text-2xl text-gray-500 dark:text-gray-400">
                  📭
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                Tidak ada data hafalan ditemukan
              </p>
              {(filterTanggal ||
                filterSantri ||
                filterSurah ||
                filterStatus) && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Tampilkan Semua Data
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <div className="col-span-1 px-6 py-3 text-center">No</div>
                  <div className="col-span-2 px-6 py-3">Tanggal</div>
                  <div className="col-span-3 px-6 py-3">Santri</div>
                  <div className="col-span-2 px-6 py-3">Surah</div>
                  <div className="col-span-1 px-6 py-3 text-center">Ayat</div>
                  <div className="col-span-2 px-6 py-3 text-center">Status</div>
                  <div className="col-span-1 px-6 py-3 text-center">Aksi</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {hafalan.map((h, index) => (
                    <div
                      key={h.id}
                      className="grid grid-cols-12 items-center hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <div className="col-span-1 px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {(currentPage - 1) * perPage + index + 1}
                      </div>

                      <div className="col-span-2 px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
                        {formatDate(h.tanggal)}
                      </div>

                      <div className="col-span-3 px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {h.santri?.nama}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {h.santri?.kelas}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {h.surah}
                      </div>

                      <div className="col-span-1 px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-300">
                        {`${h.ayat_awal}-${h.ayat_akhir}`}
                      </div>

                      <div className="col-span-2 px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                            h.status
                          )}`}
                        >
                          {getStatusText(h.status)}
                        </span>
                      </div>

                      <div className="col-span-1 px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            onClick={() =>
                              handleDelete(h.id, h.santri?.nama, h.surah)
                            }
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
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan <strong>{(currentPage - 1) * perPage + 1}</strong>{" "}
                  -{" "}
                  <strong>
                    {Math.min(currentPage * perPage, hafalan.length)}
                  </strong>{" "}
                  dari <strong>{hafalan.length}</strong> hafalan
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </button>

                  <div className="flex items-center gap-1">
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
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
