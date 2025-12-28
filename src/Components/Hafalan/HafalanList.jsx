import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useSettings } from "../../context/settingsContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./HafalanList.css";

jsPDF.autoTable = autoTable;

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

  // State untuk export modal
  const [exportModal, setExportModal] = useState(false);
  const [exportSantriId, setExportSantriId] = useState("");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

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

  // Show notification function dengan z-index yang lebih tinggi
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

  const formatDatePDF = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
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

  const exportAllToPDF = async () => {
    setExportLoading(true);

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
      `
        )
        .order("tanggal", { ascending: false });

      if (exportStartDate) {
        query = query.gte("tanggal", exportStartDate);
      }

      if (exportEndDate) {
        query = query.lte("tanggal", exportEndDate);
      }

      if (exportSantriId) {
        query = query.eq("santri_id", exportSantriId);
      }

      if (exportStatus) {
        query = query.eq("status", exportStatus);
      }

      const { data: hafalanData, error } = await query;

      if (error) throw error;

      if (!hafalanData || hafalanData.length === 0) {
        showNotification("Tidak ada data untuk di-export", "warning");
        setExportLoading(false);
        return;
      }

      const doc = new jsPDF(exportSantriId ? "portrait" : "landscape");

      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");

      let title = "LAPORAN DATA HAFALAN SANTRI";
      let subtitle = "";

      if (exportSantriId) {
        const selectedSantri = santri.find((s) => s.id === exportSantriId);
        if (selectedSantri) {
          title = `LAPORAN HAFALAN SANTRI`;
          subtitle = `${selectedSantri.nama.toUpperCase()} - ${selectedSantri.kelas.toUpperCase()}`;
        }
      }

      const filterInfo = [];
      if (exportStartDate)
        filterInfo.push(`Dari: ${formatDatePDF(exportStartDate)}`);
      if (exportEndDate)
        filterInfo.push(`Sampai: ${formatDatePDF(exportEndDate)}`);
      if (exportStatus)
        filterInfo.push(`Status: ${getStatusText(exportStatus)}`);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(title, doc.internal.pageSize.width / 2, 15, { align: "center" });

      if (subtitle) {
        doc.setFontSize(12);
        doc.text(subtitle, doc.internal.pageSize.width / 2, 23, {
          align: "center",
        });
      }

      doc.setFillColor(245, 245, 245);
      doc.rect(0, 30, doc.internal.pageSize.width, 25, "F");

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      const exportDate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let infoY = 37;

      doc.text(`Dibuat: ${exportDate}`, 14, infoY);
      doc.text(`Total Data: ${hafalanData.length}`, 14, infoY + 5);

      if (filterInfo.length > 0) {
        doc.text(
          `Filter: ${filterInfo.join(" | ")}`,
          doc.internal.pageSize.width / 2,
          infoY,
          { align: "center" }
        );
      }

      const stats = {
        setor: hafalanData.filter((h) => h.status === "setor").length,
        hafal: hafalanData.filter((h) => h.status === "hafal").length,
        pending: hafalanData.filter((h) => h.status === "pending").length,
      };

      const statsText = `Setor: ${stats.setor}  |  Hafal: ${stats.hafal}  |  Pending: ${stats.pending}`;
      doc.text(statsText, doc.internal.pageSize.width - 14, infoY, {
        align: "right",
      });

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, 52, doc.internal.pageSize.width - 14, 52);

      const tableData = hafalanData.map((h, index) => [
        index + 1,
        formatDatePDF(h.tanggal),
        h.santri?.nama || "-",
        h.santri?.kelas || "-",
        h.surah,
        `${h.ayat_awal} - ${h.ayat_akhir}`,
        getStatusText(h.status),
      ]);

      autoTable(doc, {
        startY: 57,
        head: [
          ["NO", "TANGGAL", "NAMA SANTRI", "KELAS", "SURAH", "AYAT", "STATUS"],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 51, 51],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: "linebreak",
          cellWidth: "auto",
        },
        columnStyles: {
          0: {
            cellWidth: 20,
            halign: "center",
          },
          1: {
            cellWidth: 35,
            halign: "center",
          },
          2: {
            cellWidth: 50,
            halign: "left",
          },
          3: {
            cellWidth: 30,
            halign: "center",
          },
          4: {
            cellWidth: 50,
            halign: "left",
          },
          5: {
            cellWidth: 25,
            halign: "center",
          },
          6: {
            cellWidth: 30,
            halign: "center",
            cellStyles: {
              setor: { fillColor: [66, 135, 245], textColor: 255 },
              hafal: { fillColor: [46, 204, 113], textColor: 255 },
              pending: { fillColor: [255, 193, 7], textColor: [51, 51, 51] },
            },
          },
        },
        margin: { left: 14, right: 14 },
        didDrawCell: function (data) {
          if (data.column.index === 6 && data.cell.raw) {
            const status = hafalanData[data.row.index - 1]?.status;
            if (status) {
              switch (status) {
                case "setor":
                  doc.setFillColor(66, 135, 245);
                  break;
                case "hafal":
                  doc.setFillColor(46, 204, 113);
                  break;
                case "pending":
                  doc.setFillColor(255, 193, 7);
                  break;
              }
              doc.rect(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                "F"
              );
              doc.setTextColor(status === "pending" ? [51, 51, 51] : 255);
              doc.text(
                data.cell.raw,
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2 + 3,
                {
                  align: "center",
                  baseline: "middle",
                }
              );
              return false; 
            }
          }
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);

        doc.setDrawColor(200, 200, 200);
        doc.line(
          14,
          doc.internal.pageSize.height - 20,
          doc.internal.pageSize.width - 14,
          doc.internal.pageSize.height - 20
        );

        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 15,
          { align: "center" }
        );

        doc.text(
          `© ${new Date().getFullYear()} Tahfidz Management System`,
          doc.internal.pageSize.width - 14,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
      }

      if (hafalanData.length === 0) {
        doc.setFontSize(72);
        doc.setTextColor(200, 200, 200);
        doc.setFont("helvetica", "bold");
        doc.text(
          "TIDAK ADA DATA",
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height / 2,
          { align: "center", angle: 45 }
        );
      }

      let fileName = "laporan-hafalan-santri.pdf";
      if (exportSantriId) {
        const selectedSantri = santri.find((s) => s.id === exportSantriId);
        if (selectedSantri) {
          const timestamp = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");
          fileName = `hafalan-${selectedSantri.nama
            .toLowerCase()
            .replace(/\s+/g, "-")}-${timestamp}.pdf`;
        }
      } else {
        const timestamp = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");
        fileName = `laporan-hafalan-${timestamp}.pdf`;
      }

      doc.save(fileName);

      setExportModal(false);
      setExportSantriId("");
      setExportStartDate("");
      setExportEndDate("");
      setExportStatus("");

      showNotification("Laporan PDF berhasil diunduh!", "success");
    } catch (err) {
      console.error("Error exporting PDF:", err);
      showNotification("Gagal membuat laporan PDF", "error");
    } finally {
      setExportLoading(false);
    }
  };

  const exportSingleSantriPDF = async (santriId, santriName) => {
    try {
      const { data: hafalanData, error } = await supabase
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
        `
        )
        .eq("santri_id", santriId)
        .order("tanggal", { ascending: false });

      if (error) throw error;

      if (!hafalanData || hafalanData.length === 0) {
        showNotification(
          `Tidak ada data hafalan untuk ${santriName}`,
          "warning"
        );
        return;
      }

      // Membuat PDF
      const doc = new jsPDF();

      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Laporan Hafalan Santri", 105, 15, { align: "center" });

      // Detail santri
      const santriDetail = hafalanData[0]?.santri;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Nama Santri: ${santriName}`, 14, 25);
      doc.text(`Kelas: ${santriDetail?.kelas || "-"}`, 14, 32);

      // Informasi dokumen
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const exportDate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Total Hafalan: ${hafalanData.length}`, 14, 40);
      doc.text(`Dibuat pada: ${exportDate}`, 14, 45);

      // Menghitung statistik
      const statusCount = {
        setor: hafalanData.filter((h) => h.status === "setor").length,
        hafal: hafalanData.filter((h) => h.status === "hafal").length,
        pending: hafalanData.filter((h) => h.status === "pending").length,
      };

      doc.text(
        `Setor: ${statusCount.setor} | Hafal: ${statusCount.hafal} | Pending: ${statusCount.pending}`,
        14,
        50
      );

      // Membuat tabel data
      const tableData = hafalanData.map((h, index) => [
        index + 1,
        formatDatePDF(h.tanggal),
        h.surah,
        `${h.ayat_awal}-${h.ayat_akhir}`,
        getStatusText(h.status),
        getStatusText(h.status) === "Hafal" ? "✓" : "",
      ]);

      // AutoTable - menggunakan cara yang benar
      autoTable(doc, {
        startY: 60,
        head: [["No", "Tanggal", "Surah", "Ayat", "Status", "Hafal?"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [46, 204, 113],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
        },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Simpan PDF
      const fileName = `hafalan-${santriName
        .toLowerCase()
        .replace(/\s+/g, "-")}.pdf`;
      doc.save(fileName);

      showNotification(
        `PDF hafalan ${santriName} berhasil diexport!`,
        "success"
      );
    } catch (err) {
      console.error("Error exporting single santri PDF:", err);
      showNotification("Gagal mengexport PDF", "error");
    }
  };

  // Fungsi untuk export semua data tanpa filter
  const exportAllDataPDF = () => {
    setExportSantriId("");
    setExportStartDate("");
    setExportEndDate("");
    setExportStatus("");
    exportAllToPDF();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 md:p-6 transition-colors duration-200">
        {/* Notification Popup - Responsive dengan z-index tinggi */}
        {notification && (
          <div
            className={`fixed top-4 right-3 left-3 md:left-auto md:right-4 z-[10000] animate-slide-in-right ${
              notification.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
                : notification.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                : "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
            } rounded-lg shadow-lg p-4 flex items-center justify-between gap-3 w-full md:min-w-[300px] md:max-w-md border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center gap-3 z-[10001] flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">
                {notification.type === "success"
                  ? "✅"
                  : notification.type === "error"
                  ? "❌"
                  : "ℹ️"}
              </span>
              <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                {notification.message}
              </span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0 ml-2"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Edit Modal - Responsive */}
        {editModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-3 md:p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-3 md:mx-auto border border-gray-200 dark:border-gray-700 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
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

              <div className="p-4 md:p-6 space-y-4">
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
                  <div className="flex items-center justify-between gap-2">
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

              <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors order-2 sm:order-1"
                  onClick={() => setEditModal(null)}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium order-1 sm:order-2"
                  onClick={handleUpdateHafalan}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {exportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-3 md:p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-3 md:mx-auto border border-gray-200 dark:border-gray-700 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-green-500">📊</span>
                  Export Data ke PDF
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  onClick={() => setExportModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <span>ℹ️</span> Informasi Export
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Anda dapat mengexport semua data hafalan atau data spesifik
                    berdasarkan filter tertentu.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Santri (Opsional)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={exportSantriId}
                    onChange={(e) => setExportSantriId(e.target.value)}
                  >
                    <option value="">Semua Santri</option>
                    {santri.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kelas})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tanggal Awal (Opsional)
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tanggal Akhir (Opsional)
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status (Opsional)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={exportStatus}
                    onChange={(e) => setExportStatus(e.target.value)}
                  >
                    <option value="">Semua Status</option>
                    <option value="setor">Setor</option>
                    <option value="hafal">Hafal</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setExportModal(false)}
                  disabled={exportLoading}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={exportAllToPDF}
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengexport...
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      Export ke PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section - Responsive */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-xl md:text-3xl">📖</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">
                Data Hafalan Santri
              </h1>
              <p className="text-blue-100 text-sm md:text-base">
                Kelola dan pantau perkembangan hafalan santri
              </p>
            </div>
            <div className="flex gap-2 justify-center md:justify-end">
              <button
                className="px-3 py-2 md:px-4 md:py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                onClick={() => setExportModal(true)}
              >
                <span>📊</span>
                <span className="hidden md:inline">Export Data</span>
                <span className="md:hidden">Export</span>
              </button>
              <button
                className="px-3 py-2 md:px-4 md:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                onClick={exportAllDataPDF}
              >
                <span>📥</span>
                <span className="hidden md:inline">Export Semua</span>
                <span className="md:hidden">Semua</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Tambah Hafalan - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm md:text-base">
                ➕
              </span>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
              Tambah Hafalan Baru
            </h3>
          </div>

          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ayat
                </label>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-center"
                      placeholder="Awal"
                      value={ayatAwal}
                      onChange={(e) => setAyatAwal(e.target.value)}
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-gray-500 dark:text-gray-400 font-medium px-2">
                      sampai
                    </span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-center"
                      placeholder="Akhir"
                      value={ayatAkhir}
                      onChange={(e) => setAyatAkhir(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  className="w-full px-4 py-3 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  onClick={handleAdd}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden md:inline">Menambahkan...</span>
                      <span className="md:hidden">Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      <span className="hidden md:inline">Tambah Hafalan</span>
                      <span className="md:hidden">Tambah</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm md:text-base">
                  🔍
                </span>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                Filter Data
              </h3>
            </div>

            {(filterTanggal || filterSantri || filterSurah || filterStatus) && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs md:text-sm font-medium self-start sm:self-auto"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-sm"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Santri
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-sm"
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
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Surah
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-sm"
                placeholder="Cari surah..."
                value={filterSurah}
                onChange={(e) => setFilterSurah(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-sm"
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

        {/* Hafalan List - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* List Header */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-semibold text-gray-800 dark:text-white">
                  Daftar Hafalan
                </span>
                <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                  {hafalan.length} data
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Hal {currentPage} dari {totalPages}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-16">
              <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3 md:mb-4"></div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Memuat data hafalan...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3 md:mb-4">
                <span className="text-xl md:text-2xl text-red-600 dark:text-red-400">
                  ⚠️
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 text-center mb-3 md:mb-4">
                {error}
              </p>
              <button
                onClick={loadHafalan}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-medium"
              >
                Coba Lagi
              </button>
            </div>
          ) : hafalan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 md:mb-4">
                <span className="text-xl md:text-2xl text-gray-500 dark:text-gray-400">
                  📭
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 text-center mb-3 md:mb-4">
                Tidak ada data hafalan ditemukan
              </p>
              {(filterTanggal ||
                filterSantri ||
                filterSurah ||
                filterStatus) && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm font-medium"
                >
                  Tampilkan Semua Data
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {hafalan.map((h, index) => (
                  <div
                    key={h.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {h.santri?.nama}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {h.santri?.kelas}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(
                          h.status
                        )}`}
                      >
                        {getStatusText(h.status)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Surah:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {h.surah}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Ayat:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {`${h.ayat_awal}-${h.ayat_akhir}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Tanggal:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(h.tanggal)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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
                        <span className="text-sm">✏️</span>
                      </button>
                      <button
                        className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        onClick={() =>
                          exportSingleSantriPDF(h.santri?.id, h.santri?.nama)
                        }
                        title="Export PDF"
                      >
                        <span className="text-sm">📥</span>
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        onClick={() =>
                          handleDelete(h.id, h.santri?.nama, h.surah)
                        }
                        title="Hapus"
                      >
                        <span className="text-sm">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <div className="col-span-1 px-6 py-3 text-center">No</div>
                    <div className="col-span-2 px-6 py-3">Tanggal</div>
                    <div className="col-span-2 px-6 py-3">Santri</div>
                    <div className="col-span-2 px-6 py-3">Surah</div>
                    <div className="col-span-1 px-6 py-3 text-center">Ayat</div>
                    <div className="col-span-2 px-6 py-3 text-center">
                      Status
                    </div>
                    <div className="col-span-2 px-6 py-3 text-center">Aksi</div>
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

                        <div className="col-span-2 px-6 py-4">
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

                        <div className="col-span-2 px-6 py-4 text-center">
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
                              className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              onClick={() =>
                                exportSingleSantriPDF(
                                  h.santri?.id,
                                  h.santri?.nama
                                )
                              }
                              title="Export PDF Santri"
                            >
                              📥
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
            </>
          )}

          {/* Pagination - Responsive */}
          {totalPages > 1 && (
            <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  Menampilkan <strong>{(currentPage - 1) * perPage + 1}</strong>{" "}
                  -{" "}
                  <strong>
                    {Math.min(currentPage * perPage, hafalan.length)}
                  </strong>{" "}
                  dari <strong>{hafalan.length}</strong> hafalan
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs md:text-sm font-medium"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </button>

                  <div className="flex items-center gap-0.5 md:gap-1">
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
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-lg text-xs md:text-sm font-medium transition-colors ${
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
                    className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs md:text-sm font-medium"
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
