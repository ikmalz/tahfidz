import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import yang lebih baik
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFileText,
  FiDownload,
  FiX,
  FiCheck,
  FiUserPlus,
} from "react-icons/fi";
import { MdDateRange } from "react-icons/md";

import AddSantri from "../AddSantri/AddSantri";
import SantriSearch from "../SantriSearch/SantriSearch";
import SantriSort from "../SantriSort/SantriSort";
import SantriPagination from "../SantriPagination/SantriPagination";
import SantriDetail from "../SantriDetail/SantriDetail";

import DashboardLayout from "../../Dashboard/DashboardLayout";
import { useSettings } from "../../../context/settingsContext";

// Tambahkan font untuk mendukung karakter Indonesia
const addFontToPDF = (doc) => {
  // Font default jsPDF sudah mendukung basic characters
  // Untuk font yang lebih baik, Anda bisa menambahkan font custom
  return doc;
};

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
    return filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  }, [filtered, currentPage, perPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDelete = async (id, namaSantri) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("santri").delete().eq("id", id);
      if (!error) {
        loadSantri();
        setShowDeleteConfirm(null);
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
      const dataToExport =
        santri.length > 0 ? santri : await loadSantriForExport();

      if (!dataToExport || dataToExport.length === 0) {
        alert("Tidak ada data santri untuk diexport.");
        setExporting(false);
        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("DATA SANTRI TAHFIDZ", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 105, 30, {
        align: "center",
      });
      doc.text(`Total: ${dataToExport.length} santri`, 105, 35, {
        align: "center",
      });

      const headers = [["No", "Nama Santri", "Kelas", "Bergabung"]];

      const tableData = dataToExport.map((santri, index) => [
        index + 1,
        santri.nama || "-",
        santri.kelas || "-",
        santri.created_at
          ? new Date(santri.created_at).toLocaleDateString("id-ID")
          : "-",
      ]);

      autoTable(doc, {
        startY: 45,
        head: headers,
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [8, 51, 88],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 45 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 70 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      doc.save(`data-santri-${new Date().getTime()}.pdf`);
      alert(`✅ Data ${dataToExport.length} santri berhasil diexport ke PDF!`);
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("❌ Gagal export PDF. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  const loadSantriForExport = async () => {
    try {
      const { data } = await supabase
        .from("santri")
        .select("nama, kelas, created_at")
        .order("nama", { ascending: true });
      return data || [];
    } catch (error) {
      console.error("Error loading data for export:", error);
      return [];
    }
  };

  const exportToPDFSimple = () => {
    setExporting(true);
    try {
      const dataToExport = filtered.length > 0 ? filtered : santri;

      if (!dataToExport || dataToExport.length === 0) {
        alert("Tidak ada data santri untuk diexport.");
        setExporting(false);
        return;
      }

      const doc = new jsPDF();

      // Judul
      doc.setFontSize(16);
      doc.text("DATA SANTRI TAHFIDZ", 105, 20, { align: "center" });

      // Tanggal
      doc.setFontSize(10);
      doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 105, 30, {
        align: "center",
      });
      doc.text(`Total: ${dataToExport.length} santri`, 105, 35, {
        align: "center",
      });

      // Header tabel
      const headers = [["No", "Nama", "Kelas", "Bergabung"]];

      // Data tabel
      const tableData = dataToExport.map((santri, index) => [
        index + 1,
        santri.nama,
        santri.kelas || "-",
        new Date(santri.created_at).toLocaleDateString("id-ID"),
      ]);

      // Buat tabel
      doc.autoTable({
        startY: 45,
        head: headers,
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [8, 51, 88],
          textColor: [255, 255, 255],
        },
        margin: { top: 45 },
      });

      // Simpan
      doc.save(`santri-${new Date().getTime()}.pdf`);
      alert(`Data ${dataToExport.length} santri berhasil diexport!`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal export PDF. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = async () => {
    try {
      const dataToExport =
        santri.length > 0 ? santri : await fetchDataForExport();

      const exportData = {
        santri: dataToExport,
        exportedAt: new Date().toISOString(),
        total: dataToExport.length,
        settings: {
          perPage,
          sort,
          currentPage,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
        dataStr
      )}`;
      const exportFileName = `santri-data-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const link = document.createElement("a");
      link.setAttribute("href", dataUri);
      link.setAttribute("download", exportFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Data ${dataToExport.length} santri berhasil diexport ke JSON!`);
    } catch (err) {
      console.error("Error exporting santri:", err);
      alert("Gagal mengexport data santri.");
    }
  };

  const fetchDataForExport = async () => {
    try {
      const { data } = await supabase
        .from("santri")
        .select("nama, kelas, created_at")
        .order("nama", { ascending: true });
      return data || [];
    } catch (error) {
      console.error("Error fetching export data:", error);
      return [];
    }
  };

  const santriStats = useMemo(() => {
    const total = santri.length;
    return { total };
  }, [santri]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isDark = settings.display.theme === "dark";

  return (
    <DashboardLayout>
      <div
        className={`min-h-screen ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        } p-4 md:p-6 font-sans transition-colors duration-300`}
      >
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-800 text-white">
                  <FiUsers className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    Data Santri
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Kelola dan pantau data santri tahfidz dengan mudah
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiFileText className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-200 font-medium shadow-sm hover:shadow"
              >
                <FiDownload className="w-4 h-4" />
                <span className="hidden sm:inline">Export JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Total Santri
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {santriStats.total}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Tampil
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {filtered.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <FiEye className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Halaman
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {currentPage}/{totalPages || 1}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <MdDateRange className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <AddSantri
                  nama={nama}
                  setNama={setNama}
                  loadSantri={loadSantri}
                  theme={settings.display.theme}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
          </div>

          {/* Table Section */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Memuat data santri...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                  <FiX className="w-8 h-8" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  {error}
                </p>
                <button
                  onClick={loadSantri}
                  className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Daftar Santri
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {filtered.length} santri ditemukan
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Hal {currentPage} dari {totalPages || 1}
                  </div>
                </div>

                {paginated.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
                      <FiUsers className="w-12 h-12" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                      Tidak ada santri ditemukan
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {search
                        ? "Coba ubah kata kunci pencarian"
                        : "Tambahkan santri baru untuk memulai"}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Hapus pencarian
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Nama Santri
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Kelas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Bergabung
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginated.map((s, index) => (
                          <tr
                            key={s.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {(currentPage - 1) * perPage + index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => setSelectedSantri(s)}
                              >
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-sm font-semibold text-white">
                                    {s.nama.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="absolute -inset-1 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-0 group-hover:opacity-50 transition-opacity -z-10"></div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {s.nama}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  s.kelas
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {s.kelas || "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(s.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedSantri(s)}
                                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Detail"
                                >
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditId(s.id);
                                    setEditNama(s.nama);
                                  }}
                                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                                  title="Edit"
                                  disabled={isDeleting === s.id}
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(s)}
                                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Hapus"
                                  disabled={isDeleting === s.id}
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <SantriPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      setCurrentPage={setCurrentPage}
                      theme={settings.display.theme}
                    />
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Menampilkan{" "}
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {(currentPage - 1) * perPage + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {Math.min(currentPage * perPage, filtered.length)}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {filtered.length}
                        </span>{" "}
                        santri
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit Modal - Modern */}
        {editId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-800 text-white">
                      <FiEdit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Edit Nama Santri
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Ubah nama santri dengan data baru
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditId(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Baru
                    </label>
                    <input
                      type="text"
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="Masukkan nama baru"
                      autoFocus
                      onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditId(null)}
                    className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2.5 bg-blue-800 text-white rounded-lg hover:bg-blue-900 font-medium flex items-center gap-2 transition-colors"
                  >
                    <FiCheck className="w-4 h-4" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      <FiTrash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Hapus Santri
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Konfirmasi penghapusan data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Apakah Anda yakin ingin menghapus santri{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    "{showDeleteConfirm.nama}"
                  </span>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(showDeleteConfirm.id, showDeleteConfirm.nama)
                    }
                    disabled={isDeleting === showDeleteConfirm.id}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting === showDeleteConfirm.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="w-4 h-4" />
                        Hapus Santri
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
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
